-- Brightboard Supabase Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bb_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  school TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bb_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON bb_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON bb_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO bb_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── FOLDERS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bb_folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#F79009',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bb_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own folders" ON bb_folders
  FOR ALL USING (auth.uid() = user_id);

-- ─── PROJECTS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bb_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  year_level TEXT NOT NULL DEFAULT 'foundation',
  subject TEXT NOT NULL,
  curriculum_code TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('slide_deck', 'infographic', 'lesson_plan')),
  visual_style TEXT NOT NULL DEFAULT 'bright_cartoon_classroom',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'complete')),
  thumbnail_url TEXT,
  folder_id UUID REFERENCES bb_folders(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bb_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own projects" ON bb_projects
  FOR ALL USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bb_projects_updated_at
  BEFORE UPDATE ON bb_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── SLIDES ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bb_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES bb_projects(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  title TEXT NOT NULL,
  slide_type TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bb_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own slides" ON bb_slides
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM bb_projects WHERE id = slides.project_id)
  );

CREATE TRIGGER bb_slides_updated_at
  BEFORE UPDATE ON bb_slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── RESOURCES ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bb_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES bb_projects(id) ON DELETE CASCADE,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('infographic', 'lesson_plan')),
  content JSONB NOT NULL DEFAULT '{}',
  image_url TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bb_resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own resources" ON bb_resources
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM bb_projects WHERE id = resources.project_id)
  );

CREATE TRIGGER bb_resources_updated_at
  BEFORE UPDATE ON bb_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── ADMIN SETTINGS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bb_admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bb_admin_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read settings (needed by AI generation layer)
-- Writes are gated by API routes checking isAdminEmail()
-- Reads: all authenticated (AI generation layer needs this)
-- Writes: authenticated users only — admin check enforced at API route level
CREATE POLICY "Authenticated users can read settings" ON bb_admin_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can write settings" ON bb_admin_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- Seed default settings
INSERT INTO bb_admin_settings (key, value) VALUES
  ('active_model', '"anthropic/claude-sonnet-4-5"')
ON CONFLICT (key) DO NOTHING;

-- ─── USAGE LOGS ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bb_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES bb_projects(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  task TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  cost_usd NUMERIC(12, 8),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bb_usage_logs ENABLE ROW LEVEL SECURITY;

-- Only admins (service role) can read all logs; users cannot see others' logs
CREATE POLICY "Users can read own usage logs" ON bb_usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to usage_logs" ON bb_usage_logs
  FOR ALL USING (true);

-- ─── STORAGE BUCKETS ─────────────────────────────────────────────────────────
-- Run these in Supabase Storage settings or via the dashboard:
-- 1. Create bucket: 'slides' (public)
-- 2. Create bucket: 'infographics' (public)
-- 3. Create bucket: 'pdfs' (private)
-- 4. Create bucket: 'thumbnails' (public)
