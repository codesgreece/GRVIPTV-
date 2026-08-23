"use client";

import Image from "next/image";

type MiniTVProps = {
  image: string;
  alt: string;
  width: number;
};

export function MiniTV({ image, alt, width }: MiniTVProps) {
  return (
    <div className="relative" style={{ width }}>
      <div
        className="rounded-[6px] p-[3px] shadow-[0_10px_28px_rgba(0,0,0,0.65),0_0_18px_rgba(212,167,44,0.06)] sm:rounded-[7px] sm:p-1"
        style={{
          background:
            "linear-gradient(155deg, #3a3a3a 0%, #181818 45%, #060606 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-x-2 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="relative aspect-video overflow-hidden rounded-[3px] border border-black/80 bg-black sm:rounded-[4px]">
          <Image
            src={image}
            alt={alt}
            width={320}
            height={180}
            className="h-full w-full object-cover"
            sizes="(max-width: 768px) 100px, 140px"
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_0%,transparent_35%,transparent_70%,rgba(0,0,0,0.25)_100%)]" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/[0.06] to-transparent" />
        </div>
      </div>
      <div className="mx-auto mt-0.5 h-1 w-[28%] rounded-b-sm bg-gradient-to-b from-[#333] to-[#111]" />
    </div>
  );
}
