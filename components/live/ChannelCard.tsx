"use client";

import { Heart, Play } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import type { LiveChannel } from "@/lib/live/types";

type ChannelCardProps = {
  channel: LiveChannel;
  favorite: boolean;
  onToggleFavorite: (id: string) => void;
};

export function ChannelCard({
  channel,
  favorite,
  onToggleFavorite,
}: ChannelCardProps) {
  return (
    <article className="group relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite(channel.id);
        }}
        className={cn(
          "absolute top-3 right-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full border backdrop-blur-md transition",
          favorite
            ? "border-red-500/40 bg-red-500/20 text-red-400"
            : "border-white/10 bg-black/50 text-white/70 hover:border-white/25 hover:text-white",
        )}
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
      </button>

      <Link
        href={`/live/${channel.id}`}
        className="glass-card relative flex h-full flex-col overflow-hidden rounded-2xl transition duration-300 hover:-translate-y-1 hover:border-gold/35 hover:shadow-[0_16px_40px_rgba(0,0,0,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
      >
        <div className="relative flex aspect-[4/3] items-center justify-center bg-gradient-to-b from-white/[0.04] to-transparent p-5">
          {channel.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={channel.logo}
              alt=""
              loading="lazy"
              decoding="async"
              className="max-h-full max-w-full object-contain drop-shadow-lg transition duration-300 group-hover:scale-[1.03]"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fallback = e.currentTarget.nextElementSibling;
                if (fallback instanceof HTMLElement) fallback.hidden = false;
              }}
            />
          ) : null}
          <div
            hidden={Boolean(channel.logo)}
            className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg font-bold tracking-wide text-white/50"
            aria-hidden
          >
            {channel.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition duration-300 group-hover:bg-black/45 group-hover:opacity-100">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-900/40">
              <Play className="h-6 w-6 fill-current pl-0.5" />
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 border-t border-white/5 px-4 py-3.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-white">
              {channel.name}
            </h3>
            <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-red-600/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-red-400 uppercase">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
              LIVE
            </span>
          </div>
          <p className="truncate text-xs text-text-dim">{channel.category}</p>
        </div>
      </Link>
    </article>
  );
}
