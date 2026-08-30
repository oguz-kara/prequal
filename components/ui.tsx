// components/ui.tsx — Prequal UI primitives. Every app surface is built
// from these; no page invents its own control styles.
// Language: white ground, 1px #e5e5e5 lines, near-black text, one blue for
// links/primary emphasis, data set in mono. No tinted surfaces, no pills.
import Link from 'next/link';
import type { Tier } from '@/lib/score';

/* ---------- layout ---------- */

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-pq-ash bg-white ${className}`}>{children}</div>;
}

export function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

/* ---------- controls ---------- */

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' }) {
  const styles =
    variant === 'primary'
      ? 'bg-pq-charcoal text-white hover:bg-pq-ink disabled:opacity-40'
      : 'border border-pq-ash bg-white text-pq-charcoal hover:bg-pq-mist';
  return (
    <button
      className={`h-8 rounded-md px-3.5 text-[13px] font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-pq-blue/40 ${styles} ${className}`}
      {...props}
    />
  );
}

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[12px] font-medium text-pq-slate">
      {children}
    </label>
  );
}

const fieldClass =
  'w-full rounded-md border border-pq-smoke bg-white px-2.5 text-[13px] text-pq-charcoal placeholder:text-pq-silver focus:outline-none focus:border-pq-blue focus:ring-2 focus:ring-pq-blue/20';

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldClass} h-8 ${props.className ?? ''}`} />;
}

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldClass} py-2 font-mono text-[12.5px] leading-relaxed ${props.className ?? ''}`} />;
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-[13px] text-pq-sapphire hover:underline">
      {children}
    </Link>
  );
}

/* ---------- data ---------- */

// Data (domains, scores, counts) is set in mono — the one signature of the UI.
export function Mono({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-mono text-[12.5px] ${className}`}>{children}</span>;
}

const tierColor: Record<Tier, string> = {
  HOT: 'bg-[#c2410c]',
  REVIEW: 'bg-[#ca8a04]',
  COLD: 'bg-pq-silver',
};

// Quiet status: colored 6px dot + plain text. No tinted background.
export function TierChip({ tier }: { tier: Tier }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-pq-charcoal">
      <span className={`h-1.5 w-1.5 rounded-[1px] ${tierColor[tier]}`} />
      {tier}
    </span>
  );
}

export function MockChip() {
  return (
    <span className="inline-flex items-center gap-1 rounded border border-pq-ash px-1 text-[10px] font-medium uppercase tracking-wide text-pq-fog">
      mock
    </span>
  );
}
