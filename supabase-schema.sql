-- YT2AppleMusic Community Database Schema
-- Run this in your Supabase SQL Editor

-- Song mappings table
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

-- User contributions table
CREATE TABLE IF NOT EXISTS user_contributions (
  id SERIAL PRIMARY KEY,
  user_id TEXT NOT NULL,
  mapping_id INTEGER REFERENCES song_mappings(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('confirm', 'reject', 'submit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mapping_id, action) -- Prevent duplicate votes
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_song_mappings_youtube_id ON song_mappings(youtube_id);
CREATE INDEX IF NOT EXISTS idx_song_mappings_confidence ON song_mappings(confidence_score DESC, user_confirmations DESC);
CREATE INDEX IF NOT EXISTS idx_song_mappings_apple_music_id ON song_mappings(apple_music_id);
CREATE INDEX IF NOT EXISTS idx_user_contributions_user_id ON user_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contributions_mapping_id ON user_contributions(mapping_id);

-- Function to calculate confidence score
CREATE OR REPLACE FUNCTION calculate_confidence_score(confirmations INTEGER, rejections INTEGER)
RETURNS FLOAT AS $$
BEGIN
  -- Wilson score interval for confidence
  -- Higher confirmations = higher confidence
  -- More total votes = more reliable confidence
  DECLARE
    total_votes INTEGER := confirmations + rejections;
    positive_ratio FLOAT;
    confidence FLOAT;
  BEGIN
    IF total_votes = 0 THEN
      RETURN 0.5; -- Neutral confidence for new mappings
    END IF;
    
    positive_ratio := confirmations::FLOAT / total_votes;
    
    -- Simple confidence calculation
    -- Can be improved with Wilson score interval
    confidence := positive_ratio * (1.0 - EXP(-total_votes::FLOAT / 10.0));
    
    RETURN GREATEST(0.0, LEAST(1.0, confidence));
  END;
END;
$$ LANGUAGE plpgsql;

-- Function to confirm a mapping
CREATE OR REPLACE FUNCTION confirm_mapping(mapping_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE song_mappings 
  SET 
    user_confirmations = user_confirmations + 1,
    confidence_score = calculate_confidence_score(user_confirmations + 1, user_rejections),
    updated_at = NOW()
  WHERE id = mapping_id;
END;
$$ LANGUAGE plpgsql;

-- Function to reject a mapping
CREATE OR REPLACE FUNCTION reject_mapping(mapping_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE song_mappings 
  SET 
    user_rejections = user_rejections + 1,
    confidence_score = calculate_confidence_score(user_confirmations, user_rejections + 1),
    updated_at = NOW()
  WHERE id = mapping_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_song_mappings_updated_at
  BEFORE UPDATE ON song_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE song_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_contributions ENABLE ROW LEVEL SECURITY;

-- Allow read access to all mappings
CREATE POLICY "Allow read access to song_mappings" ON song_mappings
  FOR SELECT USING (true);

-- Allow insert for new mappings
CREATE POLICY "Allow insert to song_mappings" ON song_mappings
  FOR INSERT WITH CHECK (true);

-- Allow update for confirmations/rejections
CREATE POLICY "Allow update to song_mappings" ON song_mappings
  FOR UPDATE USING (true);

-- Allow read access to contributions
CREATE POLICY "Allow read access to user_contributions" ON user_contributions
  FOR SELECT USING (true);

-- Allow insert for new contributions
CREATE POLICY "Allow insert to user_contributions" ON user_contributions
  FOR INSERT WITH CHECK (true);

-- Create some sample data (optional)
INSERT INTO song_mappings (
  youtube_id, 
  apple_music_id, 
  youtube_title, 
  youtube_channel, 
  apple_music_artist, 
  apple_music_song,
  user_confirmations,
  confidence_score
) VALUES 
(
  'dQw4w9WgXcQ', 
  '1440783617', 
  'Rick Astley - Never Gonna Give You Up (Official Video)', 
  'Rick Astley', 
  'Rick Astley', 
  'Never Gonna Give You Up',
  5,
  0.9
) ON CONFLICT (youtube_id) DO NOTHING;

-- Grant permissions to anon role (for public access)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE ON song_mappings TO anon;
GRANT SELECT, INSERT ON user_contributions TO anon;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT EXECUTE ON FUNCTION confirm_mapping(INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION reject_mapping(INTEGER) TO anon;
