import { NextRequest } from "next/server";
import {
  findYoutubeIdByAppleMusicId,
  addMappingFromWebsite,
} from "@/lib/supabase";
import { searchYoutubeVideoId } from "@/lib/youtube";

const RSS_BASE = "https://rss.applemarketingtools.com/api/v2";

const FEEDS = [
  { label: "US Songs",         path: "us/music/most-played/100/songs.json" },
  { label: "US Music Videos",  path: "us/music/most-played/100/music-videos.json" },
  { label: "UK Songs",         path: "gb/music/most-played/100/songs.json" },
  { label: "India Songs",      path: "in/music/most-played/100/songs.json" },
  { label: "Japan Songs",      path: "jp/music/most-played/100/songs.json" },
  { label: "S. Korea Songs",   path: "kr/music/most-played/100/songs.json" },
  { label: "France Songs",     path: "fr/music/most-played/100/songs.json" },
  { label: "Brazil Songs",     path: "br/music/most-played/100/songs.json" },
  { label: "Germany Songs",    path: "de/music/most-played/100/songs.json" },
  { label: "Australia Songs",  path: "au/music/most-played/100/songs.json" },
  { label: "Canada Songs",     path: "ca/music/most-played/100/songs.json" },
];

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

function getTodaysFeed(): (typeof FEEDS)[number] {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86_400_000,
  );
  return FEEDS[dayOfYear % FEEDS.length];
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const feed = getTodaysFeed();
  const feedUrl = `${RSS_BASE}/${feed.path}`;
  console.log(`[seed-db] Today's feed: ${feed.label} (${feedUrl})`);

  const startTime = Date.now();
  let processed = 0;
  let added = 0;
  let skipped = 0;
  let failed = 0;

  try {
    const res = await fetch(feedUrl);
    if (!res.ok) {
      return Response.json(
        { error: `Failed to fetch ${feed.label}`, status: res.status },
        { status: 502 },
      );
    }

    const data: AppleRSSFeed = await res.json();
    const songs = data.feed?.results ?? [];

    for (let i = 0; i < songs.length; i += BATCH_SIZE) {
      if (Date.now() - startTime > MAX_RUNTIME_MS) {
        console.log(
          `[seed-db] Stopping early at ${processed} songs due to time limit`,
        );
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

            const ytId = await searchYoutubeVideoId(
              song.artistName,
              song.name,
            );
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
        }),
      );

      if (i + BATCH_SIZE < songs.length) {
        await sleep(BATCH_DELAY_MS);
      }
    }
  } catch (err) {
    console.error("[seed-db] Fatal error:", err);
    return Response.json(
      { error: "Internal error", feed: feed.label, processed, added, skipped, failed },
      { status: 500 },
    );
  }

  const elapsed = Date.now() - startTime;
  const summary = {
    feed: feed.label,
    processed,
    added,
    skipped,
    failed,
    elapsedMs: elapsed,
  };
  console.log("[seed-db] Complete:", summary);

  return Response.json(summary);
}
