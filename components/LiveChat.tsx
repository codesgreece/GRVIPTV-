"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Headphones, MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { contactConfig } from "@/lib/contact";

export function LiveChat() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <div className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            className="mb-3 w-[min(100vw-2rem,340px)] overflow-hidden rounded-2xl border border-gold/25 bg-[#0B0B0B] shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#111] to-[#0B0B0B] px-4 py-3">
              <div className="flex items-center gap-2">
                <Headphones className="h-4 w-4 text-gold" />
                <span className="text-sm font-semibold">Live Support</span>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Κλείσιμο chat"
                className="text-text-dim hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3 p-4 text-sm text-text-muted">
              <p>Καλώς ήρθατε στο GRVIP OTT Support.</p>
              <p>
                Το live chat θα συνδεθεί σύντομα με πραγματικό provider. Προς το
                παρόν επικοινωνήστε μαζί μας:
              </p>
              <div className="space-y-2">
                <Button href="/epikoinonia" fullWidth className="text-sm">
                  Φόρμα Επικοινωνίας
                </Button>
                <a
                  href={contactConfig.telegram}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center rounded-md border border-white/15 px-4 py-2.5 text-xs text-white transition hover:border-gold/40"
                >
                  Telegram Support
                </a>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="font-ui animate-pulse-glow inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gradient-to-r from-[#D4A72C] to-[#F2C75C] px-4 py-3 text-base font-bold tracking-normal normal-case text-[#111] shadow-[0_10px_30px_rgba(212,167,44,0.35)] transition hover:brightness-105"
      >
        <MessageCircle className="h-4 w-4" />
        Live Chat
      </button>
    </div>
  );
}
