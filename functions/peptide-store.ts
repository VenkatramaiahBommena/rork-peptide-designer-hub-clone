/**
 * PeptideStore Durable Object — per-user persistent storage for
 * peptide sequences, docking results, and activity history.
 */
import { DurableObject } from "cloudflare:workers";

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

interface ActivityEntry {
  date: string;
  count: number;
  target: string;
}

export class PeptideStore extends DurableObject {
  private sql: SqlStorage;

  constructor(ctx: DurableObjectState, env: unknown) {
    super(ctx, env);
    this.sql = ctx.storage.sql;

    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS peptides (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        sequence TEXT NOT NULL,
        length INTEGER NOT NULL,
        docking_score REAL NOT NULL,
        binding_affinity REAL NOT NULL,
        stability REAL NOT NULL,
        specificity REAL NOT NULL,
        solubility REAL NOT NULL,
        membrane_permeability REAL NOT NULL,
        unnatural_count INTEGER NOT NULL,
        target_id TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    `);

    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS activity (
        user_id TEXT NOT NULL,
        date TEXT NOT NULL,
        count INTEGER NOT NULL,
        target TEXT NOT NULL,
        PRIMARY KEY (user_id, date, target)
      )
    `);
  }

  override async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const userId = request.headers.get("X-Rork-User-Id") || "anonymous";
    const path = url.pathname;

    try {
      switch (true) {
        case path === "/save" && request.method === "POST":
          return this.handleSave(userId, await request.json());

        case path === "/saved" && request.method === "GET":
          return this.handleGetSaved(userId);

        case path.startsWith("/delete/") && request.method === "DELETE":
          return this.handleDelete(userId, path.split("/delete/")[1]);

        case path === "/activity" && request.method === "GET":
          return this.handleGetActivity(userId);

        case path === "/activity" && request.method === "POST":
          return this.handleRecordActivity(userId, await request.json());

        default:
          return new Response(JSON.stringify({ error: "not found" }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
          });
      }
    } catch (e) {
      console.error("PeptideStore error:", e);
      return new Response(JSON.stringify({ error: "Internal error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  private handleSave(userId: string, body: { peptide: Peptide }): Response {
    const p = body.peptide;
    this.sql.exec(
      `INSERT OR REPLACE INTO peptides
       (id, user_id, sequence, length, docking_score, binding_affinity,
        stability, specificity, solubility, membrane_permeability,
        unnatural_count, target_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      p.id, userId, p.sequence, p.length, p.dockingScore,
      p.bindingAffinity, p.stability, p.specificity, p.solubility,
      p.membranePermeability, p.unnaturalCount, p.targetId, p.createdAt,
    );
    return Response.json({ ok: true });
  }

  private handleGetSaved(userId: string): Response {
    const rows = this.sql.exec<{
      id: string; sequence: string; length: number; docking_score: number;
      binding_affinity: number; stability: number; specificity: number;
      solubility: number; membrane_permeability: number; unnatural_count: number;
      target_id: string; created_at: string;
    }>(
      "SELECT * FROM peptides WHERE user_id = ? ORDER BY created_at DESC",
      userId,
    );

    const peptides: Peptide[] = [];
    for (const r of rows) {
      peptides.push({
        id: r.id,
        sequence: r.sequence,
        length: r.length,
        dockingScore: r.docking_score,
        bindingAffinity: r.binding_affinity,
        stability: r.stability,
        specificity: r.specificity,
        solubility: r.solubility,
        membranePermeability: r.membrane_permeability,
        unnaturalCount: r.unnatural_count,
        targetId: r.target_id,
        createdAt: r.created_at,
      });
    }

    return Response.json({ peptides });
  }

  private handleDelete(userId: string, peptideId: string): Response {
    this.sql.exec(
      "DELETE FROM peptides WHERE id = ? AND user_id = ?",
      peptideId, userId,
    );
    return Response.json({ ok: true });
  }

  private handleGetActivity(userId: string): Response {
    const peptideCount = this.sql.exec<{ cnt: number }>(
      "SELECT COUNT(*) as cnt FROM peptides WHERE user_id = ?",
      userId,
    ).one()?.cnt ?? 0;

    const history = this.sql.exec<{ date: string; count: number; target: string }>(
      "SELECT date, SUM(count) as count, target FROM activity WHERE user_id = ? GROUP BY date, target ORDER BY date DESC LIMIT 30",
      userId,
    );

    const generationHistory: ActivityEntry[] = [];
    for (const r of history) {
      generationHistory.push({ date: r.date, count: r.count, target: r.target });
    }

    const savedRows = this.sql.exec<{
      id: string; sequence: string; length: number; docking_score: number;
      binding_affinity: number; stability: number; specificity: number;
      solubility: number; membrane_permeability: number; unnatural_count: number;
      target_id: string; created_at: string;
    }>(
      "SELECT * FROM peptides WHERE user_id = ? ORDER BY created_at DESC LIMIT 10",
      userId,
    );

    const savedPeptides: Peptide[] = [];
    for (const r of savedRows) {
      savedPeptides.push({
        id: r.id,
        sequence: r.sequence,
        length: r.length,
        dockingScore: r.docking_score,
        bindingAffinity: r.binding_affinity,
        stability: r.stability,
        specificity: r.specificity,
        solubility: r.solubility,
        membranePermeability: r.membrane_permeability,
        unnaturalCount: r.unnatural_count,
        targetId: r.target_id,
        createdAt: r.created_at,
      });
    }

    const totalGenerations = generationHistory.reduce((s, e) => s + e.count, 0);
    const targetCounts: Record<string, number> = {};
    for (const e of generationHistory) {
      targetCounts[e.target] = (targetCounts[e.target] || 0) + e.count;
    }
    let favoriteTarget = "none";
    let maxCount = 0;
    for (const [t, c] of Object.entries(targetCounts)) {
      if (c > maxCount) { maxCount = c; favoriteTarget = t; }
    }

    return Response.json({
      totalGenerations,
      totalPeptides: peptideCount,
      lastActive: generationHistory[0]?.date || new Date().toISOString().split("T")[0],
      favoriteTarget,
      savedPeptides,
      generationHistory,
    });
  }

  private handleRecordActivity(userId: string, body: { target: string; count: number }): Response {
    const date = new Date().toISOString().split("T")[0];
    this.sql.exec(
      `INSERT INTO activity (user_id, date, count, target)
       VALUES (?, ?, ?, ?)
       ON CONFLICT (user_id, date, target) DO UPDATE SET count = count + ?`,
      userId, date, body.count, body.target, body.count,
    );
    return Response.json({ ok: true });
  }
}
