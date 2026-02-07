import { NextResponse } from "next/server";

// Using Deezer API - no authentication required
// Deezer provides 30-second previews for free

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get("trackId");
  const searchQuery = searchParams.get("q");

  try {
    let previewUrl: string | null = null;
    let trackInfo: {
      name: string;
      artist: string;
      album: string;
      albumArt: string;
    } | null = null;

    if (trackId) {
      // Fetch by Deezer track ID
      const response = await fetch(`https://api.deezer.com/track/${trackId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch track from Deezer");
      }
      const track = await response.json();

      if (track.error) {
        throw new Error(track.error.message || "Track not found");
      }

      previewUrl = track.preview;
      trackInfo = {
        name: track.title,
        artist: track.artist?.name,
        album: track.album?.title,
        albumArt: track.album?.cover_xl || track.album?.cover_big,
      };
    } else if (searchQuery) {
      // Search for track
      const response = await fetch(
        `https://api.deezer.com/search?q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      if (!response.ok) {
        throw new Error("Failed to search Deezer");
      }
      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const track = data.data[0];
        previewUrl = track.preview;
        trackInfo = {
          name: track.title,
          artist: track.artist?.name,
          album: track.album?.title,
          albumArt: track.album?.cover_xl || track.album?.cover_big,
        };
      }
    } else {
      return NextResponse.json(
        { error: "Either trackId or q (search query) is required" },
        { status: 400 }
      );
    }

    if (!previewUrl) {
      return NextResponse.json(
        { error: "No preview available for this track" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      previewUrl,
      ...trackInfo,
    });
  } catch (error) {
    console.error("Deezer API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch track preview" },
      { status: 500 }
    );
  }
}
