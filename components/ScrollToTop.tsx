"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="Επιστροφή στην κορυφή"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="scroll-to-top fixed bottom-24 left-4 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/30 bg-[#111]/90 text-gold backdrop-blur transition hover:bg-gold hover:text-black sm:left-6"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
