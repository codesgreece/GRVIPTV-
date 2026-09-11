"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChannelsPayload, LiveChannel } from "@/lib/live/types";

type State =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ChannelsPayload };

export function useChannels() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [requestId, setRequestId] = useState(0);
  const [forceRefresh, setForceRefresh] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchChannels() {
      try {
        const url = forceRefresh ? "/api/channels?refresh=1" : "/api/channels";
        const res = await fetch(url, { cache: "no-store" });
        const json = (await res.json()) as
          | ChannelsPayload
          | { error: true; message?: string };

        if (cancelled) return;

        if (!res.ok || "error" in json) {
          setState({
            status: "error",
            message: "Unable to load channels",
          });
          return;
        }

        setState({ status: "ready", data: json });
      } catch {
        if (!cancelled) {
          setState({ status: "error", message: "Unable to load channels" });
        }
      }
    }

    void fetchChannels();
    return () => {
      cancelled = true;
    };
  }, [requestId, forceRefresh]);

  const reload = useCallback(() => {
    setState({ status: "loading" });
    setForceRefresh(true);
    setRequestId((id) => id + 1);
  }, []);

  return { state, reload };
}

export function filterChannels(
  channels: LiveChannel[],
  query: string,
  category: string | "ALL" | "FAVORITES",
  favoriteIds: string[],
): LiveChannel[] {
  const q = query.trim().toLowerCase();

  return channels.filter((channel) => {
    if (category === "FAVORITES" && !favoriteIds.includes(channel.id)) {
      return false;
    }
    if (category !== "ALL" && category !== "FAVORITES" && channel.category !== category) {
      return false;
    }
    if (!q) return true;

    const haystack = [
      channel.name,
      channel.category,
      channel.tvgName,
      channel.tvgId,
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(q);
  });
}
