import { MusicData, AISearchResponse } from "../types";

export class AIUtils {
  private static readonly OPENAI_API_BASE = "https://api.openai.com/v1";

  /**
   * Use AI to enhance music search and extraction
   */
  static async enhanceSearchWithAI(
    musicData: MusicData,
    apiKey?: string,
  ): Promise<AISearchResponse> {
    if (!apiKey) {
      console.log(
        "🤖 No OpenAI API key provided, using rule-based enhancement",
      );
      return this.enhanceSearchRuleBased(musicData);
    }

    try {
      const prompt = this.createSearchPrompt(musicData);

      const requestBody = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a music expert that helps identify songs and artists from YouTube video titles and metadata. Return responses in valid JSON format only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 200,
      };

      console.log("🤖 Making OpenAI API request for search enhancement:");
      console.log("🤖 Input music data:", musicData);
      console.log("🤖 Generated prompt:", prompt);
      console.log("🤖 Request body:", requestBody);

      const response = await fetch(`${this.OPENAI_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log(`🤖 OpenAI API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`🤖 OpenAI API error: ${response.status} - ${errorText}`);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("🤖 OpenAI API full response:", data);

      const content = data.choices[0]?.message?.content;
      console.log("🤖 OpenAI API content:", content);

      const aiResponse = JSON.parse(content);
      console.log("🤖 Parsed AI response:", aiResponse);

      const result = {
        artist: aiResponse.artist || musicData.artist,
        songTitle: aiResponse.songTitle || musicData.songTitle,
        confidence: aiResponse.confidence || 0.7,
        appleMusicQuery:
          aiResponse.appleMusicQuery ||
          `${aiResponse.artist} ${aiResponse.songTitle}`,
        alternativeQueries: aiResponse.alternativeQueries || [],
      };

      console.log("🤖 Final AI-enhanced search result:", result);
      return result;
    } catch (error) {
      console.error(
        "🤖 AI enhancement failed, falling back to rule-based:",
        error,
      );
      return this.enhanceSearchRuleBased(musicData);
    }
  }

  /**
   * Create a prompt for AI to analyze the music data
   */
  private static createSearchPrompt(musicData: MusicData): string {
    return `
Analyze this YouTube video and extract the correct artist and song title for Apple Music search:

Video Title: "${musicData.title}"
Channel Name: "${musicData.channel}"
Current Extracted Artist: "${musicData.artist}"
Current Extracted Song: "${musicData.songTitle}"

Please provide a JSON response with:
{
  "artist": "cleaned artist name",
  "songTitle": "cleaned song title", 
  "confidence": 0.0-1.0,
  "appleMusicQuery": "optimized search query for Apple Music",
  "alternativeQueries": ["alternative query 1", "alternative query 2"]
}

Rules:
- Remove words like "official", "music video", "lyric video", "audio", "VEVO"
- Clean up featuring artists (feat./ft.) properly
- Handle remixes and versions correctly
- Ensure artist and song names are properly capitalized
- Confidence should reflect how certain you are about the extraction
`;
  }

  /**
   * Rule-based enhancement as fallback
   */
  private static enhanceSearchRuleBased(
    musicData: MusicData,
  ): AISearchResponse {
    console.log("🔧 Using rule-based search enhancement");

    let artist = musicData.artist;
    let songTitle = musicData.songTitle;

    // Clean up common patterns
    const cleanPatterns = [
      /\s*(official\s+)?(music\s+)?video\s*/gi,
      /\s*\[(official|lyric|audio|4k|hd)\]\s*/gi,
      /\s*\((official|lyric|audio|4k|hd)\)\s*/gi,
      /\s*(vevo|records|entertainment|music)\s*/gi,
    ];

    cleanPatterns.forEach((pattern) => {
      artist = artist.replace(pattern, " ").trim();
      songTitle = songTitle.replace(pattern, " ").trim();
    });

    // Handle featuring artists
    const featMatch = songTitle.match(
      /(.+?)\s+(feat\.?|ft\.?|featuring)\s+(.+)/i,
    );
    if (featMatch) {
      songTitle = featMatch[1].trim();
      // Keep the featuring info but clean it up
      const featArtist = featMatch[3].trim();
      songTitle += ` (feat. ${featArtist})`;
    }

    // Clean up extra spaces
    artist = artist.replace(/\s+/g, " ").trim();
    songTitle = songTitle.replace(/\s+/g, " ").trim();

    const appleMusicQuery = `${artist} ${songTitle}`.trim();

    const result = {
      artist,
      songTitle,
      confidence: 0.8,
      appleMusicQuery,
      alternativeQueries: [
        `${artist} ${songTitle.split("(")[0].trim()}`, // Without parentheses
        `${songTitle} ${artist}`, // Reversed order
      ],
    };

    console.log("🔧 Rule-based search enhancement result:", result);
    return result;
  }

  /**
   * Analyze if a YouTube video is likely to be music
   */
  static async analyzeMusicProbability(
    musicData: MusicData,
    apiKey?: string,
  ): Promise<number> {
    if (!apiKey) {
      console.log(
        "🤖 No OpenAI API key provided, using rule-based music probability analysis",
      );
      return this.analyzeMusicProbabilityRuleBased(musicData);
    }

    try {
      const prompt = `
Analyze if this YouTube video is a music video/song. Return only a number between 0.0 and 1.0:

Title: "${musicData.title}"
Channel: "${musicData.channel}"

Consider:
- Music keywords in title
- Channel name patterns
- Title structure
- Common music video indicators

Return only the probability number (0.0 to 1.0):
`;

      const requestBody = {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a music expert. Analyze YouTube videos to determine if they contain music. Respond with only a number between 0 and 1.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 10,
      };

      console.log("🤖 Making OpenAI API request for music probability:");
      console.log("🤖 Input music data:", musicData);
      console.log("🤖 Generated prompt:", prompt);
      console.log("🤖 Request body:", requestBody);

      const response = await fetch(`${this.OPENAI_API_BASE}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1,
          max_tokens: 10,
        }),
      });

      const data = await response.json();
      const probability = parseFloat(data.choices[0].message.content.trim());

      return isNaN(probability) ? 0.5 : Math.max(0, Math.min(1, probability));
    } catch (error) {
      console.error("AI music analysis failed:", error);
      return this.analyzeMusicProbabilityRuleBased(musicData);
    }
  }

  /**
   * Rule-based music probability analysis
   */
  private static analyzeMusicProbabilityRuleBased(
    musicData: MusicData,
  ): number {
    console.log("🔧 Using rule-based music probability analysis");

    const title = musicData.title.toLowerCase();
    const channel = musicData.channel?.toLowerCase() || "";

    let score = 0;

    // Strong music indicators
    const strongIndicators = [
      "official music video",
      "music video",
      "official video",
      "official audio",
      "lyric video",
      "lyrics",
    ];

    const mediumIndicators = [
      "official",
      "vevo",
      "records",
      "music",
      "audio",
      "single",
      "album",
      "ep",
      "acoustic",
      "live",
    ];

    const weakIndicators = ["cover", "remix", "feat", "ft.", "featuring"];

    console.log("🔧 Analyzing title:", title);
    console.log("🔧 Analyzing channel:", channel);

    // Check title
    strongIndicators.forEach((indicator) => {
      if (title.includes(indicator)) {
        console.log(`🔧 Found strong indicator: ${indicator}`);
        score += 0.3;
      }
    });

    mediumIndicators.forEach((indicator) => {
      if (title.includes(indicator)) {
        console.log(`🔧 Found medium indicator: ${indicator}`);
        score += 0.1;
      }
    });

    weakIndicators.forEach((indicator) => {
      if (title.includes(indicator)) {
        console.log(`🔧 Found weak indicator: ${indicator}`);
        score += 0.05;
      }
    });

    // Check channel
    if (channel.includes("vevo")) {
      console.log("🔧 Found VEVO channel");
      score += 0.4;
    }
    if (channel.includes("records")) {
      console.log("🔧 Found records channel");
      score += 0.3;
    }
    if (channel.includes("music")) {
      console.log("🔧 Found music channel");
      score += 0.2;
    }
    if (channel.includes("official")) {
      console.log("🔧 Found official channel");
      score += 0.2;
    }

    // Check for artist - song pattern
    if (/[-–—]/.test(musicData.title) || /\bby\b/i.test(musicData.title)) {
      console.log("🔧 Found artist-song pattern");
      score += 0.2;
    }

    const finalScore = Math.min(1, score);
    console.log("🔧 Rule-based music probability score:", finalScore);

    return finalScore;
  }
}
