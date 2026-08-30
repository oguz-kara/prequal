// lib/slack.ts — v2: HOT-lead alert into Slack via incoming webhook.
import { isMock, type ScoredLead } from './score';
import type { HubspotOutcome } from './hubspot';

export async function postHotAlert(lead: ScoredLead, hubspot: HubspotOutcome): Promise<string> {
  const text = [
    `:fire: *HOT lead for ${lead.clientId}* — ${lead.domain} (${lead.score}/10)`,
    `*Fit:* ${lead.fit}`,
    `*Signal:* ${lead.signal}`,
    `*Timing:* ${lead.timing}`,
    `*Suggested opener:* ${lead.opener}`,
    `*HubSpot:* ${hubspot.detail}`,
  ].join('\n');

  if (isMock() || lead.mock) return `[MOCK] Slack alert prepared for ${lead.domain}`;
  if (!process.env.SLACK_WEBHOOK_URL) return 'skipped (SLACK_WEBHOOK_URL not set)';

  const res = await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) throw new Error(`Slack webhook → ${res.status}`);
  return 'sent';
}
