/**
 * PeptiForge Backend API — Cloudflare Worker + Supabase integration.
 *
 * Routes:
 *   /api/auth/register         — Register a new user
 *   /api/auth/login            — Login
 *   /api/peptides/generate     — Generate peptide sequences (logs activity to Supabase)
 *   /api/peptides/save          — Save peptide (proxied to DO or Supabase)
 *   /api/peptides/saved         — Get saved peptides
 *   /api/peptides/:id           — Delete a peptide
 *   /api/user/activity          — Get user activity profile
 *   /api/tokens/manage          — Create/revoke service tokens
 *   /api/search                 — Full-text search across peptides
 *   /api/health                 — Health check
 *
 * This Worker acts as the API gateway. For simple CRUD, the client may
 * also talk directly to Supabase REST with RLS enforcement.
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
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Rork-User-Id",
  "Access-Control-Max-Age": "86400",
};

type Env = {
  DO: Fetcher;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Health check
    if (path === "/api/health") {
      return json({
        status: "ok",
        version: "2.0.0",
        database: "Supabase PostgreSQL + Cloudflare Durable Objects",
        features: ["peptide-generation", "docking-scores", "sequence-alignment", "full-text-search", "version-control", "service-tokens"],
        timestamp: new Date().toISOString(),
      });
    }

    // Auth routes
    if (path === "/api/auth/register" && request.method === "POST") {
      return handleRegister(request);
    }
    if (path === "/api/auth/login" && request.method === "POST") {
      return handleLogin(request);
    }

    // Peptide generation — record activity
    if (path === "/api/peptides/generate" && request.method === "POST") {
      return handleGenerate(request, env);
    }

    // Service token management
    if (path === "/api/tokens/manage" && request.method === "POST") {
      return handleCreateToken(request, env);
    }
    if (path === "/api/tokens/manage" && request.method === "GET") {
      return handleListTokens(request, env);
    }
    if (path.startsWith("/api/tokens/revoke/") && request.method === "POST") {
      return handleRevokeToken(request, env, path.split("/api/tokens/revoke/")[1]);
    }

    // Full-text search (uses Supabase)
    if (path === "/api/search" && request.method === "GET") {
      return handleSearch(request, env);
    }

    // Proxy remaining routes to PeptideStore DO
    if (path.startsWith("/api/peptides/") || path.startsWith("/api/user/")) {
      return proxyToDO(request, env, "PeptideStore");
    }

    return json({ error: "not found" }, 404);
  },
} satisfies ExportedHandler<Env>;

// ---------------------------------------------------------------------------
// Auth (in-memory — for demo purposes)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Peptide Generation — record activity
// ---------------------------------------------------------------------------

async function handleGenerate(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as { targetId?: string; count?: number };
  const { targetId, count = 5 } = body;
  const userId = extractUserId(request);

  // Record to DO
  const doReq = new Request(
    `https://internal/api/user/activity`,
    { method: "POST", body: JSON.stringify({ target: targetId || "unknown", count }) },
  );
  doReq.headers.set("X-Rork-DO-Class", "PeptideStore");
  doReq.headers.set("X-Rork-DO-Id", userId);
  try { await env.DO.fetch(doReq); } catch (_) { /* non-critical */ }

  return json({ ok: true, recorded: true });
}

// ---------------------------------------------------------------------------
// Service Token Management (uses Supabase)
// ---------------------------------------------------------------------------

async function handleCreateToken(request: Request, env: Env): Promise<Response> {
  const body = await request.json() as { name?: string; scopes?: string[]; expiresInDays?: number };
  const { name = "API Token", scopes = ["read:peptides"], expiresInDays } = body;
  const userId = extractUserId(request);

  const tokenValue = crypto.randomUUID();
  const prefix = tokenValue.slice(0, 8);
  const hash = await sha256(tokenValue);
  const now = new Date();
  const expiresAt = expiresInDays
    ? new Date(now.getTime() + expiresInDays * 86400000).toISOString()
    : null;

  // Insert into Supabase
  const supabaseReq = new Request(`${env.SUPABASE_URL}/rest/v1/service_tokens`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": env.SUPABASE_SERVICE_KEY,
      "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}`,
      "Prefer": "return=minimal",
    },
    body: JSON.stringify([{
      user_id: userId,
      token_name: name,
      token_hash: hash,
      token_prefix: prefix,
      scopes,
      permissions: { created_via: "api" },
      rate_limit: 100,
      expires_at: expiresAt,
      is_active: true,
    }]),
  });

  const result = await supabaseReq.json();
  if (!supabaseReq.ok) {
    console.error("Token creation failed:", result);
    return json({ error: "Failed to create token" }, 500);
  }

  return json({
    token: `pf_${tokenValue}`,
    prefix,
    name,
    scopes,
    expiresAt,
    message: "Store this token securely — it won't be shown again.",
  }, 201);
}

async function handleListTokens(request: Request, env: Env): Promise<Response> {
  const userId = extractUserId(request);
  const url = `${env.SUPABASE_URL}/rest/v1/service_tokens?user_id=eq.${encodeURIComponent(userId)}&select=id,token_name,token_prefix,scopes,rate_limit,last_used_at,expires_at,is_active,created_at&order=created_at.desc`;

  const res = await fetch(url, {
    headers: {
      "apikey": env.SUPABASE_SERVICE_KEY,
      "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
  });

  const data = await res.json();
  return json({ tokens: data });
}

async function handleRevokeToken(request: Request, env: Env, tokenId: string): Promise<Response> {
  const userId = extractUserId(request);
  const url = `${env.SUPABASE_URL}/rest/v1/service_tokens?id=eq.${encodeURIComponent(tokenId)}&user_id=eq.${encodeURIComponent(userId)}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "apikey": env.SUPABASE_SERVICE_KEY,
      "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
    body: JSON.stringify({ is_active: false }),
  });

  if (!res.ok) return json({ error: "Failed to revoke token" }, 500);
  return json({ ok: true, message: "Token revoked" });
}

// ---------------------------------------------------------------------------
// Full-Text Search (via Supabase)
// ---------------------------------------------------------------------------

async function handleSearch(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const userId = extractUserId(request);

  if (!query || query.length < 2) {
    return json({ error: "Search query must be at least 2 characters" }, 400);
  }

  // Search across peptides using ilike for substring matching
  const searchUrl = new URL(`${env.SUPABASE_URL}/rest/v1/peptides`);
  searchUrl.searchParams.set("select", "id,peptide_name,sequence,docking_score,target_id,target_name,status,created_at");
  searchUrl.searchParams.set("or", `(peptide_name.ilike.*${query}*,sequence.ilike.*${query}*,target_name.ilike.*${query}*)`);
  searchUrl.searchParams.set("order", "docking_score.desc");
  searchUrl.searchParams.set("limit", "50");

  const res = await fetch(searchUrl.toString(), {
    headers: {
      "apikey": env.SUPABASE_SERVICE_KEY,
      "Authorization": `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    },
  });

  const data = await res.json();
  return json({ results: data, query });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function extractUserId(request: Request): string {
  const authHeader = request.headers.get("Authorization") || "";
  if (authHeader.startsWith("Bearer ")) {
    try {
      const payload = JSON.parse(atob(authHeader.slice(7)));
      return payload.sub || "anonymous";
    } catch {
      /* fall through */
    }
  }
  return request.headers.get("X-Rork-User-Id") || "anonymous";
}

function proxyToDO(request: Request, env: Env, className: string): Promise<Response> {
  const url = new URL(request.url);
  const userId = extractUserId(request);

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
    const corsResponse = new Response(r.body, r);
    for (const [k, v] of Object.entries(CORS)) {
      corsResponse.headers.set(k, v);
    }
    return corsResponse;
  });
}
