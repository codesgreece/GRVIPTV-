"use client";

import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

type ChannelSearchProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function ChannelSearch({ value, onChange, className }: ChannelSearchProps) {
  return (
    <label
      className={cn(
        "relative flex w-full items-center",
        className,
      )}
    >
      <span className="sr-only">Search channels</span>
      <Search className="pointer-events-none absolute left-4 h-5 w-5 text-text-dim" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search channels..."
        autoComplete="off"
        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pr-4 pl-12 text-base text-white outline-none transition placeholder:text-text-dim focus:border-gold/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-gold/20"
      />
    </label>
  );
}
