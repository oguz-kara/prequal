// lib/score.ts — core Prequal logic: research a domain with Exa, then have
// Claude score it 0–10 against a per-client ICP document with a rationale.
// Used by both the /api/score route and scripts/batch.mts.
import Exa from 'exa-js';
import { anthropic } from '@ai-sdk/anthropic';
import { generateObject } from 'ai';
import { z } from 'zod';
import { loadIcp } from './icp';

export const scoreSchema = z.object({
  score: z.number().int().min(0).max(10),
  fit: z.string().describe('One sentence: how well the company matches the ICP profile'),
  signal: z.string().describe('One sentence: the strongest positive or negative buying signal found'),
  timing: z.string().describe('One sentence: why now is or is not a good moment to reach out'),
  opener: z.string().describe('One personalized cold-outreach opening sentence referencing something concrete about the company'),
});

export type Tier = 'HOT' | 'REVIEW' | 'COLD';

export interface ScoredLead {
  domain: string;
  clientId: string;
  score: number;
  tier: Tier;
  fit: string;
  signal: string;
  timing: string;
  opener: string;
  researchSummary: string;
  usage: { inputTokens: number; outputTokens: number };
  durationMs: number;
  scoredAt: string;
  mock?: boolean;
}

export function tierFor(score: number): Tier {
  return score >= 7 ? 'HOT' : score >= 4 ? 'REVIEW' : 'COLD';
}

export const isMock = () => process.env.PREQUAL_MOCK === '1';

// Deterministic fake result so UI/integration work can proceed without API
// credits. Mock output is labeled and must NEVER feed the README "Measured"
// section or portfolio cards.
function mockLead(domain: string, clientId: string): ScoredLead {
  const hash = [...domain].reduce((a, c) => a + c.charCodeAt(0), 0);
  const score = hash % 11;
  return {
    domain,
    clientId,
    score,
    tier: tierFor(score),
    fit: `[MOCK] ${domain} loosely matches the ${clientId} profile.`,
    signal: `[MOCK] Careers page suggests active hiring at ${domain}.`,
    timing: `[MOCK] No strong timing signal found for ${domain}.`,
    opener: `[MOCK] Noticed ${domain} is growing its team — quick question about your outbound stack.`,
    researchSummary: '[MOCK] No research performed (PREQUAL_MOCK=1).',
    usage: { inputTokens: 0, outputTokens: 0 },
    durationMs: 40 + (hash % 60),
    scoredAt: new Date().toISOString(),
    mock: true,
  };
}

export async function researchDomain(domain: string) {
  const exa = new Exa(process.env.EXA_API_KEY as string);
  const url = domain.startsWith('http') ? domain : `https://${domain}`;
  const result = await exa.getContents([url], {
    text: true,
    summary: {
      query:
        'What does this company do, who are its customers, roughly how large is it, and what growth or hiring signals are visible?',
    },
  });
  const page = result.results?.[0] as { summary?: string; text?: string } | undefined;
  return {
    summary: page?.summary ?? '',
    text: (page?.text ?? '').slice(0, 8000),
  };
}

export async function scoreLead(domain: string, clientId: string): Promise<ScoredLead> {
  if (isMock()) return mockLead(domain, clientId);
  const started = Date.now();
  const icp = await loadIcp(clientId);
  const research = await researchDomain(domain);

  const { object, usage } = await generateObject({
    model: anthropic(process.env.PREQUAL_MODEL ?? 'claude-sonnet-5'),
    schema: scoreSchema,
    system:
      'You are a rigorous B2B lead qualifier working for an outbound agency. ' +
      'Score honestly: most companies are NOT a good fit. Never invent facts — ' +
      'only use what the research content supports. If the evidence is thin, say so in the rationale and score conservatively.',
    prompt: `Score this company against the client's ICP on a 0-10 scale.
0-3 = clearly outside the ICP, 4-6 = partial match or thin evidence, 7-10 = strong match with visible signals.

CLIENT ICP DOCUMENT:
${icp}

COMPANY DOMAIN: ${domain}

RESEARCH SUMMARY:
${research.summary}

WEBSITE CONTENT (truncated):
${research.text}`,
  });

  return {
    domain,
    clientId,
    ...object,
    tier: tierFor(object.score),
    researchSummary: research.summary,
    usage: {
      inputTokens: usage?.promptTokens ?? 0,
      outputTokens: usage?.completionTokens ?? 0,
    },
    durationMs: Date.now() - started,
    scoredAt: new Date().toISOString(),
  };
}
