"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { MobileMenu } from "@/components/MobileMenu";
import { Button } from "@/components/ui/Button";
import { mainNav } from "@/lib/navigation";
import { cn } from "@/lib/cn";

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled
            ? "border-b border-gold/15 bg-[#050505]/92 shadow-[0_10px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            : "border-b border-white/5 bg-[#050505]/45 backdrop-blur-md",
        )}
      >
        <div className="container-premium flex h-[72px] items-center justify-between gap-4 lg:h-20">
          <Link href="/" className="relative z-10 shrink-0" aria-label="GRVIP OTT Αρχική">
            <Image
              src="/images/logo.png"
              alt="GRVIP OTT"
              width={180}
              height={56}
              priority
              className="h-10 w-auto object-contain md:h-12"
            />
          </Link>

          <nav className="hidden items-center gap-1 xl:flex" aria-label="Κύρια πλοήγηση">
            {mainNav.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3 py-2 font-sans text-[15px] font-semibold transition-colors",
                    active ? "text-gold" : "text-text-muted hover:text-white",
                  )}
                >
                  {item.label}
                  <span
                    className={cn(
                      "absolute inset-x-3 -bottom-0.5 h-px origin-left bg-gradient-to-r from-gold to-gold-light transition-transform duration-300",
                      active ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              href="/paketa"
              className="hidden px-5 py-2.5 text-xs tracking-[0.12em] uppercase sm:inline-flex"
            >
              Ξεκινήστε Τώρα
            </Button>
            <button
              type="button"
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-white/5 text-white transition hover:border-gold/40 xl:hidden"
              aria-label="Άνοιγμα μενού"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  );
}
