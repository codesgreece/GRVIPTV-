"use client";

import { CinematicTV } from "@/components/hero/CinematicTV";
import { GoldenWave } from "@/components/hero/GoldenWave";
import { MiniScreenWall } from "@/components/hero/MiniScreenWall";

export function HeroVisual() {
  return (
    <div className="hero-visual-composition relative mx-auto w-full max-w-[820px] overflow-hidden lg:max-w-none">
      {/* Cinematic background depth */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(212,167,44,0.2),transparent_55%)]" />
        <div className="absolute top-[20%] right-0 h-[55%] w-[45%] bg-[radial-gradient(circle,rgba(30,95,168,0.12),transparent_68%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
        <div className="hero-visual-noise absolute inset-0 opacity-[0.04]" />
      </div>

      {/* Composition stage — widescreen canvas for TV + mini screens */}
      <div className="relative aspect-[16/10] w-full min-h-[200px] overflow-hidden sm:aspect-[16/11] sm:min-h-[340px] md:aspect-[16/10.5] md:min-h-[460px] lg:min-h-[520px] xl:min-h-[580px]">
        <div className="max-sm:hidden">
          <MiniScreenWall />
        </div>
        <CinematicTV />
        <GoldenWave />
      </div>
    </div>
  );
}
