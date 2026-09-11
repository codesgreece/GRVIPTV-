import { getCached, setCache, clearCache } from "@/lib/live/cache";
import { parseM3uPlaylist } from "@/lib/live/parse-m3u";
import { buildUniqueChannelId } from "@/lib/live/slug";
import { toHlsSourceUrl } from "@/lib/live/stream-url";
import type { ChannelsPayload, LiveChannel, LiveChannelInternal } from "@/lib/live/types";
import { buildM3uPlusFromXtreamApi, parseXtreamFromM3uUrl } from "@/lib/live/xtream";

const CACHE_KEY = "live-channels-v2-hls";
const CACHE_TTL_MS = 5 * 60 * 1000;
const FETCH_TIMEOUT_MS = 45_000;

export class LiveChannelsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LiveChannelsError";
  }
}

function getM3uUrl(): string {
  const url = process.env.M3U_URL?.trim();
  if (!url) {
    throw new LiveChannelsError("Live TV is not configured");
  }
  return url;
}

function toPublic(channel: LiveChannelInternal): LiveChannel {
  return {
    id: channel.id,
    name: channel.name,
    logo: channel.logo,
    category: channel.category,
    tvgId: channel.tvgId,
    tvgName: channel.tvgName,
    streamUrl: channel.streamUrl,
  };
}

function normalizeCategory(groupTitle: string): string {
  const trimmed = groupTitle.trim();
  return trimmed || "Other";
}

function buildInternalChannels(rawText: string): LiveChannelInternal[] {
  const parsed = parseM3uPlaylist(rawText);
  const used = new Set<string>();
  const channels: LiveChannelInternal[] = [];

  for (const item of parsed) {
    const id = buildUniqueChannelId(item.name, item.tvgId, item.streamUrl, used);
    const logo = item.tvgLogo.trim() || null;
    channels.push({
      id,
      name: item.name.trim(),
      logo,
      category: normalizeCategory(item.groupTitle),
      tvgId: item.tvgId.trim(),
      tvgName: item.tvgName.trim() || item.name.trim(),
      streamUrl: `/api/stream/${encodeURIComponent(id)}`,
      sourceUrl: toHlsSourceUrl(item.streamUrl),
    });
  }

  return channels;
}

function buildPayload(channels: LiveChannelInternal[]): {
  internal: LiveChannelInternal[];
  payload: ChannelsPayload;
} {
  const categories = Array.from(
    new Set(channels.map((c) => c.category).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "el", { sensitivity: "base" }));

  const payload: ChannelsPayload = {
    channels: channels.map(toPublic),
    categories,
    updatedAt: new Date().toISOString(),
    count: channels.length,
  };

  return { internal: channels, payload };
}

async function fetchM3uText(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "User-Agent": "GRVIP-OTT/1.0",
        Accept: "audio/x-mpegurl, application/vnd.apple.mpegurl, text/plain, */*",
      },
    });

    if (!response.ok) {
      throw new LiveChannelsError("Unable to load channels");
    }

    const text = await response.text();
    if (!text || !text.includes("#EXT")) {
      throw new LiveChannelsError("Unable to load channels");
    }
    return text;
  } catch (error) {
    if (error instanceof LiveChannelsError) throw error;
    throw new LiveChannelsError("Unable to load channels");
  } finally {
    clearTimeout(timer);
  }
}

async function loadPlaylistText(): Promise<string> {
  const m3uUrl = getM3uUrl();

  try {
    return await fetchM3uText(m3uUrl);
  } catch (primaryError) {
    const xtream = parseXtreamFromM3uUrl(m3uUrl);
    if (!xtream) throw primaryError;

    try {
      return await buildM3uPlusFromXtreamApi(xtream);
    } catch {
      throw primaryError;
    }
  }
}

type CachedBundle = {
  internal: LiveChannelInternal[];
  payload: ChannelsPayload;
};

async function loadBundle(force = false): Promise<CachedBundle> {
  if (!force) {
    const cached = getCached<CachedBundle>(CACHE_KEY);
    if (cached) return cached;
  }

  const text = await loadPlaylistText();
  const internal = buildInternalChannels(text);
  if (internal.length === 0) {
    throw new LiveChannelsError("Unable to load channels");
  }

  const bundle = buildPayload(internal);
  setCache(CACHE_KEY, bundle, CACHE_TTL_MS);
  return bundle;
}

export async function getChannelsPayload(options?: {
  force?: boolean;
}): Promise<ChannelsPayload> {
  const bundle = await loadBundle(options?.force);
  return bundle.payload;
}

export async function getChannelById(
  id: string,
): Promise<LiveChannelInternal | null> {
  const decoded = decodeURIComponent(id);
  const bundle = await loadBundle();
  return bundle.internal.find((c) => c.id === decoded) ?? null;
}

export async function getRelatedChannels(
  channel: LiveChannel,
  limit = 12,
): Promise<LiveChannel[]> {
  const bundle = await loadBundle();
  return bundle.payload.channels
    .filter((c) => c.category === channel.category && c.id !== channel.id)
    .slice(0, limit);
}

export function invalidateChannelsCache() {
  clearCache(CACHE_KEY);
}

/** Strip credential-looking query/path fragments from any accidental leak checks */
export function assertNoCredentialsInPayload(payload: ChannelsPayload, m3uUrl?: string) {
  const serialized = JSON.stringify(payload);
  if (m3uUrl) {
    try {
      const url = new URL(m3uUrl);
      const user = url.searchParams.get("username");
      const pass = url.searchParams.get("password");
      if (user && serialized.includes(user)) {
        throw new Error("Credential leak detected in channels payload");
      }
      if (pass && serialized.includes(pass)) {
        throw new Error("Credential leak detected in channels payload");
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes("Credential leak")) throw e;
    }
  }
  if (/password=/i.test(serialized) || /username=/i.test(serialized)) {
    throw new Error("Credential leak detected in channels payload");
  }
}
