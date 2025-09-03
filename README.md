# YT2AppleMusic - YouTube to Apple Music Bridge Extension

A browser extension that automatically detects music videos on YouTube and plays them on Apple Music.

## Features

- 🎵 **Automatic Detection**: Detects when you open music videos on YouTube
- 🍎 **Apple Music Integration**: Automatically searches and opens songs in Apple Music
- ⚙️ **Customizable Settings**: Toggle auto-play, notifications, and background opening
- 🎯 **Smart Matching**: Intelligently extracts artist and song information from YouTube titles
- 🔄 **Manual Control**: Search current video manually or test detection

## How It Works

1. **Detection**: The extension monitors YouTube pages for music videos using content scripts
2. **Extraction**: It extracts song title, artist, and channel information from the YouTube page
3. **Matching**: Uses intelligent parsing to identify the artist and song title
4. **Integration**: Opens Apple Music with a search for the detected song
5. **Playback**: You can then play the song directly in Apple Music

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your browser toolbar

## Usage

### Automatic Mode

1. Enable "Auto-play detected music" in the extension popup
2. Visit any YouTube music video
3. The extension will automatically detect it and open Apple Music

### Manual Mode

1. Open any YouTube video
2. Click the extension icon
3. Click "Search Current Video" to manually search Apple Music

## Settings

- **Auto-play detected music**: Automatically open Apple Music when music is detected
- **Show notifications**: Display notifications when music is detected
- **Open in background**: Open Apple Music tabs in the background

## Music Detection

The extension detects music videos by looking for:

- Keywords like "official music video", "official audio", "lyric video"
- Music-related channel names (containing "vevo", "records", "music", etc.)
- Common music title patterns (Artist - Song, Song by Artist, etc.)

## Supported Platforms

- **YouTube**: All music videos and audio tracks
- **Apple Music**: Web player integration
- **Browsers**: Chrome, Edge, and other Chromium-based browsers

## Privacy

This extension:

- Only processes YouTube pages you visit
- Does not collect or store personal data
- Does not track your browsing history
- Only communicates with Apple Music for search purposes

## Technical Details

### Architecture

- **Content Script**: Monitors YouTube pages and extracts video data
- **Background Script**: Handles communication and Apple Music integration
- **Popup Interface**: Provides user controls and settings
- **Storage**: Saves user preferences locally

### Files Structure

```
├── manifest.json              # Extension configuration
├── background.js             # Background service worker
├── youtube-detector.js       # YouTube content script
├── popup.html               # Extension popup interface
├── popup.js                 # Popup functionality
├── apple-music-player.html  # Apple Music integration page
└── icons/                   # Extension icons
```

## Limitations

- Requires user interaction for automatic playback due to browser security policies
- Apple Music integration opens search results (not direct playback)
- Detection accuracy depends on video title formatting
- Some music videos may not be detected if they don't follow common patterns

## Contributing

Feel free to contribute by:

- Improving music detection algorithms
- Adding support for other music platforms
- Enhancing the user interface
- Reporting bugs or suggesting features

## License

This project is open source and available under the MIT License.

## Troubleshooting

### Extension not working

1. Refresh the YouTube page
2. Check if the extension is enabled
3. Try disabling and re-enabling the extension

### Music not detected

1. Check if the video title contains artist and song information
2. Try the manual search feature
3. Some videos may not be recognized as music content

### Apple Music not opening

1. Ensure you have an Apple Music subscription
2. Check if Apple Music is accessible in your region
3. Try opening Apple Music manually first

## Support

If you encounter any issues or have suggestions, please create an issue in the repository.
