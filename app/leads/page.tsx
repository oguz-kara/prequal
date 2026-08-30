// app/leads/page.tsx — lead table over the store (server component).
import { listLeads } from '@/lib/store';
import LeadsTable from '@/components/leads/LeadsTable';
import PageShell from '@/components/leads/PageShell';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const leads = (await listLeads()).sort((a, b) => b.scoredAt.localeCompare(a.scoredAt));
  return (
    <PageShell
      title="Leads"
      subtitle={`${leads.length} scored leads — click a row for the rationale`}
      hasMockData={leads.some((l) => l.mock)}
    >
      <LeadsTable leads={leads} />
    </PageShell>
  );
}
