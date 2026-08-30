// scripts/batch.mts — measurement run over data/test-domains.csv.
// Usage: npm run batch [-- --limit 5] [-- --client acme-crm]
// Writes data/out/run-<timestamp>.json and appends to the lead store.
// The printed summary is the ONLY source of numbers allowed on the
// portfolio card (docs/spec.md — measurement protocol).
import { promises as fs } from 'fs';
import path from 'path';
import { isMock, scoreLead, type ScoredLead } from '../lib/score';
import { saveLeads } from '../lib/store';
import { upsertLead } from '../lib/hubspot';
import { postHotAlert } from '../lib/slack';
import { enrichHotLead, enrichmentCalls } from '../lib/enrich';

const args = process.argv.slice(2);
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};

async function main() {
  const csv = await fs.readFile(path.join(process.cwd(), 'data', 'test-domains.csv'), 'utf-8');
  let rows = csv
    .trim()
    .split('\n')
    .slice(1) // header
    .map((line) => {
      const [domain, client] = line.split(',').map((s) => s.trim());
      return { domain, client };
    });

  const clientFilter = flag('client');
  if (clientFilter) rows = rows.filter((r) => r.client === clientFilter);
  const limit = flag('limit');
  if (limit) rows = rows.slice(0, Number(limit));

  console.log(`Scoring ${rows.length} domains...\n`);
  const results: ScoredLead[] = [];
  const failures: { domain: string; error: string }[] = [];

  for (const row of rows) {
    try {
      const lead = await scoreLead(row.domain, row.client);
      results.push(lead);
      let syncNote = '';
      if (lead.tier === 'HOT') {
        const enrich = await enrichHotLead(lead);
        const hubspot = await upsertLead(lead);
        const slack = await postHotAlert(lead, hubspot);
        syncNote = `  → ${hubspot.action}; slack: ${slack}; ${enrich.detail}`;
      }
      console.log(
        `${lead.tier.padEnd(6)} ${String(lead.score).padStart(2)}/10  ${lead.domain.padEnd(24)} ${lead.clientId.padEnd(14)} ${(lead.durationMs / 1000).toFixed(1)}s${syncNote}`
      );
    } catch (err) {
      failures.push({ domain: row.domain, error: String(err) });
      console.error(`FAIL   ${row.domain}: ${err}`);
    }
  }

  const runFile = path.join(process.cwd(), 'data', 'out', `run-${Date.now()}.json`);
  await fs.mkdir(path.dirname(runFile), { recursive: true });
  await fs.writeFile(runFile, JSON.stringify({ results, failures }, null, 2));
  await saveLeads(results);

  const n = results.length;
  if (n === 0) return console.log('\nNo results.');
  const avgMs = results.reduce((a, r) => a + r.durationMs, 0) / n;
  const tokens = results.reduce(
    (a, r) => ({ in: a.in + r.usage.inputTokens, out: a.out + r.usage.outputTokens }),
    { in: 0, out: 0 }
  );
  const tiers = { HOT: 0, REVIEW: 0, COLD: 0 } as Record<string, number>;
  for (const r of results) tiers[r.tier]++;

  console.log(
    isMock()
      ? `\n--- MOCK RUN (${new Date().toISOString().slice(0, 10)}) — NOT for portfolio numbers ---`
      : `\n--- Measured (${new Date().toISOString().slice(0, 10)}) ---`
  );
  console.log(`leads scored:        ${n} (${failures.length} failed)`);
  console.log(`avg time per lead:   ${(avgMs / 1000).toFixed(1)}s`);
  console.log(`tiers:               HOT ${tiers.HOT} · REVIEW ${tiers.REVIEW} · COLD ${tiers.COLD}`);
  console.log(`tokens (in/out):     ${tokens.in} / ${tokens.out}`);
  console.log(`paid enrichment:     ${enrichmentCalls()} calls (stub, HOT-only)`);
  console.log(`run file:            ${path.relative(process.cwd(), runFile)}`);
}

main();
