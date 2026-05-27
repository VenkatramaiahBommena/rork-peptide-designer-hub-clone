/**
 * PeptiForge Backend API — Cloudflare Worker entrypoint.
 *
 * Routes:
 *   /api/peptides/generate  — Generate peptide sequences
 *   /api/peptides/save      — Save peptide to user collection
 *   /api/peptides/saved     — Get user's saved peptides
 *   /api/peptides/:id       — Delete a saved peptide
 *   /api/user/activity      — Get user activity profile
 *   /api/auth/register      — Register a new user
 *   /api/auth/login         — Login
 *   /api/user-data/*        — Proxied to PeptideStore DO
 */

export { PeptideStore } from "./peptide-store";

interface Peptide {
  id: string;
  sequence: string;
  length: number;
  dockingScore: number;
  bindingAffinity: number;
  stability: number;
  specificity: number;
  solubility: number;
  membranePermeability: number;
  unnaturalCount: number;
  targetId: string;
  createdAt: string;
}

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

type Env = {
  DO: Fetcher;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Auth routes handled inline (in-memory, since Rork Auth not provisioned)
    if (path === "/api/auth/register" && request.method === "POST") {
      return handleRegister(request);
    }
    if (path === "/api/auth/login" && request.method === "POST") {
      return handleLogin(request);
    }

    // Peptide generation — compute client-side but record activity
    if (path === "/api/peptides/generate" && request.method === "POST") {
      return handleGenerate(request, env);
    }

    // Proxy remaining peptide/user-data routes to PeptideStore DO
    if (path.startsWith("/api/peptides/") || path.startsWith("/api/user/")) {
      return proxyToDO(request, env, "PeptideStore");
    }

    return json({ error: "not found" }, 404);
  },
} satisfies ExportedHandler<Env>;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// ─── In-memory auth (since Rork Auth not provisioned) ───
// In a real deployment, swap this for Rork Auth or a proper auth system.

interface UserRecord { id: string; email: string; password: string; name: string; }
const USERS: Map<string, UserRecord> = new Map();

async function handleRegister(request: Request): Promise<Response> {
  const body = await request.json() as { email?: string; password?: string; name?: string };
  const { email, password, name } = body;
  if (!email || !password || !name) return json({ error: "Missing fields" }, 400);
  if (USERS.has(email)) return json({ error: "Email already registered" }, 409);

  const id = `user-${crypto.randomUUID().slice(0, 8)}`;
  USERS.set(email, { id, email, password, name });

  const token = btoa(JSON.stringify({ sub: id, email, name }));
  return json({ token, user: { id, email, name } });
}

async function handleLogin(request: Request): Promise<Response> {
  const body = await request.json() as { email?: string; password?: string };
  const { email, password } = body;
  if (!email || !password) return json({ error: "Missing fields" }, 400);

  const user = USERS.get(email);
  if (!user || user.password !== password) return json({ error: "Invalid credentials" }, 401);

  const token = btoa(JSON.stringify({ sub: user.id, email: user.email, name: user.name }));
  return json({ token, user: { id: user.id, email: user.email, name: user.name } });
}

async function handleGenerate(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as { targetId?: string; count?: number };
  const { targetId, count = 5 } = body;

  // Record activity in DO
  const doReq = new Request(
    `https://internal/api/user/activity`,
    { method: "POST", body: JSON.stringify({ target: targetId || "unknown", count }) },
  );
  doReq.headers.set("X-Rork-DO-Class", "PeptideStore");
  doReq.headers.set("X-Rork-DO-Id", request.headers.get("X-Rork-User-Id") || "anonymous");
  try { await env.DO.fetch(doReq); } catch (_) { /* non-critical */ }

  // Generation is done client-side; server just logs activity
  return json({ ok: true, recorded: true });
}

function proxyToDO(request: Request, env: Env, className: string): Promise<Response> {
  const url = new URL(request.url);
  const userId = request.headers.get("X-Rork-User-Id") || "anonymous";

  // Rewrite path: /api/peptides/save -> /save, /api/peptides/delete/:id -> /delete/:id, etc.
  let doPath = url.pathname;
  if (doPath === "/api/peptides/save") doPath = "/save";
  else if (doPath === "/api/peptides/saved") doPath = "/saved";
  else if (doPath === "/api/user/activity") doPath = "/activity";
  else if (doPath.startsWith("/api/peptides/")) {
    const peptideId = doPath.replace("/api/peptides/", "");
    doPath = `/delete/${peptideId}`;
  }

  const doUrl = `https://internal${doPath}`;
  const wrapped = new Request(doUrl, request);
  wrapped.headers.set("X-Rork-DO-Class", className);
  wrapped.headers.set("X-Rork-DO-Id", userId);

  return env.DO.fetch(wrapped).then((r) => {
    // Add CORS headers to DO responses
    const corsResponse = new Response(r.body, r);
    for (const [k, v] of Object.entries(CORS)) {
      corsResponse.headers.set(k, v);
    }
    return corsResponse;
  });
}
