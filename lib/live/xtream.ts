/**
 * When an M3U Plus get.php URL is blocked by the panel (common on datacenter IPs),
 * rebuild an equivalent M3U Plus playlist via Xtream Codes player_api — server-side only.
 */

type XtreamCredentials = {
  baseOrigin: string;
  username: string;
  password: string;
};

type XtreamCategory = {
  category_id: string;
  category_name: string;
};

type XtreamStream = {
  name?: string;
  stream_id?: number | string;
  stream_icon?: string;
  epg_channel_id?: string;
  category_id?: string | number;
  stream_type?: string;
};

export function parseXtreamFromM3uUrl(m3uUrl: string): XtreamCredentials | null {
  try {
    const url = new URL(m3uUrl);
    const username = url.searchParams.get("username")?.trim() || "";
    const password = url.searchParams.get("password")?.trim() || "";
    if (!username || !password) return null;
    if (!/get\.php$/i.test(url.pathname) && !url.pathname.includes("get.php")) {
      // Still allow if query looks like Xtream credentials on known hosts
      if (!url.searchParams.get("type")) return null;
    }
    return {
      baseOrigin: `${url.protocol}//${url.host}`,
      username,
      password,
    };
  } catch {
    return null;
  }
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, "'").replace(/\r?\n/g, " ").trim();
}

export async function buildM3uPlusFromXtreamApi(
  creds: XtreamCredentials,
): Promise<string> {
  const apiBase = `${creds.baseOrigin}/player_api.php?username=${encodeURIComponent(creds.username)}&password=${encodeURIComponent(creds.password)}`;

  const [catsRes, streamsRes] = await Promise.all([
    fetch(`${apiBase}&action=get_live_categories`, {
      cache: "no-store",
      headers: { "User-Agent": "GRVIP-OTT/1.0", Accept: "application/json" },
    }),
    fetch(`${apiBase}&action=get_live_streams`, {
      cache: "no-store",
      headers: { "User-Agent": "GRVIP-OTT/1.0", Accept: "application/json" },
    }),
  ]);

  if (!catsRes.ok || !streamsRes.ok) {
    throw new Error("Unable to load channels from provider API");
  }

  const categories = (await catsRes.json()) as XtreamCategory[];
  const streams = (await streamsRes.json()) as XtreamStream[];

  if (!Array.isArray(streams) || streams.length === 0) {
    throw new Error("Provider returned no live streams");
  }

  const catMap = new Map<string, string>();
  if (Array.isArray(categories)) {
    for (const cat of categories) {
      if (cat?.category_id != null) {
        catMap.set(String(cat.category_id), String(cat.category_name || "Other"));
      }
    }
  }

  const lines: string[] = ["#EXTM3U"];

  for (const stream of streams) {
    const id = stream.stream_id;
    const name = String(stream.name || "").trim();
    if (id == null || !name) continue;
    if (/^[-_=*]{3,}/.test(name.replace(/\s/g, ""))) continue;

    const category = catMap.get(String(stream.category_id ?? "")) || "Other";
    const logo = String(stream.stream_icon || "").trim();
    const tvgId = String(stream.epg_channel_id || "").trim();
    // Prefer HLS for browser playback through short-lived serverless proxies
    const streamUrl = `${creds.baseOrigin}/live/${creds.username}/${creds.password}/${id}.m3u8`;

    lines.push(
      `#EXTINF:-1 tvg-id="${escapeAttr(tvgId)}" tvg-name="${escapeAttr(name)}" tvg-logo="${escapeAttr(logo)}" group-title="${escapeAttr(category)}",${name}`,
    );
    lines.push(streamUrl);
  }

  if (lines.length < 3) {
    throw new Error("Provider returned no usable live streams");
  }

  return lines.join("\n");
}
