export interface MusicData {
  videoId: string;
  title: string;
  channel: string;
  artist: string;
  songTitle: string;
  url: string;
  timestamp: number;
  confidence?: number;
  appleMusicUrl?: string;
  appleMusicId?: string;
}

export interface ExtensionSettings {
  autoPlay: boolean;
  showNotifications: boolean;
  openInBackground: boolean;
  useNativeApp: boolean;
  aiEnhancedSearch: boolean;
  openAIApiKey?: string;
}

export interface AppleMusicSearchResult {
  id: string;
  type: string;
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    url: string;
    artwork?: {
      url: string;
      width: number;
      height: number;
    };
  };
}

export interface AISearchResponse {
  artist: string;
  songTitle: string;
  confidence: number;
  appleMusicQuery: string;
  alternativeQueries?: string[];
}

export type MessageType =
  | "MUSIC_DETECTED"
  | "SEARCH_APPLE_MUSIC"
  | "GET_SETTINGS"
  | "UPDATE_SETTINGS"
  | "GET_CURRENT_VIDEO"
  | "TEST_DETECTION"
  | "SEARCH_AND_PLAY"
  | "AUTO_PLAY_FIRST_RESULT"
  | "AI_ENHANCE_SEARCH"
  | "GET_CACHE_STATS"
  | "EXPORT_CACHE"
  | "SHOW_CONFIRMATION_DIALOG"
  | "GET_PENDING_CONFIRMATION"
  | "CONFIRM_CACHE_ENTRY"
  | "REJECT_CACHE_ENTRY"
  | "STORE_PENDING_CONFIRMATION"
  | "SHOW_PENDING_CONFIRMATIONS"
  | "GET_COMMUNITY_STATS"
  | "CONTENT_SUPABASE_FIND_MAPPING"
  | "CONTENT_SUPABASE_ADD_MAPPING"
  | "CONTENT_SUPABASE_GET_STATS"
  | "CONTENT_SUPABASE_CONFIRM_MAPPING";

export interface ExtensionMessage {
  type: MessageType;
  data?: any;
}

export interface ExtensionResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export interface AppleMusicLinkResult {
  url: string;
  needsConfirmation: boolean;
  confirmationData: any | null;
  isCached: boolean;
}
