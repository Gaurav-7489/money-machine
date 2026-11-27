import { NextResponse } from "next/server";
import { readCounts } from "@/lib/live-store";

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store" };
const ID = /^[A-Za-z0-9-]{8,64}$/;

export async function GET() {
  return NextResponse.json(await readCounts(), { headers });
}

/** A visitor's heartbeat. Body: { id }. Returns the fresh counts. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { id?: unknown } | null;
  const id = typeof body?.id === "string" && ID.test(body.id) ? body.id : undefined;
  return NextResponse.json(await readCounts(id), { headers });
}
