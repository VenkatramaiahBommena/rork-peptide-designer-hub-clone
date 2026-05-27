/**
 * Supabase client for PeptiForge — PostgreSQL-backed persistence.
 * Provides typed database operations with RLS enforcement.
 */

const SUPABASE_URL = import.meta.env.EXPO_PUBLIC_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

interface SupabaseResponse<T> {
  data: T | null;
  error: { message: string; code?: string } | null;
}

// ---------------------------------------------------------------------------
// Database types matching the PostgreSQL schema
// ---------------------------------------------------------------------------

export interface PeptideRecord {
  id: string;
  user_id: string;
  peptide_name: string | null;
  sequence: string;
  sequence_length: number;
  docking_score: number;
  binding_affinity: number;
  stability: number;
  specificity: number;
  solubility: number;
  membrane_permeability: number;
  unnatural_count: number;
  target_id: string;
  target_name: string | null;
  molecular_weight: number | null;
  isoelectric_point: number | null;
  net_charge: number | null;
  hydrophobicity: number | null;
  smiles_notation: string | null;
  tags: string[];
  status: "generated" | "saved" | "synthesized" | "tested" | "archived";
  version: number;
  parent_id: string | null;
  project_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PeptideVersion {
  id: string;
  peptide_id: string;
  version: number;
  sequence: string;
  docking_score: number;
  binding_affinity: number;
  stability: number;
  specificity: number;
  solubility: number;
  membrane_permeability: number;
  unnatural_count: number;
  change_description: string | null;
  created_at: string;
}

export interface DockingResult {
  id: string;
  user_id: string;
  peptide_id: string | null;
  receptor_name: string;
  receptor_pdb_id: string | null;
  docking_algorithm: string | null;
  total_score: number;
  van_der_waals: number | null;
  electrostatic: number | null;
  hydrogen_bonds: number | null;
  salt_bridges: number | null;
  hydrophobic_contacts: number | null;
  rmsd: number | null;
  binding_pose_rank: number;
  parameters: Record<string, unknown>;
  created_at: string;
}

export interface Dataset {
  id: string;
  user_id: string;
  dataset_name: string;
  description: string | null;
  file_format: string | null;
  peptide_count: number;
  storage_path: string | null;
  metadata: Record<string, unknown>;
  tags: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  project_name: string;
  description: string | null;
  target_id: string | null;
  target_name: string | null;
  status: "active" | "completed" | "archived" | "on_hold";
  peptide_count: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  activity_type: string;
  entity_type: string | null;
  entity_id: string | null;
  target_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export interface ServiceToken {
  id: string;
  user_id: string;
  token_name: string;
  token_prefix: string;
  scopes: string[];
  permissions: Record<string, unknown>;
  rate_limit: number;
  last_used_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

// ---------------------------------------------------------------------------
// REST client (raw fetch to Supabase REST API)
// ---------------------------------------------------------------------------

function getAccessToken(): string | null {
  return localStorage.getItem("rork:access_token");
}

async function supabaseRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<SupabaseResponse<T>> {
  try {
    const token = getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      ...(options.headers as Record<string, string> || {}),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const response = await fetch(`${SUPABASE_URL}/rest/v1${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      return {
        data: null,
        error: {
          message: (errorBody as { message?: string }).message || `Request failed (${response.status})`,
          code: (errorBody as { code?: string }).code,
        },
      };
    }

    // 204 No Content
    if (response.status === 204) return { data: null as T, error: null };

    const data = await response.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: { message: (err as Error).message } };
  }
}

// ---------------------------------------------------------------------------
// Peptide CRUD operations
// ---------------------------------------------------------------------------

export async function insertPeptide(
  peptide: Omit<PeptideRecord, "id" | "created_at" | "updated_at" | "search_vector" | "version">,
): Promise<SupabaseResponse<PeptideRecord[]>> {
  return supabaseRequest<PeptideRecord[]>("/peptides", {
    method: "POST",
    body: JSON.stringify([peptide]),
    headers: { Prefer: "return=representation" },
  });
}

export async function getUserPeptides(params?: {
  limit?: number;
  offset?: number;
  status?: string;
  target_id?: string;
  sort?: string;
}): Promise<SupabaseResponse<PeptideRecord[]>> {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));
  if (params?.status) searchParams.set("status", `eq.${params.status}`);
  if (params?.target_id) searchParams.set("target_id", `eq.${params.target_id}`);
  if (params?.sort) {
    searchParams.set("order", params.sort);
  } else {
    searchParams.set("order", "docking_score.desc");
  }
  searchParams.set("select", "*");

  const qs = searchParams.toString();
  return supabaseRequest<PeptideRecord[]>(`/peptides?${qs}`);
}

export async function searchPeptides(query: string): Promise<SupabaseResponse<PeptideRecord[]>> {
  const searchParams = new URLSearchParams();
  searchParams.set("select", "*");
  searchParams.set("or", `(peptide_name.ilike.*${query}*,sequence.ilike.*${query}*,target_name.ilike.*${query}*)`);
  searchParams.set("order", "docking_score.desc");
  searchParams.set("limit", "50");
  return supabaseRequest<PeptideRecord[]>(`/peptides?${searchParams}`);
}

export async function updatePeptide(
  id: string,
  updates: Partial<PeptideRecord>,
): Promise<SupabaseResponse<null>> {
  return supabaseRequest(`/peptides?id=eq.${id}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function deletePeptide(id: string): Promise<SupabaseResponse<null>> {
  return supabaseRequest(`/peptides?id=eq.${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Peptide Version operations
// ---------------------------------------------------------------------------

export async function getPeptideVersions(peptideId: string): Promise<SupabaseResponse<PeptideVersion[]>> {
  return supabaseRequest<PeptideVersion[]>(
    `/peptide_versions?peptide_id=eq.${peptideId}&order=version.desc`,
  );
}

// ---------------------------------------------------------------------------
// Project operations
// ---------------------------------------------------------------------------

export async function getUserProjects(): Promise<SupabaseResponse<Project[]>> {
  return supabaseRequest<Project[]>("/projects?order=updated_at.desc");
}

export async function insertProject(
  project: Omit<Project, "id" | "created_at" | "updated_at">,
): Promise<SupabaseResponse<Project[]>> {
  return supabaseRequest<Project[]>("/projects", {
    method: "POST",
    body: JSON.stringify([project]),
    headers: { Prefer: "return=representation" },
  });
}

export async function deleteProject(id: string): Promise<SupabaseResponse<null>> {
  return supabaseRequest(`/projects?id=eq.${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Dataset operations
// ---------------------------------------------------------------------------

export async function getUserDatasets(): Promise<SupabaseResponse<Dataset[]>> {
  return supabaseRequest<Dataset[]>("/datasets?order=updated_at.desc");
}

export async function insertDataset(
  dataset: Omit<Dataset, "id" | "created_at" | "updated_at">,
): Promise<SupabaseResponse<Dataset[]>> {
  return supabaseRequest<Dataset[]>("/datasets", {
    method: "POST",
    body: JSON.stringify([dataset]),
    headers: { Prefer: "return=representation" },
  });
}

// ---------------------------------------------------------------------------
// Activity Log operations
// ---------------------------------------------------------------------------

export async function logActivity(entry: {
  activity_type: string;
  entity_type?: string;
  entity_id?: string;
  target_id?: string;
  details?: Record<string, unknown>;
}): Promise<SupabaseResponse<null>> {
  return supabaseRequest("/activity_log", {
    method: "POST",
    body: JSON.stringify([{
      ...entry,
      user_id: "user", // RLS will fill from auth context
    }]),
  });
}

export async function getUserActivity(limit = 30): Promise<SupabaseResponse<ActivityLogEntry[]>> {
  return supabaseRequest<ActivityLogEntry[]>(
    `/activity_log?order=created_at.desc&limit=${limit}`,
  );
}

// ---------------------------------------------------------------------------
// Statistics queries
// ---------------------------------------------------------------------------

export async function getUserStats(): Promise<SupabaseResponse<{
  total_peptides: number;
  total_projects: number;
  total_datasets: number;
  avg_docking_score: number;
  favorite_target: { target_id: string; count: number } | null;
}>> {
  return supabaseRequest("/rpc/get_user_stats");
}
