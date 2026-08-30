'use client';
// components/score/ScoreForm.tsx — the product entry: paste one or more
// domains, pick the client whose ICP to score against, get scored cards.
import { useState } from 'react';
import Link from 'next/link';
import { TierBadge } from '@/components/leads/LeadsTable';
import type { ScoredLead } from '@/lib/score';

export default function ScoreForm({ clients }: { clients: string[] }) {
  const [client, setClient] = useState(clients[0] ?? '');
  const [input, setInput] = useState('');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<ScoredLead[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  async function run() {
    const domains = input
      .split(/[\n,;\s]+/)
      .map((d) => d.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, ''))
      .filter(Boolean);
    if (domains.length === 0 || !client) return;
    setRunning(true);
    setResults([]);
    setErrors([]);
    for (const domain of domains) {
      try {
        const res = await fetch('/api/score', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain, client }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? res.statusText);
        setResults((r) => [...r, data]);
      } catch (err) {
        setErrors((e) => [...e, `${domain}: ${err}`]);
      }
    }
    setRunning(false);
  }

  return (
    <div>
      <div className="rounded-xl border border-pq-ash bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <label className="text-[13px] font-medium text-pq-slate">Score for client</label>
          <select
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="rounded-[6px] border border-pq-ink bg-white px-3 py-1.5 text-[13px] text-pq-charcoal"
          >
            {clients.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Link href="/clients" className="text-[13px] text-pq-blue hover:underline">
            view this client's ICP →
          </Link>
          <span className="basis-full text-[12px] text-pq-fog">
            Each client has its own ideal-customer profile — the same domain can be HOT for one client and COLD for another.
          </span>
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder={'Paste domains — one per line or comma-separated\nacme.com\nexample.io'}
          className="w-full rounded-[6px] border border-pq-ink bg-white px-3 py-2 font-mono text-[13px] text-pq-charcoal placeholder:text-pq-silver focus:outline-none focus:ring-2 focus:ring-pq-blue/30"
        />
        <div className="mt-4 flex items-center gap-3">
          <button
            onClick={run}
            disabled={running || !input.trim()}
            className="rounded-lg bg-pq-ink px-5 py-2 text-[14px] font-medium text-white hover:bg-pq-charcoal disabled:opacity-40"
          >
            {running ? 'Scoring…' : 'Score leads'}
          </button>
          <span className="text-[12px] text-pq-fog">
            research → Claude scores vs ICP → HOT goes to Slack + HubSpot (deduped)
          </span>
        </div>
      </div>

      {errors.length > 0 && (
        <div className="mt-4 rounded-xl border border-pq-ash bg-pq-alt p-4 text-[13px] text-pq-tangerine">
          {errors.map((e) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 space-y-3">
          {results.map((r) => (
            <div key={`${r.domain}-${r.scoredAt}`} className="rounded-xl border border-pq-ash bg-white p-5">
              <div className="mb-2 flex items-center gap-3">
                <span className="font-medium text-pq-ink">{r.domain}</span>
                <span className="font-semibold text-pq-ink">{r.score}/10</span>
                <TierBadge tier={r.tier} />
                {r.mock && (
                  <span className="rounded-full bg-pq-mist px-2 py-0.5 text-[10px] font-semibold text-pq-lavender">
                    MOCK
                  </span>
                )}
                <Link
                  href={`/research?url=${encodeURIComponent(r.domain)}`}
                  className="ml-auto text-[13px] text-pq-blue hover:underline"
                >
                  deep research →
                </Link>
              </div>
              <dl className="grid gap-2 text-[14px] text-pq-charcoal sm:grid-cols-2">
                <div>
                  <dt className="text-[11px] font-semibold uppercase text-pq-silver">Fit</dt>
                  <dd>{r.fit}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase text-pq-silver">Signal</dt>
                  <dd>{r.signal}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase text-pq-silver">Timing</dt>
                  <dd>{r.timing}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-semibold uppercase text-pq-silver">Suggested opener</dt>
                  <dd>{r.opener}</dd>
                </div>
              </dl>
            </div>
          ))}
          <p className="text-[13px] text-pq-fog">
            Saved to{' '}
            <Link href="/leads" className="text-pq-blue hover:underline">
              Leads
            </Link>
            .
          </p>
        </div>
      )}
    </div>
  );
}
