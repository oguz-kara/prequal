// components/leads/PageShell.tsx — app chrome: 48px topbar with underline
// tabs, compact title block. Built on the primitives in components/ui.tsx.
import Link from 'next/link';

const tabs = [
  ['Score', '/'],
  ['Leads', '/leads'],
  ['Dashboard', '/dashboard'],
  ['Clients', '/clients'],
] as const;

export default function PageShell({
  title,
  subtitle,
  hasMockData,
  active,
  children,
}: {
  title: string;
  subtitle: string;
  hasMockData: boolean;
  active?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white font-app text-pq-charcoal">
      <div className="border-b border-pq-ash">
        <nav className="mx-auto flex h-12 max-w-5xl items-stretch gap-5 px-4 sm:px-6">
          <Link href="/" className="flex items-center font-mono text-[13px] font-semibold tracking-tight text-pq-ink">
            prequal
          </Link>
          <div className="flex items-stretch gap-4">
            {tabs.map(([label, href]) => {
              const isActive = active === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center border-b-2 px-0.5 text-[13px] ${
                    isActive
                      ? 'border-pq-ink font-medium text-pq-ink'
                      : 'border-transparent text-pq-fog hover:text-pq-ink'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
          {hasMockData && (
            <span className="ml-auto flex items-center gap-1.5 text-[11px] text-pq-fog">
              <span className="h-1.5 w-1.5 rounded-[1px] bg-pq-lavender" />
              mock data — not measured results
            </span>
          )}
        </nav>
      </div>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <h1 className="text-[20px] font-semibold tracking-[-0.01em] text-pq-ink">{title}</h1>
          <p className="mt-1 max-w-2xl text-[13px] leading-relaxed text-pq-fog">{subtitle}</p>
        </header>
        {children}
      </div>
    </main>
  );
}
