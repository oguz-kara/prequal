// lib/enrich.ts — v2 stub: paid enrichment runs ONLY for HOT leads.
// This is the credit-cost-control story (docs/spec.md): scrape + Claude
// reasoning are cheap and run on every lead; a paid provider (PDL/Apollo)
// would be called only here. The stub counts would-be calls so the batch
// summary can report "paid enrichment: N calls (HOT only)" honestly.
import type { ScoredLead } from './score';

let calls = 0;
export const enrichmentCalls = () => calls;

export async function enrichHotLead(lead: ScoredLead): Promise<{ stub: true; detail: string }> {
  calls++;
  return {
    stub: true,
    detail: `stub: would enrich ${lead.domain} via paid provider (call #${calls}, HOT only)`,
  };
}
