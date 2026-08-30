// lib/icp.ts — per-client ICP documents live in data/icp/<clientId>.md
import { promises as fs } from 'fs';
import path from 'path';

const ICP_DIR = path.join(process.cwd(), 'data', 'icp');

export async function listIcpClients(): Promise<string[]> {
  const files = await fs.readdir(ICP_DIR);
  return files.filter((f) => f.endsWith('.md')).map((f) => f.replace(/\.md$/, ''));
}

export async function loadIcp(clientId: string): Promise<string> {
  if (!/^[a-z0-9-]+$/.test(clientId)) {
    throw new Error(`Invalid client id: ${clientId}`);
  }
  return fs.readFile(path.join(ICP_DIR, `${clientId}.md`), 'utf-8');
}
