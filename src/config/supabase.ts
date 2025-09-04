// Supabase Configuration
// Replace these with your actual Supabase project credentials

export const SUPABASE_CONFIG = {
  // Community Supabase project - shared by all users
  // This enables a true community database where everyone contributes
  url: "https://rqdqzajpstsibfmghkcj.supabase.co",

  // Supabase anon/public key - safe to expose in client-side code
  // This key only allows read/write to public tables with RLS policies
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZHF6YWpwc3RzaWJmbWdoa2NqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5Mjk4MzYsImV4cCI6MjA3MjUwNTgzNn0.o046QJ5OJIrdSn1y9hlqDSsXSKDeV7lgHr9ECx52iCI",
};

// Validate configuration
export const isSupabaseConfigured = (): boolean => {
  return (
    SUPABASE_CONFIG.url !== "" &&
    SUPABASE_CONFIG.anonKey !== "" &&
    SUPABASE_CONFIG.url.includes("supabase.co") &&
    SUPABASE_CONFIG.anonKey.startsWith("eyJ") // JWT tokens start with eyJ
  );
};
