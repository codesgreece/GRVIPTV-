/**
 * Normalize IPTV source URLs for reliable browser playback via our HTTPS proxy.
 * Prefer HLS (.m3u8) — short segment requests fit Vercel serverless limits.
 * MPEG-TS progressive URLs are kept as fallback.
 */

export function toHlsSourceUrl(sourceUrl: string): string {
  try {
    const url = new URL(sourceUrl);
    const parts = url.pathname.split("/").filter(Boolean);

    // http://host/live/user/pass/id.ts  →  .../id.m3u8
    if (parts.length >= 4 && parts[0] === "live") {
      const last = parts[parts.length - 1] ?? "";
      const id = last.replace(/\.(ts|m3u8|mp4)$/i, "");
      if (id) {
        url.pathname = `/live/${parts[1]}/${parts[2]}/${id}.m3u8`;
        url.search = "";
        url.hash = "";
        return url.toString();
      }
    }

    // http://host/user/pass/id[.ts]  →  http://host/live/user/pass/id.m3u8
    if (parts.length >= 3) {
      const last = parts[parts.length - 1] ?? "";
      const id = last.replace(/\.(ts|m3u8|mp4)$/i, "");
      if (id && parts[0] && parts[1]) {
        url.pathname = `/live/${parts[0]}/${parts[1]}/${id}.m3u8`;
        url.search = "";
        url.hash = "";
        return url.toString();
      }
    }
  } catch {
    // keep original
  }
  return sourceUrl;
}

export function toMpegTsSourceUrl(sourceUrl: string): string {
  try {
    const url = new URL(sourceUrl);
    const parts = url.pathname.split("/").filter(Boolean);

    if (parts.length >= 4 && parts[0] === "live") {
      const last = parts[parts.length - 1] ?? "";
      const id = last.replace(/\.(ts|m3u8|mp4)$/i, "");
      if (id) {
        // Progressive TS without /live often works more reliably on some panels
        url.pathname = `/${parts[1]}/${parts[2]}/${id}`;
        url.search = "";
        url.hash = "";
        return url.toString();
      }
    }

    if (parts.length >= 3) {
      const last = parts[parts.length - 1] ?? "";
      const id = last.replace(/\.(ts|m3u8|mp4)$/i, "");
      if (id) {
        url.pathname = `/${parts[0]}/${parts[1]}/${id}`;
        url.search = "";
        url.hash = "";
        return url.toString();
      }
    }
  } catch {
    // keep original
  }
  return sourceUrl;
}

export function isHlsUrl(url: string): boolean {
  return /\.m3u8($|\?)/i.test(url);
}

/**
 * Optional external relay for IPTV hosts that block Vercel/datacenter IPs.
 * STREAM_RELAY_URL=https://relay.example.com/relay
 * STREAM_RELAY_SECRET=optional-shared-secret
 * Relay should accept: GET {STREAM_RELAY_URL}?u=<urlencoded-source>&s=<secret>
 */
export function viaStreamRelay(sourceUrl: string): string {
  const relay = process.env.STREAM_RELAY_URL?.trim();
  if (!relay) return sourceUrl;
  const secret = process.env.STREAM_RELAY_SECRET?.trim() || "";
  const url = new URL(relay);
  url.searchParams.set("u", sourceUrl);
  if (secret) url.searchParams.set("s", secret);
  return url.toString();
}

export function rewriteHlsPlaylist(
  playlist: string,
  channelId: string,
  upstreamOrigin: string,
): string {
  return playlist
    .split(/\r?\n/)
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;

      let absolute: string;
      try {
        absolute = new URL(trimmed, upstreamOrigin).toString();
      } catch {
        return line;
      }

      return `/api/stream/${encodeURIComponent(channelId)}?seg=${encodeURIComponent(absolute)}`;
    })
    .join("\n");
}
