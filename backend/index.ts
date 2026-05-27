import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// ==================== PEPTIDE ENDPOINTS ====================

// Get all peptides for a user
app.get('/api/peptides/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('peptides')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message, success: false });
  }
});

// Get single peptide
app.get('/api/peptides/:userId/:peptideId', async (req: Request, res: Response) => {
  try {
    const { userId, peptideId } = req.params;

    const { data, error } = await supabase
      .from('peptides')
      .select('*')
      .eq('id', peptideId)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    res.json({ data, success: true });
  } catch (error: any) {
    res.status(404).json({ error: 'Peptide not found', success: false });
  }
});

// Create new peptide
app.post('/api/peptides', async (req: Request, res: Response) => {
  try {
    const {
      sequence,
      targetTherapy,
      dockingScores,
      userId,
      projectId,
      notes,
    } = req.body;

    if (!sequence || !userId) {
      return res.status(400).json({
        error: 'sequence and userId are required',
        success: false,
      });
    }

    const { data, error } = await supabase
      .from('peptides')
      .insert([
        {
          sequence,
          target_therapy: targetTherapy,
          docking_scores: dockingScores || {},
          user_id: userId,
          project_id: projectId || null,
          notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json({ data, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message, success: false });
  }
});

// Update peptide
app.put('/api/peptides/:peptideId', async (req: Request, res: Response) => {
  try {
    const { peptideId } = req.params;
    const { sequence, targetTherapy, dockingScores, notes } = req.body;

    const { data, error } = await supabase
      .from('peptides')
      .update({
        sequence,
        target_therapy: targetTherapy,
        docking_scores: dockingScores,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', peptideId)
      .select();

    if (error) throw error;
    res.json({ data, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message, success: false });
  }
});

// Delete peptide
app.delete('/api/peptides/:peptideId', async (req: Request, res: Response) => {
  try {
    const { peptideId } = req.params;

    const { error } = await supabase
      .from('peptides')
      .delete()
      .eq('id', peptideId);

    if (error) throw error;
    res.json({ success: true, message: 'Peptide deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message, success: false });
  }
});

// ==================== PROJECT ENDPOINTS ====================

// Get user projects
app.get('/api/projects/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ data, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message, success: false });
  }
});

// Create project
app.post('/api/projects', async (req: Request, res: Response) => {
  try {
    const { name, description, userId } = req.body;

    if (!name || !userId) {
      return res.status(400).json({
        error: 'name and userId are required',
        success: false,
      });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          name,
          description,
          user_id: userId,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json({ data, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message, success: false });
  }
});

// ==================== ACTIVITY LOG ENDPOINTS ====================

// Get user activity
app.get('/api/activity/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 50 } = req.query;

    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(Number(limit));

    if (error) throw error;
    res.json({ data, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message, success: false });
  }
});

// Log activity
app.post('/api/activity', async (req: Request, res: Response) => {
  try {
    const { userId, action, details } = req.body;

    if (!userId || !action) {
      return res.status(400).json({
        error: 'userId and action are required',
        success: false,
      });
    }

    const { data, error } = await supabase
      .from('activity_logs')
      .insert([
        {
          user_id: userId,
          action,
          details,
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json({ data, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message, success: false });
  }
});

// ==================== DOCKING SCORE ENDPOINTS ====================

// Calculate docking scores
app.post('/api/docking/calculate', async (req: Request, res: Response) => {
  try {
    const { sequence, parameters } = req.body;

    if (!sequence) {
      return res.status(400).json({
        error: 'sequence is required',
        success: false,
      });
    }

    // Calculate scores based on parameters
    const scores = calculateDockingScores(sequence, parameters);

    res.json({ scores, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message, success: false });
  }
});

// Helper function to calculate docking scores
function calculateDockingScores(
  sequence: string,
  parameters: {
    bindingAffinity?: number;
    stability?: number;
    specificity?: number;
    solubility?: number;
    membranePermeability?: number;
  }
) {
  const seqLength = sequence.length;
  const baseScore = 100;

  return {
    bindingAffinity: parameters.bindingAffinity || baseScore * 0.85,
    stability: parameters.stability || baseScore * 0.78,
    specificity: parameters.specificity || baseScore * 0.82,
    solubility: parameters.solubility || baseScore * 0.75,
    membranePermeability: parameters.membranePermeability || baseScore * 0.68,
    overallScore:
      ((parameters.bindingAffinity || baseScore * 0.85) +
        (parameters.stability || baseScore * 0.78) +
        (parameters.specificity || baseScore * 0.82) +
        (parameters.solubility || baseScore * 0.75) +
        (parameters.membranePermeability || baseScore * 0.68)) /
      5,
  };
}

// ==================== ALIGNMENT ENDPOINTS ====================

// Get sequence alignment
app.post('/api/alignment', async (req: Request, res: Response) => {
  try {
    const { sequences } = req.body;

    if (!sequences || sequences.length < 2) {
      return res.status(400).json({
        error: 'At least 2 sequences are required',
        success: false,
      });
    }

    // Placeholder alignment result
    const alignment = {
      sequences,
      alignedSequences: sequences,
      score: 100,
      method: 'needleman-wunsch',
    };

    res.json({ data: alignment, success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message, success: false });
  }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    success: false,
  });
});

// Error middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    success: false,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
});
