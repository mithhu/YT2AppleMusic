import { NextRequest, NextResponse } from "next/server";
import { addMappingFromWebsite } from "@/lib/supabase";
import { searchYoutubeVideoId } from "@/lib/youtube";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackId, artist, song } = body;

    if (!trackId || !artist || !song) {
      return NextResponse.json({ saved: false }, { status: 400 });
    }

    const ytId = await searchYoutubeVideoId(artist, song);
    if (!ytId) {
      return NextResponse.json({ saved: false, reason: "no_youtube_match" });
    }

    await addMappingFromWebsite({
      youtubeId: ytId,
      appleMusicId: trackId.toString(),
      youtubeTitle: `${artist} - ${song}`,
      youtubeChannel: artist,
      appleMusicArtist: artist,
      appleMusicSong: song,
    });

    return NextResponse.json({ saved: true, youtubeId: ytId });
  } catch {
    return NextResponse.json({ saved: false }, { status: 500 });
  }
}
