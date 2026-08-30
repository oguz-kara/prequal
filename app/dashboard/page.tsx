// app/dashboard/page.tsx — per-client agency view: volume, HOT rate,
// tier distribution. The screenshot for portfolio Card 1 comes from here.
import { listLeads } from '@/lib/store';
import { TierBadge } from '@/components/leads/LeadsTable';
import PageShell from '@/components/leads/PageShell';
import type { ScoredLead } from '@/lib/score';

export const dynamic = 'force-dynamic';

interface ClientStats {
  clientId: string;
  total: number;
  hot: number;
  review: number;
  cold: number;
  avgScore: number;
}

function aggregate(leads: ScoredLead[]): ClientStats[] {
  const byClient = new Map<string, ScoredLead[]>();
  for (const l of leads) {
    byClient.set(l.clientId, [...(byClient.get(l.clientId) ?? []), l]);
  }
  return [...byClient.entries()]
    .map(([clientId, ls]) => ({
      clientId,
      total: ls.length,
      hot: ls.filter((l) => l.tier === 'HOT').length,
      review: ls.filter((l) => l.tier === 'REVIEW').length,
      cold: ls.filter((l) => l.tier === 'COLD').length,
      avgScore: ls.reduce((a, l) => a + l.score, 0) / ls.length,
    }))
    .sort((a, b) => b.total - a.total);
}

export default async function DashboardPage() {
  const leads = await listLeads();
  const stats = aggregate(leads);
  const totals = {
    leads: leads.length,
    hot: leads.filter((l) => l.tier === 'HOT').length,
    enrichSaved: leads.length - leads.filter((l) => l.tier === 'HOT').length,
  };

  return (
    <PageShell
      title="Agency Dashboard"
      subtitle="Lead qualification across clients — paid enrichment runs on HOT leads only"
      hasMockData={leads.some((l) => l.mock)}
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Leads processed" value={String(totals.leads)} />
        <StatCard
          label="HOT rate"
          value={totals.leads ? `${Math.round((totals.hot / totals.leads) * 100)}%` : '—'}
          hint={`${totals.hot} HOT leads`}
        />
        <StatCard
          label="Enrichment calls avoided"
          value={String(totals.enrichSaved)}
          hint="non-HOT leads never hit a paid provider"
        />
      </div>

      <div className="space-y-4">
        {stats.map((s) => (
          <div key={s.clientId} className="rounded-xl border border-pq-ash bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-pq-ink">{s.clientId}</h2>
              <span className="text-[13px] text-pq-fog">
                {s.total} leads · avg {s.avgScore.toFixed(1)}/10
              </span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-pq-mist">
              {s.hot > 0 && <div className="bg-pq-tangerine" style={{ width: `${(s.hot / s.total) * 100}%` }} />}
              {s.review > 0 && <div className="bg-yellow-300" style={{ width: `${(s.review / s.total) * 100}%` }} />}
              {s.cold > 0 && <div className="bg-pq-smoke" style={{ width: `${(s.cold / s.total) * 100}%` }} />}
            </div>
            <div className="mt-3 flex gap-4 text-[12px] text-pq-fog">
              <span className="flex items-center gap-1.5">
                <TierBadge tier="HOT" /> {s.hot}
              </span>
              <span className="flex items-center gap-1.5">
                <TierBadge tier="REVIEW" /> {s.review}
              </span>
              <span className="flex items-center gap-1.5">
                <TierBadge tier="COLD" /> {s.cold}
              </span>
            </div>
          </div>
        ))}
        {stats.length === 0 && (
          <p className="rounded-xl border border-dashed border-pq-smoke bg-white px-4 py-10 text-center text-pq-silver">
            No data yet — run <code className="rounded bg-pq-mist px-1">npm run batch</code> (or with{' '}
            <code className="rounded bg-pq-mist px-1">PREQUAL_MOCK=1</code>).
          </p>
        )}
      </div>
    </PageShell>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-pq-ash bg-white p-5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-pq-fog">{label}</p>
      <p className="mt-2 font-display text-3xl font-medium tracking-tight text-pq-ink">{value}</p>
      {hint && <p className="mt-1 text-[12px] text-pq-fog">{hint}</p>}
    </div>
  );
}
