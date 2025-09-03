# Cache System - YT2AppleMusic Extension

## Overview

The cache system stores **YouTube Video ID → Apple Music Song ID** mappings to avoid repeated iTunes API calls and provide faster responses for previously processed songs.

## What Exactly Is Being Cached?

### Cache Entry Structure

```typescript
interface CacheEntry {
  youtubeId: string; // YouTube video ID (e.g., "GP7zpdwo3Xo")
  appleMusicSongId: string; // Apple Music song ID (e.g., "1440783617")
  artist: string; // Artist name (e.g., "Nickelback")
  songTitle: string; // Song title (e.g., "Far Away")
  timestamp: number; // When cached (Date.now())
  confirmed: boolean; // User confirmed this mapping is correct
}
```

### Real Example

```javascript
{
  youtubeId: "GP7zpdwo3Xo",
  appleMusicSongId: "1440783617",
  artist: "Nickelback",
  songTitle: "Far Away",
  timestamp: 1703001234567,
  confirmed: true
}
```

## Cache Checking Process

### 1. **Cache Lookup** (First Priority)

```javascript
// Check if we've seen this YouTube video before
const cachedSongId = await CacheUtils.getCachedSongId(youtubeId);
```

**What it checks:**

- ✅ Does this YouTube ID exist in cache?
- ✅ Is the cache entry **confirmed** by user?
- ❌ Skip unconfirmed entries for direct use

### 2. **Cache Hit Flow**

```javascript
if (cachedSongId) {
  const cachedUrl = `https://music.apple.com/us/song/${cachedSongId}`;
  console.log(`🎯 Using cached Apple Music URL: ${cachedUrl}`);
  // Skip iTunes API call entirely!
}
```

### 3. **Cache Miss Flow**

```javascript
// No cache hit - call iTunes API
const iTunesUrl = `https://itunes.apple.com/search?term=${query}`;
const response = await fetch(iTunesUrl);

// Add result to cache (unconfirmed)
await CacheUtils.addCacheEntry(youtubeId, song.trackId, musicData);
```

## Cache States

### **Unconfirmed Entries** (`confirmed: false`)

- Just added from iTunes API response
- **Not used for direct cache hits**
- **Triggers user confirmation dialog**
- Shows in popup: "Is this match correct?"

### **Confirmed Entries** (`confirmed: true`)

- User clicked "Yes, Correct" in popup
- **Used for instant cache hits**
- **No iTunes API call needed**
- **No confirmation dialog**

## User Confirmation Flow

### 1. **New Song Detection**

```
YouTube: "Nickelback - Far Away" (GP7zpdwo3Xo)
↓
iTunes API: Find song → trackId: 1440783617
↓
Cache: Add unconfirmed entry
↓
Popup: "Is 'Nickelback - Far Away' the correct match?"
```

### 2. **User Confirms**

```
User clicks: "Yes, Correct"
↓
Cache: Set confirmed = true
↓
Future visits: Instant cache hit!
```

### 3. **User Rejects**

```
User clicks: "No, Wrong"
↓
Cache: Remove entry
↓
Future visits: Try iTunes API again
```

## Cache Benefits

### **Performance**

- ⚡ **Instant loading** for confirmed songs
- 🚫 **No iTunes API calls** for cached songs
- 📱 **Faster popup response**

### **Reliability**

- ✅ **User-verified mappings** (confirmed entries)
- 🔄 **Self-correcting** (wrong matches get removed)
- 💾 **Persistent storage** (survives browser restarts)

### **User Experience**

- 🎯 **One-click confirmation** for new songs
- 📊 **Cache statistics** in popup
- 📤 **Export functionality** for debugging

## Cache Storage

### **Location**

- Uses `chrome.storage.local` (persistent)
- Key: `"youtube_apple_music_cache"`
- Format: JSON string of CacheEntry array

### **Size Management**

- No automatic cleanup (grows indefinitely)
- User can export/clear if needed
- Each entry ~200 bytes

## Debug Information

### **Cache Hit**

```javascript
🎯 Found cached Apple Music song ID for YouTube GP7zpdwo3Xo: 1440783617
🎯 Using cached Apple Music URL: https://music.apple.com/us/song/1440783617
```

### **Cache Miss**

```javascript
🔍 iTunes Search Query: "Nickelback Far Away"
🎵 iTunes API Response: {resultCount: 1, results: [...]}
📝 Added unconfirmed cache entry: YouTube GP7zpdwo3Xo → Apple Music 1440783617
```

### **Cache Confirmation**

```javascript
✅ Confirmed cache entry: YouTube GP7zpdwo3Xo → Apple Music 1440783617
💾 Saved 18 cached mappings to storage
```

## Cache Statistics

The popup shows:

- **Total entries**: All cached mappings
- **Confirmed entries**: User-verified mappings
- **Success rate**: Confirmed / Total ratio

Example: "Cache: 15 confirmed / 18 total (83%)"

## Why This System?

### **Problem Solved**

1. **iTunes API Rate Limits**: Avoid repeated calls
2. **User Verification**: Ensure correct matches
3. **Performance**: Instant loading for known songs
4. **Reliability**: Self-correcting system

### **Alternative Approaches Considered**

- ❌ **Auto-confirm all**: Could cache wrong matches
- ❌ **No caching**: Slow repeated API calls
- ❌ **Time-based expiry**: User confirmations shouldn't expire
- ✅ **User confirmation**: Best balance of speed + accuracy

---

_Last Updated: December 19, 2024_
_Cache System Version: 1.0_
