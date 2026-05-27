-- ==================== PEPTIDES TABLE ====================
CREATE TABLE IF NOT EXISTS peptides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sequence TEXT NOT NULL,
  target_therapy VARCHAR(255),
  docking_scores JSONB DEFAULT '{}',
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  notes TEXT,
  version INTEGER DEFAULT 1,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_peptides_user_id ON peptides(user_id);
CREATE INDEX idx_peptides_created_at ON peptides(created_at DESC);
CREATE INDEX idx_peptides_project_id ON peptides(project_id);
CREATE INDEX idx_peptides_sequence ON peptides USING GIN(to_tsvector('english', sequence));

-- ==================== PROJECTS TABLE ====================
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);

-- ==================== ACTIVITY LOGS TABLE ====================
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action VARCHAR(255) NOT NULL,
  details JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_created_at ON activity_logs(created_at DESC);

-- ==================== SEQUENCE VERSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS sequence_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  peptide_id UUID NOT NULL REFERENCES peptides(id) ON DELETE CASCADE,
  sequence TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  change_description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sequence_versions_peptide_id ON sequence_versions(peptide_id);
CREATE INDEX idx_sequence_versions_version ON sequence_versions(version_number);

-- ==================== SAVED SEARCHES TABLE ====================
CREATE TABLE IF NOT EXISTS saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  name VARCHAR(255),
  filters JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);

-- ==================== API TOKENS TABLE ====================
CREATE TABLE IF NOT EXISTS api_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_tokens_user_id ON api_tokens(user_id);
CREATE INDEX idx_api_tokens_active ON api_tokens(is_active);

-- ==================== FAVORITE DATABASES TABLE ====================
CREATE TABLE IF NOT EXISTS favorite_databases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  database_name VARCHAR(255) NOT NULL,
  database_url TEXT,
  database_type VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_favorite_databases_user_id ON favorite_databases(user_id);

-- ==================== ALIGNMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS alignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  sequences TEXT[] NOT NULL,
  aligned_sequences TEXT[],
  alignment_score NUMERIC(5, 2),
  method VARCHAR(100) DEFAULT 'needleman-wunsch',
  identity_percentage NUMERIC(5, 2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_alignments_user_id ON alignments(user_id);

-- ==================== FUNCTIONS ====================

-- Function to update timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for peptides update
CREATE TRIGGER peptides_update_timestamp
BEFORE UPDATE ON peptides
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Trigger for projects update
CREATE TRIGGER projects_update_timestamp
BEFORE UPDATE ON projects
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- ==================== ROW LEVEL SECURITY ====================

ALTER TABLE peptides ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sequence_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE alignments ENABLE ROW LEVEL SECURITY;

-- Peptides RLS
CREATE POLICY "Users can view their own peptides" ON peptides
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create peptides" ON peptides
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own peptides" ON peptides
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own peptides" ON peptides
  FOR DELETE USING (auth.uid() = user_id);

-- Projects RLS
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Activity logs RLS
CREATE POLICY "Users can view their own activity" ON activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create activity logs" ON activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);
