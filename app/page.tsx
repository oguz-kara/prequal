// app/page.tsx — Prequal product entry: paste domains, pick a client ICP,
// score. The old Exa research view lives at /research (linked per lead).
import { listIcpClients } from '@/lib/icp';
import PageShell from '@/components/leads/PageShell';
import ScoreForm from '@/components/score/ScoreForm';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const clients = await listIcpClients();
  return (
    <PageShell
      active="/"
      title="Score leads"
      subtitle="Paste company domains. Prequal researches each one, has Claude score it 0–10 with a rationale, and routes HOT leads to Slack + HubSpot — without burning paid enrichment credits on bad leads."
      hasMockData={process.env.PREQUAL_MOCK === '1'}
    >
      <ScoreForm clients={clients} />
    </PageShell>
  );
}
