// app/clients/page.tsx — the per-client ICP documents driving the scoring.
import { listIcpClients, loadIcp } from '@/lib/icp';
import PageShell from '@/components/leads/PageShell';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const ids = await listIcpClients();
  const docs = await Promise.all(ids.map(async (id) => ({ id, body: await loadIcp(id) })));

  return (
    <PageShell
      active="/clients"
      title="Clients"
      subtitle="One ideal-customer profile per client, kept as an editable document. Every score is judged against the selected client's profile."
      hasMockData={false}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {docs.map((d) => (
          <div key={d.id} className="rounded-lg border border-pq-ash bg-white p-4">
            <h2 className="mb-2 font-mono text-[13px] font-semibold text-pq-ink">{d.id}</h2>
            <pre className="whitespace-pre-wrap font-app text-[12.5px] leading-relaxed text-pq-slate">
              {d.body.replace(/^#.*\n/, '').trim()}
            </pre>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
