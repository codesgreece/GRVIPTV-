"use client";

import Link from "next/link";
import { ArrowLeft, Heart } from "lucide-react";
import dynamic from "next/dynamic";
import { ChannelCard } from "@/components/live/ChannelCard";
import { useFavorites } from "@/components/live/useFavorites";
import { cn } from "@/lib/cn";
import type { LiveChannel } from "@/lib/live/types";

const LivePlayer = dynamic(
  () => import("@/components/live/LivePlayer").then((m) => m.LivePlayer),
  {
    ssr: false,
    loading: () => (
      <div className="flex aspect-video items-center justify-center rounded-2xl border border-white/10 bg-black">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-red-500" />
      </div>
    ),
  },
);

type ChannelWatchClientProps = {
  channel: LiveChannel;
  related: LiveChannel[];
};

export function ChannelWatchClient({ channel, related }: ChannelWatchClientProps) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(channel.id);

  return (
    <div className="pb-20">
      <section className="container-premium pt-28 md:pt-32">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href="/live"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-text-muted transition hover:border-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Live TV
          </Link>
        </div>

        <div className="mx-auto max-w-5xl">
          <LivePlayer
            src={channel.streamUrl}
            title={channel.name}
            poster={channel.logo}
          />

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                {channel.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={channel.logo}
                    alt=""
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <span className="text-sm font-bold text-white/50">
                    {channel.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-600/15 px-2.5 py-1 text-[11px] font-bold tracking-wider text-red-400 uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                  LIVE
                </div>
                <h1 className="font-display text-2xl font-bold text-white md:text-3xl">
                  {channel.name}
                </h1>
                <p className="mt-1 text-sm text-text-dim">{channel.category}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => toggleFavorite(channel.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                favorite
                  ? "border-red-500/40 bg-red-500/15 text-red-400"
                  : "border-white/10 bg-white/[0.03] text-text-muted hover:text-white",
              )}
            >
              <Heart className={cn("h-4 w-4", favorite && "fill-current")} />
              {favorite ? "Favorited" : "Favorite"}
            </button>
          </div>
        </div>

        {related.length > 0 ? (
          <div className="mt-14">
            <h2 className="font-display text-2xl font-bold text-white">
              Related channels
            </h2>
            <p className="mt-2 text-sm text-text-muted">
              More from {channel.category}
            </p>
            <div className="mt-6 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {related.map((item) => (
                <ChannelCard
                  key={item.id}
                  channel={item}
                  favorite={isFavorite(item.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
