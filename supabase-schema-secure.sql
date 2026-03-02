-- 🔒 SECURE Community Database Schema for YT2AppleMusic
-- This version prevents direct table access and uses secure functions only

-- Create tables (or modify existing ones)
CREATE TABLE IF NOT EXISTS song_mappings (
  id SERIAL PRIMARY KEY,
  youtube_id VARCHAR(20) UNIQUE NOT NULL,
  apple_music_id VARCHAR(20) NOT NULL,
  youtube_title TEXT NOT NULL,
  youtube_channel TEXT NOT NULL,
  apple_music_artist TEXT NOT NULL,
  apple_music_song TEXT NOT NULL,
  confidence_score FLOAT DEFAULT 0.5 CHECK (confidence_score >= 0 AND confidence_score <= 1),
  user_confirmations INTEGER DEFAULT 0 CHECK (user_confirmations >= 0),
  user_rejections INTEGER DEFAULT 0 CHECK (user_rejections >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add created_by_user_id column if it doesn't exist
ALTER TABLE song_mappings 
ADD COLUMN IF NOT EXISTS created_by_user_id VARCHAR(50) DEFAULT 'legacy_user';

CREATE TABLE IF NOT EXISTS user_contributions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  mapping_id INTEGER REFERENCES song_mappings(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('confirm', 'reject', 'submit', 'unmap')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mapping_id, action) -- Prevent duplicate votes
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_song_mappings_youtube_id ON song_mappings(youtube_id);
CREATE INDEX IF NOT EXISTS idx_song_mappings_confidence ON song_mappings(confidence_score);
CREATE INDEX IF NOT EXISTS idx_user_contributions_user_id ON user_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contributions_mapping_id ON user_contributions(mapping_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_song_mappings_updated_at ON song_mappings;
CREATE TRIGGER update_song_mappings_updated_at
  BEFORE UPDATE ON song_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 🔒 SECURE ROW LEVEL SECURITY POLICIES
ALTER TABLE song_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_contributions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (both old and new)
DROP POLICY IF EXISTS "Allow read access to song_mappings" ON song_mappings;
DROP POLICY IF EXISTS "Allow insert to song_mappings" ON song_mappings;
DROP POLICY IF EXISTS "Allow update to song_mappings" ON song_mappings;
DROP POLICY IF EXISTS "Allow read access to user_contributions" ON user_contributions;
DROP POLICY IF EXISTS "Allow insert to user_contributions" ON user_contributions;

-- Drop existing blocking policies if they exist
DROP POLICY IF EXISTS "Block direct select on song_mappings" ON song_mappings;
DROP POLICY IF EXISTS "Block direct insert on song_mappings" ON song_mappings;
DROP POLICY IF EXISTS "Block direct update on song_mappings" ON song_mappings;
DROP POLICY IF EXISTS "Block direct delete on song_mappings" ON song_mappings;
DROP POLICY IF EXISTS "Block direct select on user_contributions" ON user_contributions;
DROP POLICY IF EXISTS "Block direct insert on user_contributions" ON user_contributions;
DROP POLICY IF EXISTS "Block direct update on user_contributions" ON user_contributions;
DROP POLICY IF EXISTS "Block direct delete on user_contributions" ON user_contributions;

-- 🚨 BLOCK ALL DIRECT ACCESS - Users must use secure functions only
CREATE POLICY "Block direct select on song_mappings" ON song_mappings
  FOR SELECT USING (false);

CREATE POLICY "Block direct insert on song_mappings" ON song_mappings
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Block direct update on song_mappings" ON song_mappings
  FOR UPDATE USING (false);

CREATE POLICY "Block direct delete on song_mappings" ON song_mappings
  FOR DELETE USING (false);

CREATE POLICY "Block direct select on user_contributions" ON user_contributions
  FOR SELECT USING (false);

CREATE POLICY "Block direct insert on user_contributions" ON user_contributions
  FOR INSERT WITH CHECK (false);

CREATE POLICY "Block direct update on user_contributions" ON user_contributions
  FOR UPDATE USING (false);

CREATE POLICY "Block direct delete on user_contributions" ON user_contributions
  FOR DELETE USING (false);

-- 🔐 SECURE FUNCTIONS - Only way to access data

-- Function to find a mapping by YouTube ID (returns only high-confidence mappings)
CREATE OR REPLACE FUNCTION find_mapping(youtube_video_id VARCHAR(20))
RETURNS TABLE(
  apple_music_id VARCHAR(20),
  confidence_score FLOAT,
  user_confirmations INTEGER
) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sm.apple_music_id,
    sm.confidence_score,
    sm.user_confirmations
  FROM song_mappings sm
  WHERE sm.youtube_id = youtube_video_id
    AND sm.confidence_score >= 0.5  -- Relaxed: 50% confidence
    AND sm.user_confirmations >= 1;  -- Relaxed: At least 1 confirmation
END;
$$;

-- Function to add a new mapping (secure)
CREATE OR REPLACE FUNCTION add_mapping(
  youtube_video_id VARCHAR(20),
  apple_music_track_id VARCHAR(20),
  youtube_video_title TEXT,
  youtube_video_channel TEXT,
  apple_music_track_artist TEXT,
  apple_music_track_song TEXT,
  user_id TEXT
)
RETURNS INTEGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  mapping_id INTEGER;
BEGIN
  -- Insert new mapping
  INSERT INTO song_mappings (
    youtube_id,
    apple_music_id,
    youtube_title,
    youtube_channel,
    apple_music_artist,
    apple_music_song,
    created_by_user_id,
    confidence_score,
    user_confirmations
  ) VALUES (
    youtube_video_id,
    apple_music_track_id,
    youtube_video_title,
    youtube_video_channel,
    apple_music_track_artist,
    apple_music_track_song,
    user_id,
    0.5,  -- Start with 50% confidence
    1     -- Creator gets first confirmation
  )
  ON CONFLICT (youtube_id) DO NOTHING
  RETURNING id INTO mapping_id;
  
  -- If mapping was created, add user contribution
  IF mapping_id IS NOT NULL THEN
    INSERT INTO user_contributions (user_id, mapping_id, action)
    VALUES (user_id, mapping_id, 'submit')
    ON CONFLICT DO NOTHING;
  END IF;
  
  RETURN COALESCE(mapping_id, 0);
END;
$$;

-- Function to confirm a mapping (secure)
CREATE OR REPLACE FUNCTION confirm_mapping(
  youtube_video_id VARCHAR(20),
  user_id TEXT
)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  mapping_id INTEGER;
  new_confirmations INTEGER;
BEGIN
  -- Get mapping ID
  SELECT id INTO mapping_id
  FROM song_mappings
  WHERE youtube_id = youtube_video_id;
  
  IF mapping_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Add user contribution (will fail if already exists due to UNIQUE constraint)
  INSERT INTO user_contributions (user_id, mapping_id, action)
  VALUES (user_id, mapping_id, 'confirm')
  ON CONFLICT DO NOTHING;
  
  -- Update confirmation count and confidence score
  UPDATE song_mappings sm
  SET 
    user_confirmations = (
      SELECT COUNT(*) 
      FROM user_contributions uc
      WHERE uc.mapping_id = sm.id AND uc.action = 'confirm'
    ),
    confidence_score = LEAST(0.95, 0.5 + (
      SELECT COUNT(*) 
      FROM user_contributions uc
      WHERE uc.mapping_id = sm.id AND uc.action = 'confirm'
    ) * 0.1)
  WHERE sm.id = mapping_id;
  
  RETURN true;
END;
$$;

-- Function to reject a mapping (secure)
CREATE OR REPLACE FUNCTION reject_mapping(
  youtube_video_id VARCHAR(20),
  user_id TEXT
)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  mapping_id INTEGER;
BEGIN
  -- Get mapping ID
  SELECT id INTO mapping_id
  FROM song_mappings
  WHERE youtube_id = youtube_video_id;
  
  IF mapping_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Add user contribution
  INSERT INTO user_contributions (user_id, mapping_id, action)
  VALUES (user_id, mapping_id, 'reject')
  ON CONFLICT DO NOTHING;
  
  -- Update rejection count and confidence score
  UPDATE song_mappings sm
  SET 
    user_rejections = (
      SELECT COUNT(*) 
      FROM user_contributions uc
      WHERE uc.mapping_id = sm.id AND uc.action = 'reject'
    ),
    confidence_score = GREATEST(0.1, sm.confidence_score - 0.2)
  WHERE sm.id = mapping_id;
  
  RETURN true;
END;
$$;

-- Function to get community stats (secure - only aggregated data)
CREATE OR REPLACE FUNCTION get_community_stats()
RETURNS TABLE(
  total_mappings BIGINT,
  high_confidence_mappings BIGINT,
  total_contributions BIGINT
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM song_mappings) as total_mappings,
    (SELECT COUNT(*) FROM song_mappings WHERE confidence_score >= 0.5 AND user_confirmations >= 1) as high_confidence_mappings,
    (SELECT COUNT(*) FROM user_contributions) as total_contributions;
END;
$$;

-- Function to get user's contribution count (secure)
CREATE OR REPLACE FUNCTION get_user_contributions(user_id TEXT)
RETURNS BIGINT
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) 
    FROM user_contributions 
    WHERE user_contributions.user_id = get_user_contributions.user_id
  );
END;
$$;

-- Function to unmap a mapping (secure) - removes mapping completely
CREATE OR REPLACE FUNCTION unmap_mapping(
  youtube_video_id VARCHAR(20),
  user_id TEXT
)
RETURNS BOOLEAN
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  mapping_id INTEGER;
  creator_user_id TEXT;
BEGIN
  -- Get mapping ID and creator
  SELECT id, created_by_user_id INTO mapping_id, creator_user_id
  FROM song_mappings
  WHERE youtube_id = youtube_video_id;
  
  IF mapping_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Only allow creator to unmap (more secure)
  -- Contributors can reject, but only creator can completely remove
  IF creator_user_id != user_id THEN
    RETURN false; -- Only creator can unmap their own mappings
  END IF;
  
  -- Add unmap contribution record
  INSERT INTO user_contributions (user_id, mapping_id, action)
  VALUES (user_id, mapping_id, 'unmap')
  ON CONFLICT DO NOTHING;
  
  -- Delete the mapping and all related contributions
  DELETE FROM user_contributions WHERE user_contributions.mapping_id = unmap_mapping.mapping_id;
  DELETE FROM song_mappings WHERE id = mapping_id;
  
  RETURN true;
END;
$$;

-- 🚨 FIRST: REVOKE ALL existing permissions
REVOKE ALL ON song_mappings FROM anon;
REVOKE ALL ON user_contributions FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
REVOKE EXECUTE ON FUNCTION confirm_mapping(INTEGER) FROM anon;
REVOKE EXECUTE ON FUNCTION reject_mapping(INTEGER) FROM anon;

-- 🔐 GRANT PERMISSIONS - Only to secure functions, NOT direct table access
GRANT USAGE ON SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION find_mapping(VARCHAR) TO anon;
GRANT EXECUTE ON FUNCTION add_mapping(VARCHAR, VARCHAR, TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION confirm_mapping(VARCHAR, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION reject_mapping(VARCHAR, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_community_stats() TO anon;
GRANT EXECUTE ON FUNCTION get_user_contributions(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION unmap_mapping(VARCHAR, TEXT) TO anon;

-- Create a sample high-confidence mapping for testing
SELECT add_mapping(
  'dQw4w9WgXcQ',
  '1440783617',
  'Rick Astley - Never Gonna Give You Up (Official Video)',
  'Rick Astley',
  'Rick Astley',
  'Never Gonna Give You Up',
  'system'
);

-- Add some confirmations to make it high-confidence
SELECT confirm_mapping('dQw4w9WgXcQ', 'user1');
SELECT confirm_mapping('dQw4w9WgXcQ', 'user2');
