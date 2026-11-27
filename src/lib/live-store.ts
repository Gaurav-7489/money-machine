/**
 * Live counters for the landing page: people active right now (heartbeat in
 * the last minute) and people who joined (completed checkout).
 *
 * Uses Upstash Redis over REST when UPSTASH_REDIS_REST_URL / _TOKEN (or the
 * Vercel KV equivalents) are set, so numbers are shared across every server
 * instance. Without them it falls back to memory, which is accurate only for
 * a single server process (fine for development).
 */
const WINDOW_MS = 60_000;
const ACTIVE_KEY = "mm:active";
const JOINED_KEY = "mm:joined";

export type LiveCounts = { active: number; joined: number; durable: boolean };

const mem = { active: new Map<string, number>(), joined: new Set<string>() };

function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

async function pipeline(cmds: (string | number)[][]): Promise<unknown[]> {
  const r = redis()!;
  const res = await fetch(`${r.url}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${r.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis ${res.status}`);
  const out = (await res.json()) as { result?: unknown; error?: string }[];
  const bad = out.find((x) => x.error);
  if (bad) throw new Error(bad.error);
  return out.map((x) => x.result);
}

function memCounts(now: number): LiveCounts {
  for (const [id, at] of mem.active) if (at < now - WINDOW_MS) mem.active.delete(id);
  return { active: mem.active.size, joined: mem.joined.size, durable: false };
}

/** Count people active in the last minute; optionally record this visitor's heartbeat. */
export async function readCounts(visitorId?: string): Promise<LiveCounts> {
  const now = Date.now();
  if (redis()) {
    try {
      const cmds: (string | number)[][] = [];
      if (visitorId) cmds.push(["ZADD", ACTIVE_KEY, now, visitorId]);
      cmds.push(["ZREMRANGEBYSCORE", ACTIVE_KEY, "-inf", now - WINDOW_MS], ["ZCOUNT", ACTIVE_KEY, now - WINDOW_MS, "+inf"], ["SCARD", JOINED_KEY]);
      const r = await pipeline(cmds);
      return { active: Number(r[r.length - 2]), joined: Number(r[r.length - 1]), durable: true };
    } catch (e) {
      console.error("live-store: Redis unavailable, using memory", e);
    }
  }
  if (visitorId) mem.active.set(visitorId, now);
  return memCounts(now);
}

/** Record a completed checkout. Idempotent per Checkout Session id. */
export async function markJoined(sessionId: string): Promise<void> {
  if (redis()) {
    try {
      await pipeline([["SADD", JOINED_KEY, sessionId]]);
      return;
    } catch (e) {
      console.error("live-store: Redis unavailable, using memory", e);
    }
  }
  mem.joined.add(sessionId);
}
