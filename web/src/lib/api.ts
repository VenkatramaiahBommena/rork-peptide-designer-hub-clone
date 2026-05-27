/**
 * API client for PeptiForge backend.
 * Communicates with the Cloudflare Worker backend.
 */

import type { GeneratedPeptide, ScoringParams } from "./peptide-engine";

const BACKEND_URL = import.meta.env.EXPO_PUBLIC_RORK_FUNCTIONS_URL as string;

function getAccessToken(): string | null {
  return localStorage.getItem("rork:access_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error((errorBody as { error?: string }).error || `Request failed (${response.status})`);
  }

  return response.json();
}

export interface UserActivity {
  totalGenerations: number;
  totalPeptides: number;
  lastActive: string;
  favoriteTarget: string;
  savedPeptides: GeneratedPeptide[];
  generationHistory: { date: string; count: number; target: string }[];
}

/** Generate peptides via the backend */
export async function apiGeneratePeptides(params: {
  targetId: string;
  scoringParams: ScoringParams;
  unnaturalSelections: string[];
  count?: number;
  minLength?: number;
  maxLength?: number;
}): Promise<{ peptides: GeneratedPeptide[] }> {
  return request<{ peptides: GeneratedPeptide[] }>("/api/peptides/generate", {
    method: "POST",
    body: JSON.stringify(params),
  });
}

/** Save a peptide to user's collection */
export async function apiSavePeptide(peptide: GeneratedPeptide): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>("/api/peptides/save", {
    method: "POST",
    body: JSON.stringify({ peptide }),
  });
}

/** Get user's saved peptides */
export async function apiGetSavedPeptides(): Promise<{ peptides: GeneratedPeptide[] }> {
  return request<{ peptides: GeneratedPeptide[] }>("/api/peptides/saved");
}

/** Get user activity profile */
export async function apiGetActivity(): Promise<UserActivity> {
  return request<UserActivity>("/api/user/activity");
}

/** Delete a saved peptide */
export async function apiDeletePeptide(peptideId: string): Promise<{ ok: boolean }> {
  return request<{ ok: boolean }>(`/api/peptides/${peptideId}`, {
    method: "DELETE",
  });
}

/** Register a user (simulated auth) */
export async function apiRegister(email: string, password: string, name: string): Promise<{ token: string; user: { id: string; email: string; name: string } }> {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });
}

/** Login a user (simulated auth) */
export async function apiLogin(email: string, password: string): Promise<{ token: string; user: { id: string; email: string; name: string } }> {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}
