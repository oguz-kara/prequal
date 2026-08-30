'use client';
// components/leads/LeadsTable.tsx — filterable lead table (tier + client),
// expandable rows showing the score rationale and suggested opener.
import { useMemo, useState } from 'react';
import type { ScoredLead, Tier } from '@/lib/score';

// Status badge per design system: tinted pill + colored dot + dark text.
const tierStyles: Record<Tier, { pill: string; dot: string }> = {
  HOT: { pill: 'bg-orange-50', dot: 'bg-pq-tangerine' },
  REVIEW: { pill: 'bg-yellow-50', dot: 'bg-yellow-500' },
  COLD: { pill: 'bg-pq-mist', dot: 'bg-pq-silver' },
};

export function TierBadge({ tier }: { tier: Tier }) {
  const t = tierStyles[tier];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold text-pq-charcoal ${t.pill}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${t.dot}`} />
      {tier}
    </span>
  );
}

export default function LeadsTable({ leads }: { leads: ScoredLead[] }) {
  const [tier, setTier] = useState<string>('ALL');
  const [client, setClient] = useState<string>('ALL');
  const [open, setOpen] = useState<string | null>(null);

  const clients = useMemo(() => [...new Set(leads.map((l) => l.clientId))].sort(), [leads]);
  const filtered = leads.filter(
    (l) => (tier === 'ALL' || l.tier === tier) && (client === 'ALL' || l.clientId === client)
  );

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {['ALL', 'HOT', 'REVIEW', 'COLD'].map((t) => (
          <button
            key={t}
            onClick={() => setTier(t)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-medium ${
              tier === t ? 'bg-pq-charcoal text-white' : 'text-pq-slate hover:bg-pq-mist'
            }`}
          >
            {t}
          </button>
        ))}
        <select
          value={client}
          onChange={(e) => setClient(e.target.value)}
          className="ml-auto rounded-[6px] border border-pq-ink bg-white px-3 py-1.5 text-[13px] text-pq-charcoal"
        >
          <option value="ALL">All clients</option>
          {clients.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-pq-ash bg-white">
        <table className="w-full text-left text-[14px]">
          <thead className="border-b border-pq-ash bg-pq-alt text-[11px] uppercase tracking-wide text-pq-fog">
            <tr>
              <th className="px-4 py-3">Domain</th>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Tier</th>
              <th className="px-4 py-3">Scored</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => {
              const key = `${l.domain}-${l.clientId}-${l.scoredAt}`;
              return (
                <FragmentRow
                  key={key}
                  lead={l}
                  isOpen={open === key}
                  onToggle={() => setOpen(open === key ? null : key)}
                  zebra={i % 2 === 1}
                />
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-pq-silver">
                  No leads match this filter. Run <code className="rounded bg-pq-mist px-1">npm run batch</code> first.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FragmentRow({
  lead,
  isOpen,
  onToggle,
  zebra,
}: {
  lead: ScoredLead;
  isOpen: boolean;
  onToggle: () => void;
  zebra: boolean;
}) {
  return (
    <>
      <tr
        onClick={onToggle}
        className={`cursor-pointer border-b border-pq-ash hover:bg-pq-mist/60 ${zebra ? 'bg-pq-alt' : ''}`}
      >
        <td className="px-4 py-3 font-medium text-pq-ink">
          {lead.domain}
          {lead.mock && (
            <span className="ml-2 rounded-full bg-pq-mist px-2 py-0.5 text-[10px] font-semibold text-pq-lavender">
              MOCK
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-pq-slate">{lead.clientId}</td>
        <td className="px-4 py-3 font-semibold text-pq-ink">{lead.score}/10</td>
        <td className="px-4 py-3">
          <TierBadge tier={lead.tier} />
        </td>
        <td className="px-4 py-3 text-pq-fog">{new Date(lead.scoredAt).toLocaleDateString()}</td>
        <td className="px-4 py-3 text-pq-silver">{isOpen ? '▾' : '▸'}</td>
      </tr>
      {isOpen && (
        <tr className="border-b border-pq-ash bg-pq-alt">
          <td colSpan={6} className="px-6 py-4">
            <dl className="grid gap-3 text-[14px] sm:grid-cols-2">
              <Rationale label="Fit" value={lead.fit} />
              <Rationale label="Signal" value={lead.signal} />
              <Rationale label="Timing" value={lead.timing} />
              <Rationale label="Suggested opener" value={lead.opener} />
            </dl>
          </td>
        </tr>
      )}
    </>
  );
}

function Rationale({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-pq-silver">{label}</dt>
      <dd className="mt-1 text-pq-charcoal">{value}</dd>
    </div>
  );
}
