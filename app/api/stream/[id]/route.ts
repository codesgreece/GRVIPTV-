import http from "node:http";
import https from "node:https";
import { Readable } from "node:stream";
import { getChannelById, LiveChannelsError } from "@/lib/live/channels";
import {
  isHlsUrl,
  rewriteHlsPlaylist,
  toMpegTsSourceUrl,
  viaStreamRelay,
} from "@/lib/live/stream-url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type RouteContext = {
  params: Promise<{ id: string }>;
};

const UA = "VLC/3.0.18 LibVLC/3.0.18";

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
    return seg.hostname === source.hostname;
  } catch {
    return false;
  }
}

type NodeResult = {
  status: number;
  headers: http.IncomingHttpHeaders;
  body: Buffer;
};

/** Low-level HTTP(S) GET — some IPTV panels fingerprint undici/fetch and return 511. */
function nodeRequest(
  targetUrl: string,
  init?: { range?: string | null; timeoutMs?: number; maxBytes?: number },
): Promise<NodeResult> {
  return new Promise((resolve, reject) => {
    const url = new URL(targetUrl);
    const lib = url.protocol === "https:" ? https : http;
    const maxBytes = init?.maxBytes ?? 2_000_000;
    const req = lib.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: "GET",
        headers: {
          "User-Agent": UA,
          Accept: "*/*",
          Connection: "close",
          ...(init?.range ? { Range: init.range } : {}),
        },
      },
      (res) => {
        const chunks: Buffer[] = [];
        let total = 0;
        res.on("data", (chunk: Buffer) => {
          total += chunk.length;
          if (total <= maxBytes) chunks.push(chunk);
          if (total > maxBytes) res.destroy();
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: Buffer.concat(chunks),
          });
        });
        res.on("error", reject);
      },
    );
    req.setTimeout(init?.timeoutMs ?? 12_000, () => {
      req.destroy(new Error("timeout"));
    });
    req.on("error", reject);
    req.end();
  });
}

async function warmXtreamSession(sourceUrl: string) {
  try {
    const url = new URL(sourceUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    let user = "";
    let pass = "";
    if (parts[0] === "live" && parts.length >= 4) {
      user = parts[1] ?? "";
      pass = parts[2] ?? "";
    } else if (parts.length >= 3) {
      user = parts[0] ?? "";
      pass = parts[1] ?? "";
    }
    if (!user || !pass) return;
    await nodeRequest(
      `${url.protocol}//${url.host}/player_api.php?username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`,
      { timeoutMs: 8000, maxBytes: 64_000 },
    );
  } catch {
    // best-effort
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

      const upstream = await nodeRequest(viaStreamRelay(segmentUrl), {
        range: request.headers.get("range"),
        timeoutMs: 15_000,
        maxBytes: 4_000_000,
      });

      if (upstream.status !== 200 && upstream.status !== 206) {
        return new Response("Segment unavailable", {
          status: 502,
          headers: corsHeaders({
            "X-Upstream-Status": String(upstream.status),
          }),
        });
      }

      const headers = corsHeaders({
        "Content-Type": String(upstream.headers["content-type"] || "video/MP2T"),
      });
      if (upstream.headers["content-length"]) {
        headers.set("Content-Length", String(upstream.headers["content-length"]));
      }
      if (upstream.headers["content-range"]) {
        headers.set("Content-Range", String(upstream.headers["content-range"]));
      }

      return new Response(new Uint8Array(upstream.body), {
        status: upstream.status,
        headers,
      });
    }

    await warmXtreamSession(channel.sourceUrl);

    const candidates = [viaStreamRelay(channel.sourceUrl)];
    if (isHlsUrl(channel.sourceUrl)) {
      candidates.push(viaStreamRelay(toMpegTsSourceUrl(channel.sourceUrl)));
    }

    let lastStatus = 0;
    let lastError = "";
    let chosen: (NodeResult & { url: string }) | null = null;

    for (const candidate of candidates) {
      try {
        const upstream = await nodeRequest(candidate, {
          range: request.headers.get("range"),
          timeoutMs: 12_000,
          maxBytes: isHlsUrl(candidate) ? 200_000 : 64_000,
        });
        lastStatus = upstream.status;
        if (upstream.status === 200 || upstream.status === 206) {
          chosen = { ...upstream, url: candidate };
          break;
        }
        lastError = upstream.body
          .toString("utf8")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 80)
          .replace(/https?:\/\/[^\s]+/gi, "[url]");
      } catch (err) {
        lastStatus = 504;
        lastError =
          err instanceof Error
            ? err.message.slice(0, 80).replace(/https?:\/\/[^\s]+/gi, "[url]")
            : "fetch_failed";
      }
    }

    if (!chosen) {
      return new Response("Stream unavailable", {
        status: 502,
        headers: corsHeaders({
          "X-Upstream-Status": String(lastStatus),
          ...(lastError ? { "X-Upstream-Error": lastError } : {}),
        }),
      });
    }

    const contentType = String(chosen.headers["content-type"] || "");
    if (isHlsUrl(chosen.url) || contentType.includes("mpegurl")) {
      const text = chosen.body.toString("utf8");
      if (!text.includes("#EXT")) {
        return new Response("Stream unavailable", {
          status: 502,
          headers: corsHeaders({ "X-Upstream-Status": "bad_playlist" }),
        });
      }

      const origin = new URL(chosen.url).origin;
      const rewritten = rewriteHlsPlaylist(text, channelId, origin);

      return new Response(rewritten, {
        status: 200,
        headers: corsHeaders({
          "Content-Type": "application/vnd.apple.mpegurl",
        }),
      });
    }

    // Progressive MPEG-TS: open a fresh streamed connection for the player
    return await new Promise<Response>((resolve) => {
      const url = new URL(chosen!.url);
      const lib = url.protocol === "https:" ? https : http;
      const req = lib.request(
        {
          protocol: url.protocol,
          hostname: url.hostname,
          port: url.port || (url.protocol === "https:" ? 443 : 80),
          path: `${url.pathname}${url.search}`,
          method: "GET",
          headers: {
            "User-Agent": UA,
            Accept: "*/*",
            Connection: "keep-alive",
          },
        },
        (res) => {
          if ((res.statusCode || 0) >= 400) {
            resolve(
              new Response("Stream unavailable", {
                status: 502,
                headers: corsHeaders({
                  "X-Upstream-Status": String(res.statusCode || 0),
                }),
              }),
            );
            res.resume();
            return;
          }

          const headers = corsHeaders({
            "Content-Type": res.headers["content-type"] || "video/mp2t",
          });
          resolve(
            new Response(Readable.toWeb(res) as unknown as ReadableStream, {
              status: res.statusCode || 200,
              headers,
            }),
          );
        },
      );
      req.setTimeout(15_000, () => {
        req.destroy();
        resolve(
          new Response("Stream unavailable", {
            status: 502,
            headers: corsHeaders({ "X-Upstream-Status": "504" }),
          }),
        );
      });
      req.on("error", () => {
        resolve(
          new Response("Stream unavailable", {
            status: 502,
            headers: corsHeaders({ "X-Upstream-Status": "504" }),
          }),
        );
      });
      req.end();
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
