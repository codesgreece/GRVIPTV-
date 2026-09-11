"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "grvip-live-favorites";

let memoryCache: string[] | null = null;
const listeners = new Set<() => void>();

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
}

function writeFavorites(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

function emit() {
  memoryCache = null;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) emit();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): string[] {
  if (memoryCache) return memoryCache;
  memoryCache = readFavorites();
  return memoryCache;
}

function getServerSnapshot(): string[] {
  return [];
}

export function useFavorites() {
  const favorites = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites],
  );

  const toggleFavorite = useCallback((id: string) => {
    const prev = getSnapshot();
    const next = prev.includes(id)
      ? prev.filter((item) => item !== id)
      : [...prev, id];
    writeFavorites(next);
    memoryCache = next;
    emit();
  }, []);

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    ready: typeof window !== "undefined",
  };
}
