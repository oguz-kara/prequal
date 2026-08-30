// lib/store.ts — v1 lead store: a local JSON file (data/out/leads.json).
// Good enough for local dev and measurement runs; replaced by Postgres in v2
// when the HubSpot upsert and the dashboard arrive (see docs/spec.md).
import { promises as fs } from 'fs';
import path from 'path';
import type { ScoredLead } from './score';

const OUT_DIR = path.join(process.cwd(), 'data', 'out');
const FILE = path.join(OUT_DIR, 'leads.json');

export async function listLeads(): Promise<ScoredLead[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export async function saveLeads(leads: ScoredLead[]): Promise<void> {
  await fs.mkdir(OUT_DIR, { recursive: true });
  const existing = await listLeads();
  await fs.writeFile(FILE, JSON.stringify([...existing, ...leads], null, 2));
}
