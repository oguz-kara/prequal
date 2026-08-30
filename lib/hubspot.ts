// lib/hubspot.ts — v2: upsert a scored lead into HubSpot as a Company and,
// for HOT leads, create a Deal — but never a duplicate: if the company
// already has any associated deal, we skip and say why. This dedupe is the
// part off-the-shelf enrichment stacks skip (see docs/spec.md).
//
// Auth: HubSpot private app token (HUBSPOT_ACCESS_TOKEN). In mock mode or
// without a token, returns a simulated outcome so the pipeline stays runnable.
import { isMock, type ScoredLead } from './score';

const BASE = 'https://api.hubapi.com';

export interface HubspotOutcome {
  action: 'deal-created' | 'skipped-existing-deal' | 'company-logged' | 'simulated' | 'skipped-no-token';
  companyId?: string;
  dealId?: string;
  detail: string;
}

async function hs(pathname: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.HUBSPOT_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
  if (!res.ok) throw new Error(`HubSpot ${pathname} → ${res.status}: ${await res.text()}`);
  return res.json();
}

async function findCompanyByDomain(domain: string): Promise<string | null> {
  const data = await hs('/crm/v3/objects/companies/search', {
    method: 'POST',
    body: JSON.stringify({
      filterGroups: [{ filters: [{ propertyName: 'domain', operator: 'EQ', value: domain }] }],
      properties: ['domain', 'name'],
      limit: 1,
    }),
  });
  return data.results?.[0]?.id ?? null;
}

async function companyHasDeals(companyId: string): Promise<boolean> {
  const data = await hs(`/crm/v4/objects/companies/${companyId}/associations/deals?limit=1`);
  return (data.results?.length ?? 0) > 0;
}

export async function upsertLead(lead: ScoredLead): Promise<HubspotOutcome> {
  if (isMock() || lead.mock) {
    const existing = lead.score % 4 === 0; // deterministic "duplicate" cases for demos
    return {
      action: 'simulated',
      detail: existing
        ? `[MOCK] ${lead.domain}: existing deal found — would SKIP (dedupe)`
        : `[MOCK] ${lead.domain}: would create company + ${lead.tier === 'HOT' ? 'deal' : 'no deal (not HOT)'}`,
    };
  }
  if (!process.env.HUBSPOT_ACCESS_TOKEN) {
    return { action: 'skipped-no-token', detail: 'HUBSPOT_ACCESS_TOKEN not set' };
  }

  // 1) company upsert
  let companyId = await findCompanyByDomain(lead.domain);
  if (!companyId) {
    const created = await hs('/crm/v3/objects/companies', {
      method: 'POST',
      body: JSON.stringify({
        properties: {
          domain: lead.domain,
          name: lead.domain,
          description: `Prequal ${lead.score}/10 (${lead.tier}) for ${lead.clientId} — ${lead.fit}`,
        },
      }),
    });
    companyId = created.id as string;
  }

  if (lead.tier !== 'HOT') {
    return { action: 'company-logged', companyId, detail: `${lead.tier}: company upserted, no deal` };
  }

  // 2) dedupe: any existing deal on this company → do not create another
  if (await companyHasDeals(companyId)) {
    return { action: 'skipped-existing-deal', companyId, detail: 'existing deal found — skipped (dedupe)' };
  }

  // 3) create deal + default association to the company
  const deal = await hs('/crm/v3/objects/deals', {
    method: 'POST',
    body: JSON.stringify({
      properties: {
        dealname: `[${lead.clientId}] ${lead.domain} — Prequal ${lead.score}/10`,
        pipeline: 'default',
        dealstage: 'appointmentscheduled',
      },
    }),
  });
  await hs(`/crm/v4/objects/deals/${deal.id}/associations/default/companies/${companyId}`, {
    method: 'PUT',
  });

  return { action: 'deal-created', companyId, dealId: deal.id, detail: 'company + deal created' };
}
