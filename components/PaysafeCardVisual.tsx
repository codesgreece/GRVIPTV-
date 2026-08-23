"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

type PaysafeCardVisualProps = {
  amount: 5 | 10 | 25 | 50 | 100;
  className?: string;
};

export function PaysafeCardVisual({ amount, className }: PaysafeCardVisualProps) {
  const uid = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 100 136"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`PaysafeCard ${amount} EUR`}
      className={cn(
        "aspect-[100/136] h-auto w-full overflow-visible drop-shadow-[0_8px_18px_rgba(0,120,200,0.32)]",
        className,
      )}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`${uid}-blue`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00A3E8" />
          <stop offset="55%" stopColor="#0082C9" />
          <stop offset="100%" stopColor="#006AA8" />
        </linearGradient>
        <linearGradient id={`${uid}-shine`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="100" height="136" rx="10" fill={`url(#${uid}-blue)`} />
      <rect x="0" y="0" width="100" height="136" rx="10" fill={`url(#${uid}-shine)`} />

      <rect x="34" y="0" width="32" height="18" rx="5" fill="#ffffff" />
      <rect x="41" y="3" width="18" height="8" rx="4" fill={`url(#${uid}-blue)`} />

      <text
        x="92"
        y="34"
        textAnchor="end"
        fill="#ffffff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize={amount === 100 ? "13" : "15"}
        fontWeight="700"
      >
        €{amount}
      </text>

      <g transform="translate(50 68)">
        <polygon points="-14,-8 -8,-2 -14,4 -20,-2" fill="#ffffff" />
        <polygon points="-2,-8 4,-2 -2,4 -8,-2" fill="#ffffff" />
        <text
          y="-2"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="9.5"
          fontWeight="700"
        >
          Paysafe
        </text>
        <text
          y="11"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="9.5"
          fontWeight="700"
        >
          Card
        </text>
      </g>

      <rect
        x="8"
        y="88"
        width="84"
        height="40"
        rx="6"
        fill="#ffffff"
        fillOpacity="0.08"
      />
    </svg>
  );
}
