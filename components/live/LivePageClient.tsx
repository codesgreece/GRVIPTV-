"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CategoryNav } from "@/components/live/CategoryNav";
import { ChannelCard } from "@/components/live/ChannelCard";
import { ChannelSearch } from "@/components/live/ChannelSearch";
import { ChannelSkeletonGrid } from "@/components/live/ChannelSkeleton";
import { filterChannels, useChannels } from "@/components/live/useChannels";
import { useFavorites } from "@/components/live/useFavorites";

const PAGE_SIZE = 48;

export function LivePageClient() {
  const { state, reload } = useChannels();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("ALL");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (state.status !== "ready") return [];
    return filterChannels(state.data.channels, query, category, favorites);
  }, [state, query, category, favorites]);

  const visibleChannels = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <div className="pb-20">
      <section className="section-noise relative overflow-hidden pt-28 pb-8 md:pt-32 md:pb-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 h-72 w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(220,38,38,0.12),transparent_70%)]" />
          <div className="absolute right-0 bottom-0 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(212,167,44,0.08),transparent_70%)]" />
        </div>

        <div className="container-premium relative z-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-600/10 px-3 py-1 text-xs font-bold tracking-[0.14em] text-red-400 uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
                </span>
                LIVE
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
                Live TV
              </h1>
              <p className="mt-3 max-w-xl text-base text-text-muted md:text-lg">
                Watch live channels
              </p>
            </div>

            {state.status === "ready" ? (
              <p className="text-sm text-text-dim">
                {state.data.count.toLocaleString("el-GR")} channels
              </p>
            ) : null}
          </div>

          <div className="mt-8">
            <ChannelSearch value={query} onChange={(v) => {
              setQuery(v);
              setVisible(PAGE_SIZE);
            }} />
          </div>
        </div>
      </section>

      <section className="container-premium">
        {state.status === "loading" ? (
          <div className="space-y-6">
            <p className="text-sm text-text-muted">Loading channels...</p>
            <ChannelSkeletonGrid />
          </div>
        ) : null}

        {state.status === "error" ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
            <p className="font-display text-2xl text-white">Unable to load channels</p>
            <p className="mt-3 text-sm text-text-muted">
              Please try again in a moment.
            </p>
            <div className="mt-6 flex justify-center">
              <Button type="button" onClick={() => reload()}>
                Retry
              </Button>
            </div>
          </div>
        ) : null}

        {state.status === "ready" ? (
          <>
            <CategoryNav
              categories={state.data.categories}
              active={category}
              showFavorites={favorites.length > 0}
              onChange={(next) => {
                setCategory(next);
                setVisible(PAGE_SIZE);
              }}
            />

            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <p className="font-display text-2xl text-white">No channels found</p>
                <p className="mt-2 text-sm text-text-muted">
                  {query
                    ? "Try a different search term or category."
                    : category === "FAVORITES"
                      ? "You have no favorite channels yet."
                      : "No channels are available in this category."}
                </p>
              </div>
            ) : (
              <>
                <div className="mt-6 grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {visibleChannels.map((channel) => (
                    <ChannelCard
                      key={channel.id}
                      channel={channel}
                      favorite={isFavorite(channel.id)}
                      onToggleFavorite={toggleFavorite}
                    />
                  ))}
                </div>

                {hasMore ? (
                  <div className="mt-10 flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setVisible((v) => v + PAGE_SIZE)}
                    >
                      Load more
                    </Button>
                  </div>
                ) : null}
              </>
            )}
          </>
        ) : null}
      </section>
    </div>
  );
}
