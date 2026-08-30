'use client';
// components/leads/LeadsTable.tsx — filterable lead table (tier + client),
// expandable rows showing the score rationale and suggested opener.
import { useMemo, useState } from 'react';
import type { ScoredLead, Tier } from '@/lib/score';

const tierStyles: Record<Tier, string> = {
  HOT: 'bg-orange-100 text-orange-700 border-orange-200',
  REVIEW: 'bg-amber-50 text-amber-700 border-amber-200',
  COLD: 'bg-slate-100 text-slate-600 border-slate-200',
};

export function TierBadge({ tier }: { tier: Tier }) {
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${tierStyles[tier]}`}>
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
            className={`rounded-full border px-3 py-1 text-sm ${
              tier === t ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            {t}
          </button>
        ))}
        <select
          value={client}
          onChange={(e) => setClient(e.target.value)}
          className="ml-auto rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700"
        >
          <option value="ALL">All clients</option>
          {clients.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
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
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No leads match this filter. Run <code className="rounded bg-slate-100 px-1">npm run batch</code> first.
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
        className={`cursor-pointer border-b border-slate-100 hover:bg-slate-50 ${zebra ? 'bg-slate-50/40' : ''}`}
      >
        <td className="px-4 py-3 font-medium text-slate-800">
          {lead.domain}
          {lead.mock && (
            <span className="ml-2 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
              MOCK
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-slate-600">{lead.clientId}</td>
        <td className="px-4 py-3 font-semibold text-slate-800">{lead.score}/10</td>
        <td className="px-4 py-3">
          <TierBadge tier={lead.tier} />
        </td>
        <td className="px-4 py-3 text-slate-500">{new Date(lead.scoredAt).toLocaleDateString()}</td>
        <td className="px-4 py-3 text-slate-400">{isOpen ? '▾' : '▸'}</td>
      </tr>
      {isOpen && (
        <tr className="border-b border-slate-100 bg-slate-50/60">
          <td colSpan={6} className="px-6 py-4">
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
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
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-slate-700">{value}</dd>
    </div>
  );
}
