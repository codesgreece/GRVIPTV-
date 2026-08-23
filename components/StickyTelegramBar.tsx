"use client";

import { useEffect, useState } from "react";
import { Send, X } from "lucide-react";
import { contactConfig } from "@/lib/contact";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "grvip-telegram-bar-dismissed";

export function StickyTelegramBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem(STORAGE_KEY) === "1";
    setVisible(!dismissed);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("telegram-bar-visible", visible);
    return () => document.body.classList.remove("telegram-bar-visible");
  }, [visible]);

  const dismiss = () => {
    window.localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-sky-500/25",
        "bg-[#070707]/95 backdrop-blur-md",
        "shadow-[0_-12px_40px_rgba(0,0,0,0.45)]",
      )}
      role="region"
      aria-label="Telegram υποστήριξη"
    >
      <div className="container-premium flex items-center gap-3 py-3 sm:gap-4 sm:py-3.5">
        <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full border border-sky-400/30 bg-sky-500/10 text-sky-300 sm:inline-flex">
          <Send className="h-4 w-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white sm:text-[15px]">
            Απορία; Γράψε μας στο Telegram
          </p>
          <p className="hidden text-xs text-text-muted sm:block">
            Απάντηση σε λίγα λεπτά · {contactConfig.phone}
          </p>
        </div>

        <a
          href={contactConfig.telegram}
          target="_blank"
          rel="noreferrer"
          className="font-ui inline-flex shrink-0 items-center gap-2 rounded-md bg-gradient-to-r from-[#2AABEE] to-[#229ED9] px-4 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(42,171,238,0.28)] transition hover:brightness-105 sm:px-5"
        >
          <Send className="h-4 w-4" />
          <span className="hidden min-[420px]:inline">Telegram</span>
          <span className="min-[420px]:hidden">Γράψε μας</span>
        </a>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Κλείσιμο"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 text-text-dim transition hover:border-white/25 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
