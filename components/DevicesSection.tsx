"use client";

import Link from "next/link";
import {
  Monitor,
  Smartphone,
  Tablet,
  Tv,
  Cast,
  Box,
  Laptop,
} from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { devices } from "@/data/content";

const icons = {
  "smart-tv": Tv,
  "android-tv": Monitor,
  firestick: Cast,
  smartphone: Smartphone,
  tablet: Tablet,
  mag: Box,
  desktop: Laptop,
} as const;

const deviceGuideMap: Record<string, string> = {
  "smart-tv": "wizard",
  "android-tv": "wizard",
  firestick: "wizard",
  smartphone: "wizard",
  tablet: "wizard",
  mag: "wizard",
  desktop: "wizard",
};

export function DevicesSection() {
  return (
    <section className="section-noise relative py-12 md:py-24">
      <div className="container-premium relative z-10">
        <SectionHeading
          eyebrow="Λειτουργεί σε όλες τις συσκευές σας"
          title="Παρακολουθήστε Παντού, Όποτε Θέλετε"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {devices.map((device, i) => {
            const Icon = icons[device.id as keyof typeof icons] ?? Monitor;
            const guideId = deviceGuideMap[device.id] ?? "smart-tv";
            return (
              <Reveal key={device.id} delay={i * 0.04}>
                <Link
                  href={`/odigos-egkatastasis#${guideId}`}
                  className="group glass-card flex h-full flex-col items-start rounded-2xl p-6 transition duration-300 hover:-translate-y-1 hover:border-gold/45 hover:shadow-[0_12px_36px_rgba(212,167,44,0.12)]"
                >
                  <Icon className="mb-4 h-10 w-10 text-text-muted transition group-hover:text-gold" strokeWidth={1.4} />
                  <h3 className="font-display text-lg font-semibold text-white">
                    {device.name}
                  </h3>
                  <p className="mt-2 text-sm text-text-muted">
                    {device.description}
                  </p>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
