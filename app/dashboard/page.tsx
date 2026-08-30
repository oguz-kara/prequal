// app/dashboard/page.tsx — per-client agency view: volume, HOT rate,
// tier distribution. Portfolio Card 1 screenshot comes from here.
import { listLeads } from '@/lib/store';
import PageShell from '@/components/leads/PageShell';
import { Card, CardBody, Mono, TierChip } from '@/components/ui';
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

const barColor = { hot: 'bg-[#c2410c]', review: 'bg-[#ca8a04]', cold: 'bg-pq-smoke' };

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
        active="/dashboard"
        title="Dashboard"
        subtitle="Lead qualification across clients. Paid enrichment runs on HOT leads only — everything below that line never costs a credit."
        hasMockData={leads.some((l) => l.mock)}
      >
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <Stat label="Leads processed" value={String(totals.leads)} />
          <Stat
            label="HOT rate"
            value={totals.leads ? `${Math.round((totals.hot / totals.leads) * 100)}%` : '—'}
            hint={`${totals.hot} HOT leads`}
          />
          <Stat label="Enrichment calls avoided" value={String(totals.enrichSaved)} hint="non-HOT leads skip paid providers" />
        </div>

        <div className="divide-y divide-pq-ash rounded-lg border border-pq-ash">
          {stats.map((s) => (
            <div key={s.clientId} className="p-4">
              <div className="mb-2 flex items-baseline justify-between">
                <h2 className="text-[14px] font-medium text-pq-ink">{s.clientId}</h2>
                <span className="text-[12px] text-pq-fog">
                  <Mono>{s.total}</Mono> leads · avg <Mono>{s.avgScore.toFixed(1)}/10</Mono>
                </span>
              </div>
              <div className="flex h-1.5 overflow-hidden rounded-sm bg-pq-mist">
                {s.hot > 0 && <div className={barColor.hot} style={{ width: `${(s.hot / s.total) * 100}%` }} />}
                {s.review > 0 && <div className={barColor.review} style={{ width: `${(s.review / s.total) * 100}%` }} />}
                {s.cold > 0 && <div className={barColor.cold} style={{ width: `${(s.cold / s.total) * 100}%` }} />}
              </div>
              <div className="mt-2 flex gap-5 text-[12px] text-pq-fog">
                <span className="flex items-center gap-1.5">
                  <TierChip tier="HOT" /> <Mono>{s.hot}</Mono>
                </span>
                <span className="flex items-center gap-1.5">
                  <TierChip tier="REVIEW" /> <Mono>{s.review}</Mono>
                </span>
                <span className="flex items-center gap-1.5">
                  <TierChip tier="COLD" /> <Mono>{s.cold}</Mono>
                </span>
              </div>
            </div>
          ))}
          {stats.length === 0 && (
            <p className="p-10 text-center text-[13px] text-pq-fog">
              No data yet — run <Mono>npm run batch</Mono> to score the test set.
            </p>
          )}
        </div>
    </PageShell>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardBody>
        <p className="text-[12px] font-medium text-pq-fog">{label}</p>
        <p className="mt-1 font-mono text-[22px] font-medium tracking-tight text-pq-ink">{value}</p>
        {hint && <p className="mt-0.5 text-[12px] text-pq-fog">{hint}</p>}
      </CardBody>
    </Card>
  );
}
