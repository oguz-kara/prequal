// components/leads/PageShell.tsx — shared header/nav for the agency-facing
// dashboard pages (/dashboard, /leads).
import Link from 'next/link';

export default function PageShell({
  title,
  subtitle,
  hasMockData,
  children,
}: {
  title: string;
  subtitle: string;
  hasMockData: boolean;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-8 flex items-center gap-5 text-sm text-slate-500">
          <span className="text-base font-bold tracking-tight text-slate-900">Prequal</span>
          <Link href="/" className="hover:text-slate-900">
            Research
          </Link>
          <Link href="/leads" className="hover:text-slate-900">
            Leads
          </Link>
          <Link href="/dashboard" className="hover:text-slate-900">
            Dashboard
          </Link>
        </nav>
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
          {hasMockData && (
            <p className="mt-3 inline-block rounded-md border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700">
              Contains MOCK data (PREQUAL_MOCK=1) — demo only, not measured results.
            </p>
          )}
        </header>
        {children}
      </div>
    </main>
  );
}
