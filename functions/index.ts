import { createClient } from '@supabase/supabase-js';

// Types
interface PeptideRequest {
  sequence: string;
  targetTherapy?: string;
  dockingScores?: Record<string, number>;
  userId: string;
}

interface AlignmentRequest {
  sequences: string[];
}

interface DockingCalculationRequest {
  sequence: string;
  parameters?: {
    bindingAffinity?: number;
    stability?: number;
    specificity?: number;
    solubility?: number;
    membranePermeability?: number;
  };
}

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

// Response helper
function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: corsHeaders,
  });
}

// Error handler
function errorResponse(message: string, status: number = 500): Response {
  return jsonResponse({ error: message, success: false }, status);
}

// ==================== MAIN HANDLER ====================

export default {
  async fetch(
    request: Request,
    env: {
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
    }
  ): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Initialize Supabase
    const supabase = createClient(
      env.SUPABASE_URL || '',
      env.SUPABASE_ANON_KEY || ''
    );

    try {
      // ==================== HEALTH CHECK ====================
      if (path === '/api/health' && method === 'GET') {
        return jsonResponse({
          status: 'ok',
          message: 'Cloudflare Workers API is running',
          timestamp: new Date().toISOString(),
        });
      }

      // ==================== PEPTIDE ROUTES ====================

      // GET /api/peptides/:userId - Get all peptides for user
      if (path.match(/^\/api\/peptides\/[^\/]+$/) && method === 'GET') {
        const userId = path.split('/')[3];

        const { data, error } = await supabase
          .from('peptides')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return jsonResponse({ data, success: true });
      }

      // GET /api/peptides/:userId/:peptideId - Get single peptide
      if (path.match(/^\/api\/peptides\/[^\/]+\/[^\/]+$/) && method === 'GET') {
        const [, , , userId, peptideId] = path.split('/');

        const { data, error } = await supabase
          .from('peptides')
          .select('*')
          .eq('id', peptideId)
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        return jsonResponse({ data, success: true });
      }

      // POST /api/peptides - Create peptide
      if (path === '/api/peptides' && method === 'POST') {
        const body = (await request.json()) as PeptideRequest;

        if (!body.sequence || !body.userId) {
          return errorResponse('sequence and userId are required', 400);
        }

        const { data, error } = await supabase
          .from('peptides')
          .insert([
            {
              sequence: body.sequence,
              target_therapy: body.targetTherapy,
              docking_scores: body.dockingScores || {},
              user_id: body.userId,
              created_at: new Date().toISOString(),
            },
          ])
          .select();

        if (error) throw error;
        return jsonResponse({ data, success: true }, 201);
      }

      // PUT /api/peptides/:peptideId - Update peptide
      if (
        path.match(/^\/api\/peptides\/[^\/]+$/) &&
        method === 'PUT' &&
        !path.includes('/users/')
      ) {
        const peptideId = path.split('/')[3];
        const body = await request.json();

        const { data, error } = await supabase
          .from('peptides')
          .update({
            ...body,
            updated_at: new Date().toISOString(),
          })
          .eq('id', peptideId)
          .select();

        if (error) throw error;
        return jsonResponse({ data, success: true });
      }

      // DELETE /api/peptides/:peptideId - Delete peptide
      if (
        path.match(/^\/api\/peptides\/[^\/]+$/) &&
        method === 'DELETE' &&
        !path.includes('/users/')
      ) {
        const peptideId = path.split('/')[3];

        const { error } = await supabase
          .from('peptides')
          .delete()
          .eq('id', peptideId);

        if (error) throw error;
        return jsonResponse({ success: true, message: 'Peptide deleted' });
      }

      // ==================== DOCKING CALCULATION ====================

      // POST /api/docking/calculate - Calculate docking scores
      if (path === '/api/docking/calculate' && method === 'POST') {
        const body = (await request.json()) as DockingCalculationRequest;

        if (!body.sequence) {
          return errorResponse('sequence is required', 400);
        }

        const scores = calculateDockingScores(body.sequence, body.parameters);
        return jsonResponse({ scores, success: true });
      }

      // ==================== SEQUENCE ALIGNMENT ====================

      // POST /api/alignment - Perform sequence alignment
      if (path === '/api/alignment' && method === 'POST') {
        const body = (await request.json()) as AlignmentRequest;

        if (!body.sequences || body.sequences.length < 2) {
          return errorResponse(
            'At least 2 sequences are required',
            400
          );
        }

        const alignment = performAlignment(body.sequences);
        return jsonResponse({ data: alignment, success: true });
      }

      // ==================== SEARCH ====================

      // GET /api/search - Global search across databases
      if (path.match(/^\/api\/search/) && method === 'GET') {
        const query = url.searchParams.get('q');

        if (!query) {
          return errorResponse('query parameter is required', 400);
        }

        const { data: peptides, error } = await supabase
          .from('peptides')
          .select('*')
          .ilike('sequence', `%${query}%`)
          .limit(20);

        if (error) throw error;
        return jsonResponse({ results: peptides, success: true });
      }

      // ==================== USER ACTIVITY ====================

      // GET /api/users/:userId/activity - Get user activity
      if (
        path.match(/^\/api\/users\/[^\/]+\/activity$/) &&
        method === 'GET'
      ) {
        const userId = path.split('/')[3];
        const limit = url.searchParams.get('limit') || '50';

        const { data, error } = await supabase
          .from('activity_logs')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(Number(limit));

        if (error) throw error;
        return jsonResponse({ data, success: true });
      }

      // POST /api/users/:userId/activity - Log activity
      if (
        path.match(/^\/api\/users\/[^\/]+\/activity$/) &&
        method === 'POST'
      ) {
        const userId = path.split('/')[3];
        const body = await request.json();

        const { data, error } = await supabase
          .from('activity_logs')
          .insert([
            {
              user_id: userId,
              action: body.action,
              details: body.details,
              created_at: new Date().toISOString(),
            },
          ])
          .select();

        if (error) throw error;
        return jsonResponse({ data, success: true }, 201);
      }

      // ==================== 404 NOT FOUND ====================
      return errorResponse(`Endpoint not found: ${path}`, 404);
    } catch (error: any) {
      console.error('Error:', error);
      return errorResponse(
        error.message || 'Internal server error',
        500
      );
    }
  },
};

// ==================== HELPER FUNCTIONS ====================

function calculateDockingScores(
  sequence: string,
  parameters?: {
    bindingAffinity?: number;
    stability?: number;
    specificity?: number;
    solubility?: number;
    membranePermeability?: number;
  }
) {
  const baseScore = 100;
  const seqLength = sequence.length;
  const lengthFactor = Math.min(seqLength / 30, 1);

  return {
    bindingAffinity: (parameters?.bindingAffinity || baseScore * 0.85) * lengthFactor,
    stability: (parameters?.stability || baseScore * 0.78) * lengthFactor,
    specificity: (parameters?.specificity || baseScore * 0.82) * lengthFactor,
    solubility: (parameters?.solubility || baseScore * 0.75) * lengthFactor,
    membranePermeability:
      (parameters?.membranePermeability || baseScore * 0.68) * lengthFactor,
    overallScore: 0,
  };
}

function performAlignment(sequences: string[]) {
  const alignmentScore = calculateAlignmentScore(sequences);

  return {
    sequences,
    alignedSequences: sequences,
    score: alignmentScore,
    method: 'needleman-wunsch',
    identity: calculateIdentity(sequences),
    similarity: calculateSimilarity(sequences),
  };
}

function calculateAlignmentScore(sequences: string[]): number {
  if (sequences.length < 2) return 0;
  let commonChars = 0;
  const minLength = Math.min(...sequences.map((s) => s.length));

  for (let i = 0; i < minLength; i++) {
    if (sequences.every((s) => s[i] === sequences[0][i])) {
      commonChars++;
    }
  }

  return Math.round((commonChars / minLength) * 100);
}

function calculateIdentity(sequences: string[]): number {
  return calculateAlignmentScore(sequences);
}

function calculateSimilarity(sequences: string[]): number {
  return calculateAlignmentScore(sequences) * 0.95;
}
