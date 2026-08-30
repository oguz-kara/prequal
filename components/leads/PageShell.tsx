// components/leads/PageShell.tsx — shared shell for the app pages, in the
// project design language (docs/design-system): white canvas, 1px ash
// hairline borders, Satoshi display headings, compact Inter body.
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
    <main className="min-h-screen bg-pq-canvas font-app text-pq-charcoal">
      <div className="border-b border-pq-ash">
        <nav className="mx-auto flex max-w-5xl items-center gap-1 px-4 py-3 text-[14px] sm:px-8">
          <Link href="/" className="mr-4 font-display text-[17px] font-bold tracking-tight text-pq-ink">
            Prequal
          </Link>
          {[
            ['Score', '/'],
            ['Leads', '/leads'],
            ['Dashboard', '/dashboard'],
            ['Clients', '/clients'],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-full px-4 py-1.5 text-pq-slate hover:bg-pq-mist hover:text-pq-ink"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <header className="mb-6">
          <h1 className="font-display text-heading font-medium tracking-tight text-pq-ink" style={{ fontSize: 30 }}>
            {title}
          </h1>
          <p className="mt-1 text-[14px] leading-relaxed text-pq-fog">{subtitle}</p>
          {hasMockData && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-pq-ash bg-pq-alt px-3 py-1.5 text-[12px] font-medium text-pq-slate">
              <span className="inline-block h-2 w-2 rounded-full bg-pq-lavender" />
              Contains MOCK data (PREQUAL_MOCK=1) — demo only, not measured results.
            </p>
          )}
        </header>
        {children}
      </div>
    </main>
  );
}
