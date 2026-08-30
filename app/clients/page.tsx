// app/clients/page.tsx — the per-client ICP documents driving the scoring.
import { listIcpClients, loadIcp } from '@/lib/icp';
import PageShell from '@/components/leads/PageShell';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const ids = await listIcpClients();
  const docs = await Promise.all(ids.map(async (id) => ({ id, body: await loadIcp(id) })));

  return (
    <PageShell
      title="Clients & ICPs"
      subtitle="Each client has an editable ICP document (data/icp/*.md) — Claude scores every lead against the selected client's profile"
      hasMockData={false}
    >
      <div className="grid gap-4 md:grid-cols-2">
        {docs.map((d) => (
          <div key={d.id} className="rounded-xl border border-pq-ash bg-white p-5">
            <h2 className="mb-3 font-semibold text-pq-ink">{d.id}</h2>
            <pre className="whitespace-pre-wrap font-app text-[13px] leading-relaxed text-pq-slate">
              {d.body.replace(/^#.*\n/, '').trim()}
            </pre>
          </div>
        ))}
      </div>
    </PageShell>
  );
}
