#!/usr/bin/env node
/**
 * Minimal IPTV stream relay for VPS (Node 20+).
 *
 * Why: some IPTV panels block Vercel/datacenter IPs (HTTP 511) for /live streams,
 * while still allowing player_api. This relay runs on a normal VPS IP and proxies
 * upstream media to your Next.js /api/stream route.
 *
 * Protocol (matches STREAM_RELAY_URL in the app):
 *   GET /relay?u=<urlencoded-upstream-url>&s=<shared-secret>
 *
 * Env:
 *   PORT=8080
 *   RELAY_SECRET=long-random-string
 *   RELAY_ALLOW_HOSTS=api.example.com,cdn.example.com   (optional CSV allowlist)
 *
 * Run:
 *   RELAY_SECRET=... node server.mjs
 *
 * Behind HTTPS (Caddy example):
 *   relay.yourdomain.com {
 *     reverse_proxy 127.0.0.1:8080
 *   }
 *
 * Then on Vercel:
 *   STREAM_RELAY_URL=https://relay.yourdomain.com/relay
 *   STREAM_RELAY_SECRET=same-secret
 */

import http from "node:http";
import https from "node:https";
import { URL } from "node:url";

const PORT = Number(process.env.PORT || 8080);
const RELAY_SECRET = (process.env.RELAY_SECRET || "").trim();
const ALLOW_HOSTS = new Set(
  (process.env.RELAY_ALLOW_HOSTS || "")
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean),
);
const REQUEST_TIMEOUT_MS = Number(process.env.RELAY_TIMEOUT_MS || 20_000);
const USER_AGENT = process.env.RELAY_UA || "VLC/3.0.18 LibVLC/3.0.18";

if (!RELAY_SECRET) {
  console.error("RELAY_SECRET is required");
  process.exit(1);
}

function send(res, status, body, headers = {}) {
  const payload = typeof body === "string" ? body : String(body ?? "");
  res.writeHead(status, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
    ...headers,
  });
  res.end(payload);
}

function isAllowedTarget(target) {
  if (target.protocol !== "http:" && target.protocol !== "https:") return false;
  if (ALLOW_HOSTS.size === 0) return true;
  return ALLOW_HOSTS.has(target.hostname.toLowerCase());
}

function proxyRequest(req, res, targetUrl, redirectCount = 0) {
  let target;
  try {
    target = new URL(targetUrl);
  } catch {
    send(res, 400, "Invalid target");
    return;
  }

  if (!isAllowedTarget(target)) {
    send(res, 403, "Host not allowed");
    return;
  }

  const lib = target.protocol === "https:" ? https : http;

  const headers = {
    "User-Agent": USER_AGENT,
    Accept: req.headers.accept || "*/*",
    Connection: "keep-alive",
  };
  if (req.headers.range) headers.Range = req.headers.range;

  const upstream = lib.request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || (target.protocol === "https:" ? 443 : 80),
      path: `${target.pathname}${target.search}`,
      method: "GET",
      headers,
    },
    (upRes) => {
      const status = upRes.statusCode || 502;
      const location = upRes.headers.location;

      // Follow redirects (Xtream panels often 302 live URLs)
      if ([301, 302, 303, 307, 308].includes(status) && location && redirectCount < 5) {
        upRes.resume();
        let nextUrl;
        try {
          nextUrl = new URL(location, target).toString();
        } catch {
          send(res, 502, "Bad redirect");
          return;
        }
        proxyRequest(req, res, nextUrl, redirectCount + 1);
        return;
      }

      const outHeaders = {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
        "X-Final-Url": target.toString(),
      };
      const pass = [
        "content-type",
        "content-length",
        "content-range",
        "accept-ranges",
      ];
      for (const key of pass) {
        const value = upRes.headers[key];
        if (value) outHeaders[key] = value;
      }

      res.writeHead(status, outHeaders);
      upRes.pipe(res);
      upRes.on("error", () => {
        if (!res.headersSent) send(res, 502, "Upstream error");
        else res.destroy();
      });
    },
  );

  upstream.setTimeout(REQUEST_TIMEOUT_MS, () => {
    upstream.destroy(new Error("timeout"));
  });

  upstream.on("error", (err) => {
    if (!res.headersSent) {
      send(res, 502, err.message === "timeout" ? "Upstream timeout" : "Upstream error");
    } else {
      res.destroy();
    }
  });

  req.on("close", () => {
    upstream.destroy();
  });

  upstream.end();
}

const server = http.createServer((req, res) => {
  try {
    if (!req.url) {
      send(res, 400, "Bad request");
      return;
    }

    const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Range, Content-Type",
      });
      res.end();
      return;
    }

    if (req.method === "GET" && url.pathname === "/health") {
      send(res, 200, "ok");
      return;
    }

    if (req.method !== "GET" || url.pathname !== "/relay") {
      send(res, 404, "Not found");
      return;
    }

    const secret = url.searchParams.get("s") || "";
    if (secret !== RELAY_SECRET) {
      send(res, 401, "Unauthorized");
      return;
    }

    const targetRaw = url.searchParams.get("u") || "";
    let target;
    try {
      target = new URL(targetRaw);
    } catch {
      send(res, 400, "Invalid target");
      return;
    }

    proxyRequest(req, res, target.toString());
  } catch {
    send(res, 500, "Relay error");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`IPTV stream relay listening on :${PORT}`);
  console.log(`Health:  GET /health`);
  console.log(`Proxy:   GET /relay?u=<url>&s=<secret>`);
  if (ALLOW_HOSTS.size > 0) {
    console.log(`Allow:   ${[...ALLOW_HOSTS].join(", ")}`);
  }
});
