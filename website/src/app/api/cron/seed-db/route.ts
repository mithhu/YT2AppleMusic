import { NextRequest } from "next/server";
import {
  findYoutubeIdByAppleMusicId,
  addMappingFromWebsite,
} from "@/lib/supabase";
import { searchYoutubeVideoId } from "@/lib/youtube";

const APPLE_RSS_URL =
  "https://rss.itunes.apple.com/api/v1/us/apple-music/top-songs/all/100/explicit.json";

const BATCH_SIZE = 5;
const BATCH_DELAY_MS = 2000;
const MAX_RUNTIME_MS = 55_000;

interface AppleRSSFeed {
  feed: {
    results: Array<{
      id: string;
      artistName: string;
      name: string;
    }>;
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  let processed = 0;
  let added = 0;
  let skipped = 0;
  let failed = 0;

  try {
    const res = await fetch(APPLE_RSS_URL);
    if (!res.ok) {
      return Response.json(
        { error: "Failed to fetch Apple Music RSS", status: res.status },
        { status: 502 }
      );
    }

    const data: AppleRSSFeed = await res.json();
    const songs = data.feed?.results ?? [];

    for (let i = 0; i < songs.length; i += BATCH_SIZE) {
      if (Date.now() - startTime > MAX_RUNTIME_MS) {
        console.log(`[seed-db] Stopping early at ${processed} songs due to time limit`);
        break;
      }

      const batch = songs.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (song) => {
          processed++;
          try {
            const existing = await findYoutubeIdByAppleMusicId(song.id);
            if (existing) {
              skipped++;
              return;
            }

            const ytId = await searchYoutubeVideoId(song.artistName, song.name);
            if (!ytId) {
              failed++;
              return;
            }

            await addMappingFromWebsite({
              youtubeId: ytId,
              appleMusicId: song.id,
              youtubeTitle: `${song.artistName} - ${song.name}`,
              youtubeChannel: song.artistName,
              appleMusicArtist: song.artistName,
              appleMusicSong: song.name,
            });
            added++;
          } catch {
            failed++;
          }
        })
      );

      if (i + BATCH_SIZE < songs.length) {
        await sleep(BATCH_DELAY_MS);
      }
    }
  } catch (err) {
    console.error("[seed-db] Fatal error:", err);
    return Response.json(
      { error: "Internal error", processed, added, skipped, failed },
      { status: 500 }
    );
  }

  const elapsed = Date.now() - startTime;
  const summary = { processed, added, skipped, failed, elapsedMs: elapsed };
  console.log("[seed-db] Complete:", summary);

  return Response.json(summary);
}
