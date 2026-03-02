-- Run this in your Supabase SQL Editor to enable reverse lookup
-- (find YouTube video ID from Apple Music track ID)

CREATE OR REPLACE FUNCTION find_mapping_by_apple_music(apple_music_track_id VARCHAR(20))
RETURNS TABLE(
  youtube_id VARCHAR(20),
  confidence_score FLOAT,
  user_confirmations INTEGER
) 
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sm.youtube_id,
    sm.confidence_score,
    sm.user_confirmations
  FROM song_mappings sm
  WHERE sm.apple_music_id = apple_music_track_id
    AND sm.confidence_score >= 0.5
    AND sm.user_confirmations >= 1;
END;
$$;

GRANT EXECUTE ON FUNCTION find_mapping_by_apple_music(VARCHAR) TO anon;
