import type { RawM3uChannel } from "@/lib/live/types";

const ATTR_RE = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s,"]*))/g;

function decodeAttr(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function parseExtinfAttributes(attrChunk: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  ATTR_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ATTR_RE.exec(attrChunk)) !== null) {
    const key = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? "";
    attrs[key] = decodeAttr(value);
  }
  return attrs;
}

/**
 * Parse M3U / M3U Plus playlists.
 * Supports `#EXTINF:-1 tvg-id="..." ...,Channel Name` followed by a URL line.
 */
export function parseM3uPlaylist(content: string): RawM3uChannel[] {
  if (!content || typeof content !== "string") return [];

  const normalized = content.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalized.split("\n");
  const channels: RawM3uChannel[] = [];
  const seenUrls = new Set<string>();

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]?.trim();
    if (!line || !line.startsWith("#EXTINF:")) continue;

    const commaIdx = line.indexOf(",");
    if (commaIdx === -1) continue;

    const metaPart = line.slice("#EXTINF:".length, commaIdx);
    const displayName = decodeAttr(line.slice(commaIdx + 1));

    // Skip duration token (e.g. -1) then parse attributes
    const firstSpace = metaPart.search(/\s/);
    const attrChunk = firstSpace === -1 ? "" : metaPart.slice(firstSpace + 1);
    const attrs = parseExtinfAttributes(attrChunk);

    let streamUrl = "";
    for (let j = i + 1; j < lines.length; j += 1) {
      const next = lines[j]?.trim();
      if (!next) continue;
      if (next.startsWith("#")) {
        // Allow EXTVLCOPT / EXTG RP etc. between EXTINF and URL
        if (next.startsWith("#EXTINF:")) break;
        continue;
      }
      streamUrl = next;
      i = j;
      break;
    }

    if (!streamUrl || !/^https?:\/\//i.test(streamUrl)) continue;
    if (seenUrls.has(streamUrl)) continue;
    seenUrls.add(streamUrl);

    const name = displayName || attrs["tvg-name"] || "Unknown Channel";
    // Skip decorative separator entries that are not real channels
    if (/^[-_=*]{3,}/.test(name.replace(/\s/g, ""))) continue;

    channels.push({
      name,
      streamUrl,
      tvgId: attrs["tvg-id"] || "",
      tvgName: attrs["tvg-name"] || "",
      tvgLogo: attrs["tvg-logo"] || "",
      groupTitle: attrs["group-title"] || "",
    });
  }

  return channels;
}
