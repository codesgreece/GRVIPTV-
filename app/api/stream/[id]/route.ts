import { getChannelById, LiveChannelsError } from "@/lib/live/channels";
import {
  isHlsUrl,
  rewriteHlsPlaylist,
  toMpegTsSourceUrl,
} from "@/lib/live/stream-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RouteContext = {
  params: Promise<{ id: string }>;
};

const UPSTREAM_HEADERS = {
  "User-Agent": "VLC/3.0.18 LibVLC/3.0.18",
  Accept: "*/*",
  Connection: "close",
} as const;

async function fetchUpstream(
  url: string,
  init?: { range?: string | null },
): Promise<Response> {
  const headers = new Headers(UPSTREAM_HEADERS);
  if (init?.range) headers.set("Range", init.range);

  return fetch(url, {
    headers,
    cache: "no-store",
    redirect: "follow",
  });
}

function corsHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Range, Content-Type");
  headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  return headers;
}

function isAllowedSegmentUrl(segmentUrl: string, sourceUrl: string): boolean {
  try {
    const seg = new URL(segmentUrl);
    const source = new URL(sourceUrl);
    if (seg.protocol !== "http:" && seg.protocol !== "https:") return false;
    // Segments must stay on the same IPTV host (never open proxy)
    return seg.hostname === source.hostname;
  } catch {
    return false;
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) {
      return new Response("Not found", { status: 404, headers: corsHeaders() });
    }

    const channelId = decodeURIComponent(id);
    const channel = await getChannelById(channelId);
    if (!channel?.sourceUrl) {
      return new Response("Not found", { status: 404, headers: corsHeaders() });
    }

    const { searchParams } = new URL(request.url);
    const seg = searchParams.get("seg");

    // Proxy individual HLS segments (short-lived — serverless friendly)
    if (seg) {
      let segmentUrl: string;
      try {
        segmentUrl = new URL(seg).toString();
      } catch {
        return new Response("Bad segment", {
          status: 400,
          headers: corsHeaders(),
        });
      }

      if (!isAllowedSegmentUrl(segmentUrl, channel.sourceUrl)) {
        return new Response("Bad segment", {
          status: 400,
          headers: corsHeaders(),
        });
      }

      const upstream = await fetchUpstream(segmentUrl, {
        range: request.headers.get("range"),
      });

      if (!upstream.ok && upstream.status !== 206) {
        return new Response("Segment unavailable", {
          status: 502,
          headers: corsHeaders(),
        });
      }

      const headers = corsHeaders({
        "Content-Type": upstream.headers.get("content-type") || "video/MP2T",
      });
      const contentLength = upstream.headers.get("content-length");
      if (contentLength) headers.set("Content-Length", contentLength);
      const contentRange = upstream.headers.get("content-range");
      if (contentRange) headers.set("Content-Range", contentRange);
      const acceptRanges = upstream.headers.get("accept-ranges");
      if (acceptRanges) headers.set("Accept-Ranges", acceptRanges);

      return new Response(upstream.body, {
        status: upstream.status,
        headers,
      });
    }

    let sourceUrl = channel.sourceUrl;
    let upstream = await fetchUpstream(sourceUrl, {
      range: request.headers.get("range"),
    });

    // If HLS fails, fall back to progressive MPEG-TS
    if (!upstream.ok && upstream.status !== 206 && isHlsUrl(sourceUrl)) {
      sourceUrl = toMpegTsSourceUrl(channel.sourceUrl);
      upstream = await fetchUpstream(sourceUrl, {
        range: request.headers.get("range"),
      });
    }

    if (!upstream.ok && upstream.status !== 206) {
      return new Response("Stream unavailable", {
        status: 502,
        headers: corsHeaders(),
      });
    }

    // Rewrite HLS playlists so segments stay on our HTTPS origin
    if (
      isHlsUrl(sourceUrl) ||
      (upstream.headers.get("content-type") || "").includes("mpegurl")
    ) {
      const text = await upstream.text();
      if (!text.includes("#EXT")) {
        return new Response("Stream unavailable", {
          status: 502,
          headers: corsHeaders(),
        });
      }

      const origin = new URL(sourceUrl).origin;
      const rewritten = rewriteHlsPlaylist(text, channelId, origin);

      return new Response(rewritten, {
        status: 200,
        headers: corsHeaders({
          "Content-Type": "application/vnd.apple.mpegurl",
        }),
      });
    }

    // Progressive MPEG-TS / binary stream
    const headers = corsHeaders({
      "Content-Type": upstream.headers.get("content-type") || "video/mp2t",
    });
    const contentLength = upstream.headers.get("content-length");
    if (contentLength) headers.set("Content-Length", contentLength);
    const acceptRanges = upstream.headers.get("accept-ranges");
    if (acceptRanges) headers.set("Accept-Ranges", acceptRanges);
    const contentRange = upstream.headers.get("content-range");
    if (contentRange) headers.set("Content-Range", contentRange);

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
    });
  } catch (error) {
    if (error instanceof LiveChannelsError) {
      return new Response("Stream unavailable", {
        status: 502,
        headers: corsHeaders(),
      });
    }
    return new Response("Stream unavailable", {
      status: 502,
      headers: corsHeaders(),
    });
  }
}
