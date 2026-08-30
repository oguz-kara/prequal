// app/api/score/route.ts — score one domain against a client ICP.
// POST { domain: string, client: string } → ScoredLead
import { NextRequest, NextResponse } from 'next/server';
import { scoreLead } from '@/lib/score';
import { saveLeads } from '@/lib/store';

export const maxDuration = 100;

export async function POST(req: NextRequest) {
  try {
    const { domain, client } = await req.json();
    if (!domain || !client) {
      return NextResponse.json({ error: 'domain and client are required' }, { status: 400 });
    }

    const lead = await scoreLead(domain, client);
    await saveLeads([lead]);

    return NextResponse.json(lead);
  } catch (error) {
    return NextResponse.json({ error: `Failed to score lead | ${error}` }, { status: 500 });
  }
}
