import { NextRequest, NextResponse } from 'next/server';
import { getTool } from '@/lib/tools';

export async function POST(
  req: NextRequest,
  { params }: { params: { tool: string } }
) {
  const handler = await getTool(params.tool);
  if (!handler) {
    return NextResponse.json({ error: 'Unknown tool' }, { status: 404 });
  }

  const body = await req.json();
  const result = await handler(body);
  return NextResponse.json(result);
}
