'use client';
// components/score/ScoreForm.tsx — product entry: paste domains, pick the
// client whose ICP to score against, get scored results.
import { useState } from 'react';
import type { ScoredLead } from '@/lib/score';
import { Button, Card, CardBody, Label, MockChip, Mono, Select, Textarea, TextLink, TierChip } from '@/components/ui';

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
    <div className="max-w-3xl">
      <Card>
        <CardBody>
          <div className="mb-4 grid gap-4 sm:grid-cols-[220px_1fr]">
            <div>
              <Label htmlFor="client">Client</Label>
              <Select id="client" value={client} onChange={(e) => setClient(e.target.value)}>
                {clients.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <p className="self-end pb-1.5 text-[12px] leading-snug text-pq-fog">
              Leads are scored against this client's ideal-customer profile — the same domain can be HOT for one
              client and COLD for another. <TextLink href="/clients">View ICPs</TextLink>
            </p>
          </div>
          <Label htmlFor="domains">Domains</Label>
          <Textarea
            id="domains"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            placeholder={'One per line or comma-separated:\nacme.com\nexample.io'}
          />
          <div className="mt-3 flex items-center gap-3">
            <Button onClick={run} disabled={running || !input.trim()}>
              {running ? 'Scoring…' : 'Score leads'}
            </Button>
            <span className="text-[12px] text-pq-fog">
              Research → Claude scores against the ICP → HOT goes to Slack and HubSpot, deduped.
            </span>
          </div>
        </CardBody>
      </Card>

      {errors.length > 0 && (
        <Card className="mt-4 border-[#c2410c]/40">
          <CardBody className="text-[13px] text-[#9a3412]">
            {errors.map((e) => (
              <p key={e}>{e}</p>
            ))}
          </CardBody>
        </Card>
      )}

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-[13px] font-medium text-pq-fog">
            Results — saved to <TextLink href="/leads">Leads</TextLink>
          </h2>
          <div className="divide-y divide-pq-ash rounded-lg border border-pq-ash">
            {results.map((r) => (
              <div key={`${r.domain}-${r.scoredAt}`} className="p-4">
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <Mono className="font-medium text-pq-ink">{r.domain}</Mono>
                  <Mono className="text-pq-ink">{r.score}/10</Mono>
                  <TierChip tier={r.tier} />
                  {r.mock && <MockChip />}
                  <span className="ml-auto">
                    <TextLink href={`/research?url=${encodeURIComponent(r.domain)}`}>Deep research</TextLink>
                  </span>
                </div>
                <dl className="grid gap-x-8 gap-y-2 text-[13px] sm:grid-cols-2">
                  {(
                    [
                      ['Fit', r.fit],
                      ['Signal', r.signal],
                      ['Timing', r.timing],
                      ['Suggested opener', r.opener],
                    ] as const
                  ).map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-[11px] font-medium text-pq-fog">{label}</dt>
                      <dd className="mt-0.5 leading-relaxed text-pq-charcoal">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
