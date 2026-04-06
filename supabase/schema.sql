-- Blood Tests Tracker — Supabase Schema
-- Run this in the Supabase SQL Editor

-- 1. Profiles table (auto-created on Google signup)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  lang TEXT DEFAULT 'en',
  panel_view_mode TEXT DEFAULT 'compact',
  collapsed_panels JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Test sessions (one row per lab visit)
CREATE TABLE test_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  place TEXT,
  source_file TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date, place)
);

-- 3. Results (individual biomarker values)
CREATE TABLE results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  loinc TEXT,
  analysis TEXT,
  symbol TEXT,
  section TEXT,
  value DOUBLE PRECISION,
  raw_value TEXT,
  value_qualifier TEXT,
  unit TEXT,
  ref_text TEXT,
  ref_min DOUBLE PRECISION,
  ref_max DOUBLE PRECISION,
  method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Planned tests
CREATE TABLE planned_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  planned_date DATE,
  test_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Testing schedule (user-defined frequencies)
CREATE TABLE testing_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  panel_id TEXT,
  loinc TEXT,
  frequency_months INT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, panel_id, loinc)
);

-- Indexes for performance
CREATE INDEX idx_test_sessions_user_date ON test_sessions(user_id, date DESC);
CREATE INDEX idx_results_session ON results(session_id);
CREATE INDEX idx_results_user_loinc ON results(user_id, loinc);
CREATE INDEX idx_planned_tests_user ON planned_tests(user_id);
CREATE INDEX idx_testing_schedule_user ON testing_schedule(user_id);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;
ALTER TABLE planned_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE testing_schedule ENABLE ROW LEVEL SECURITY;

-- RLS Policies: users can only access their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own sessions" ON test_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON test_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON test_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON test_sessions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own results" ON results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own results" ON results FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own results" ON results FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own results" ON results FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own planned" ON planned_tests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own planned" ON planned_tests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own planned" ON planned_tests FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own planned" ON planned_tests FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own schedule" ON testing_schedule FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own schedule" ON testing_schedule FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own schedule" ON testing_schedule FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own schedule" ON testing_schedule FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
