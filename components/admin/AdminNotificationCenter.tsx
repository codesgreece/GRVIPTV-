"use client";

import { Bell } from "lucide-react";
import type { AdminNotification } from "@/lib/customers/types";
import { cn } from "@/lib/cn";

type AdminNotificationCenterProps = {
  notifications: AdminNotification[];
  open: boolean;
  onToggle: () => void;
  onSelect: (notification: AdminNotification) => void;
};

export function AdminNotificationCenter({
  notifications,
  open,
  onToggle,
  onSelect,
}: AdminNotificationCenterProps) {
  const count = notifications.length;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-label="Ειδοποιήσεις"
        className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-[#0B0B0B] px-2.5 text-sm font-semibold text-white hover:border-gold/30"
      >
        <span className="relative">
          <Bell className="h-4 w-4 text-gold" />
          {count > 0 ? (
            <span className="absolute -top-2 -right-2 inline-flex min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
              {count > 99 ? "99+" : count}
            </span>
          ) : null}
        </span>
        <span className="hidden sm:inline">Ειδοποιήσεις</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-40 mt-2 w-[min(92vw,24rem)] overflow-hidden rounded-2xl border border-gold/25 bg-[#0B0B0B] shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
          <div className="border-b border-white/8 px-4 py-3">
            <p className="text-xs font-bold tracking-[0.14em] text-gold uppercase">Κέντρο Ειδοποιήσεων</p>
            <p className="mt-1 text-sm text-text-muted">{count} ενεργές ειδοποιήσεις</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {count === 0 ? (
              <p className="p-4 text-sm text-text-muted">Δεν υπάρχουν σημαντικές ειδοποιήσεις.</p>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item)}
                  className={cn(
                    "block w-full border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5",
                  )}
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-xs text-text-muted">{item.detail}</p>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
