'use client';
// components/leads/LeadsTable.tsx — the lead ledger: filterable table,
// expandable rows with the score rationale. Data is mono; status is a dot.
import { useMemo, useState } from 'react';
import type { ScoredLead } from '@/lib/score';
import { Mono, MockChip, Select, TierChip } from '@/components/ui';

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
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {/* segmented tier filter */}
        <div className="flex overflow-hidden rounded-md border border-pq-ash">
          {['ALL', 'HOT', 'REVIEW', 'COLD'].map((t, i) => (
            <button
              key={t}
              onClick={() => setTier(t)}
              className={`h-8 px-3 text-[12px] font-medium ${i > 0 ? 'border-l border-pq-ash' : ''} ${
                tier === t ? 'bg-pq-mist text-pq-ink' : 'bg-white text-pq-fog hover:text-pq-ink'
              }`}
            >
              {t === 'ALL' ? 'All' : t}
            </button>
          ))}
        </div>
        <div className="ml-auto w-44">
          <Select value={client} onChange={(e) => setClient(e.target.value)}>
            <option value="ALL">All clients</option>
            {clients.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-pq-ash">
        <table className="w-full text-left text-[13px]">
          <thead className="border-b border-pq-ash text-[11px] uppercase tracking-wide text-pq-fog">
            <tr>
              <th className="px-3 py-2 font-medium">Domain</th>
              <th className="px-3 py-2 font-medium">Client</th>
              <th className="px-3 py-2 font-medium">Score</th>
              <th className="px-3 py-2 font-medium">Tier</th>
              <th className="px-3 py-2 font-medium">Scored</th>
              <th className="w-8 px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => {
              const key = `${l.domain}-${l.clientId}-${l.scoredAt}`;
              return (
                <Row key={key} lead={l} isOpen={open === key} onToggle={() => setOpen(open === key ? null : key)} />
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-10 text-center text-[13px] text-pq-fog">
                  No leads match this filter. Run <Mono>npm run batch</Mono> to score the test set.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ lead, isOpen, onToggle }: { lead: ScoredLead; isOpen: boolean; onToggle: () => void }) {
  return (
    <>
      <tr onClick={onToggle} className="cursor-pointer border-b border-pq-ash last:border-b-0 hover:bg-pq-alt">
        <td className="px-3 py-2">
          <Mono className="text-pq-ink">{lead.domain}</Mono>
          {lead.mock && (
            <span className="ml-2 align-middle">
              <MockChip />
            </span>
          )}
        </td>
        <td className="px-3 py-2 text-pq-slate">{lead.clientId}</td>
        <td className="px-3 py-2">
          <Mono className="font-medium text-pq-ink">{lead.score}/10</Mono>
        </td>
        <td className="px-3 py-2">
          <TierChip tier={lead.tier} />
        </td>
        <td className="px-3 py-2 text-pq-fog">{new Date(lead.scoredAt).toLocaleDateString()}</td>
        <td className="px-3 py-2 text-center text-pq-silver">{isOpen ? '–' : '+'}</td>
      </tr>
      {isOpen && (
        <tr className="border-b border-pq-ash bg-pq-alt last:border-b-0">
          <td colSpan={6} className="px-4 py-3">
            <dl className="grid gap-x-8 gap-y-2 text-[13px] sm:grid-cols-2">
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
      <dt className="text-[11px] font-medium text-pq-fog">{label}</dt>
      <dd className="mt-0.5 leading-relaxed text-pq-charcoal">{value}</dd>
    </div>
  );
}
