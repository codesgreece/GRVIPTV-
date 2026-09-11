import { getChannelById, LiveChannelsError } from "@/lib/live/channels";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    if (!id) {
      return new Response("Not found", { status: 404 });
    }

    const channel = await getChannelById(id);
    if (!channel?.sourceUrl) {
      return new Response("Not found", { status: 404 });
    }

    const incoming = new Headers();
    const range = request.headers.get("range");
    if (range) incoming.set("Range", range);
    incoming.set("User-Agent", "GRVIP-OTT/1.0");
    incoming.set("Accept", "*/*");

    const upstream = await fetch(channel.sourceUrl, {
      headers: incoming,
      cache: "no-store",
      redirect: "follow",
    });

    if (!upstream.ok && upstream.status !== 206) {
      return new Response("Stream unavailable", { status: 502 });
    }

    const headers = new Headers();
    const contentType =
      upstream.headers.get("content-type") ||
      (channel.sourceUrl.includes(".m3u8")
        ? "application/vnd.apple.mpegurl"
        : "video/mp2t");
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    headers.set("Access-Control-Allow-Origin", "*");

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
      return new Response("Stream unavailable", { status: 502 });
    }
    return new Response("Stream unavailable", { status: 502 });
  }
}
