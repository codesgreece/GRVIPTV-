"use client";

import Image from "next/image";
import { brandLogos } from "@/data/brands";

export function LogosCarousel() {
  const items = [...brandLogos, ...brandLogos];

  return (
    <section
      className="relative overflow-hidden pb-12 md:pb-16"
      aria-label="Διαθέσιμα brands"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#050505] to-transparent md:w-28" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#050505] to-transparent md:w-28" />

      <div className="container-premium mb-5">
        <p className="text-center text-xs font-semibold tracking-[0.22em] text-text-dim uppercase">
          Περιεχόμενο & πλατφόρμες
        </p>
      </div>

      <div className="relative">
        <div className="logos-marquee flex w-max items-center gap-4 md:gap-5">
          {items.map((brand, index) => (
            <div
              key={`${brand.id}-${index}`}
              className="flex h-[60px] w-[140px] shrink-0 items-center justify-center rounded-xl border border-white/10 bg-[#0B0B0B]/80 px-3 sm:h-[72px] sm:w-[168px] md:h-[80px] md:w-[190px]"
            >
              <Image
                src={brand.src}
                alt={brand.name}
                width={480}
                height={180}
                className="h-full w-full object-contain"
                sizes="190px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
