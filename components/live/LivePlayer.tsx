"use client";

import {
  Maximize,
  Pause,
  Play,
  RefreshCw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type LivePlayerProps = {
  src: string;
  title: string;
  poster?: string | null;
};

type PlayerStatus = "loading" | "playing" | "paused" | "error";

type Destroyable = { destroy: () => void };

export function LivePlayer({ src, title, poster }: LivePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Destroyable | null>(null);
  const [status, setStatus] = useState<PlayerStatus>("loading");
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [retryKey, setRetryKey] = useState(0);

  const destroyPlayer = useCallback(() => {
    if (playerRef.current) {
      try {
        playerRef.current.destroy();
      } catch {
        // ignore
      }
      playerRef.current = null;
    }
  }, []);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    let cancelled = false;
    setStatus("loading");

    async function startWithHls(video: HTMLVideoElement): Promise<boolean> {
      // Safari / iOS native HLS
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        try {
          await video.play();
          if (!cancelled) setStatus("playing");
        } catch {
          if (!cancelled) setStatus("paused");
        }
        return true;
      }

      const Hls = (await import("hls.js")).default;
      if (cancelled) return false;

      if (!Hls.isSupported()) return false;

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 30,
        maxBufferLength: 20,
        liveSyncDurationCount: 3,
        liveMaxLatencyDurationCount: 8,
      });

      playerRef.current = {
        destroy: () => {
          hls.destroy();
        },
      };

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        void video.play().then(
          () => {
            if (!cancelled) setStatus("playing");
          },
          () => {
            if (!cancelled) setStatus("paused");
          },
        );
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (cancelled) return;
        if (data.fatal) {
          if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          setStatus("error");
        }
      });

      return true;
    }

    async function startWithMpegTs(video: HTMLVideoElement): Promise<boolean> {
      const mpegts = (await import("mpegts.js")).default;
      if (cancelled) return false;

      if (!mpegts.getFeatureList().mseLivePlayback) return false;

      const player = mpegts.createPlayer(
        {
          type: "mpegts",
          isLive: true,
          url: src,
          cors: true,
          withCredentials: false,
        },
        {
          enableWorker: false,
          enableStashBuffer: false,
          stashInitialSize: 128,
          liveBufferLatencyChasing: true,
          liveBufferLatencyMaxLatency: 3,
          liveBufferLatencyMinRemain: 0.5,
          autoCleanupSourceBuffer: true,
        },
      );

      playerRef.current = {
        destroy: () => {
          try {
            player.pause();
            player.unload();
            player.detachMediaElement();
            player.destroy();
          } catch {
            // ignore
          }
        },
      };

      player.attachMediaElement(video);
      player.load();

      player.on(mpegts.Events.ERROR, () => {
        if (!cancelled) setStatus("error");
      });

      try {
        await video.play();
        if (!cancelled) setStatus("playing");
      } catch {
        if (!cancelled) setStatus("paused");
      }

      return true;
    }

    async function start(video: HTMLVideoElement) {
      destroyPlayer();
      video.removeAttribute("src");
      video.load();

      // Prefer HLS (playlist endpoint). Fall back to mpegts for TS.
      const preferHls = true;

      try {
        if (preferHls) {
          const ok = await startWithHls(video);
          if (ok || cancelled) return;
        }

        const okTs = await startWithMpegTs(video);
        if (okTs || cancelled) return;

        // Last resort: native element
        video.src = src;
        try {
          await video.play();
          if (!cancelled) setStatus("playing");
        } catch {
          if (!cancelled) setStatus("error");
        }
      } catch {
        if (!cancelled) setStatus("error");
      }
    }

    void start(videoEl);

    return () => {
      cancelled = true;
      destroyPlayer();
      videoEl.removeAttribute("src");
      videoEl.load();
    };
  }, [src, retryKey, destroyPlayer]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      try {
        await video.play();
        setStatus("playing");
      } catch {
        setStatus("error");
      }
    } else {
      video.pause();
      setStatus("paused");
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const onVolume = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = value;
    video.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
  };

  const goFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (video.requestFullscreen) {
        await video.requestFullscreen();
      } else {
        const anyVideo = video as HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
        };
        anyVideo.webkitEnterFullscreen?.();
      }
    } catch {
      // ignore
    }
  };

  const retry = () => {
    destroyPlayer();
    setRetryKey((k) => k + 1);
    setStatus("loading");
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
      <div className="relative aspect-video w-full bg-black">
        <video
          ref={videoRef}
          className="h-full w-full bg-black object-contain"
          playsInline
          poster={poster || undefined}
          aria-label={title}
          onPlaying={() => setStatus("playing")}
          onPause={() => setStatus((s) => (s === "error" ? s : "paused"))}
          onWaiting={() => setStatus((s) => (s === "error" ? s : "loading"))}
        />

        {status === "loading" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-red-500" />
            <p className="text-sm text-white/80">Connecting to live stream...</p>
          </div>
        ) : null}

        {status === "error" ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/75 px-6 text-center">
            <p className="font-display text-xl text-white">Unable to play stream</p>
            <p className="max-w-md text-sm text-text-muted">
              The stream server refused the connection from the hosting network.
              Try Reconnect, or contact support if this keeps happening.
            </p>
            <button
              type="button"
              onClick={retry}
              className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
            >
              <RefreshCw className="h-4 w-4" />
              Reconnect
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-white/8 bg-[#0a0a0a] px-3 py-3 sm:px-4">
        <button
          type="button"
          onClick={() => void togglePlay()}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-white/25"
          aria-label={status === "playing" ? "Pause" : "Play"}
        >
          {status === "playing" ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="h-5 w-5 fill-current pl-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={toggleMute}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-white/25"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted || volume === 0 ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </button>

        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          onChange={(e) => onVolume(Number(e.target.value))}
          className="h-1.5 w-24 accent-red-500 sm:w-32"
          aria-label="Volume"
        />

        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            onClick={retry}
            className={cn(
              "inline-flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 text-sm text-white/80 transition hover:border-white/25 hover:text-white",
            )}
            aria-label="Reconnect"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Retry</span>
          </button>
          <button
            type="button"
            onClick={() => void goFullscreen()}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:border-white/25"
            aria-label="Fullscreen"
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
