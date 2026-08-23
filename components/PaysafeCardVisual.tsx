import { cn } from "@/lib/cn";

type PaysafeCardVisualProps = {
  amount: 5 | 10 | 25 | 50 | 100;
  className?: string;
};

export function PaysafeCardVisual({ amount, className }: PaysafeCardVisualProps) {
  return (
    <svg
      viewBox="0 0 140 188"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={`PaysafeCard ${amount} EUR`}
      className={cn("h-auto w-full drop-shadow-[0_12px_24px_rgba(0,120,200,0.35)]", className)}
    >
      <defs>
        <linearGradient id="paysafe-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00A3E8" />
          <stop offset="55%" stopColor="#0082C9" />
          <stop offset="100%" stopColor="#006AA8" />
        </linearGradient>
        <linearGradient id="paysafe-shine" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.22" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="140" height="188" rx="12" fill="url(#paysafe-blue)" />
      <rect x="0" y="0" width="140" height="188" rx="12" fill="url(#paysafe-shine)" />

      <rect x="50" y="0" width="40" height="24" rx="6" fill="#ffffff" />
      <rect x="58" y="4" width="24" height="10" rx="5" fill="url(#paysafe-blue)" />

      <text
        x="126"
        y="42"
        textAnchor="end"
        fill="#ffffff"
        fontFamily="Arial, Helvetica, sans-serif"
        fontSize="20"
        fontWeight="700"
      >
        €{amount}
      </text>

      <g transform="translate(22 78)">
        <polygon points="12,10 18,16 12,22 6,16" fill="#ffffff" />
        <polygon points="24,10 30,16 24,22 18,16" fill="#ffffff" />
        <text
          x="38"
          y="20"
          fill="#ffffff"
          fontFamily="Arial, Helvetica, sans-serif"
          fontSize="17"
          fontWeight="700"
        >
          PaysafeCard
        </text>
      </g>

      <rect
        x="10"
        y="118"
        width="120"
        height="60"
        rx="8"
        fill="#ffffff"
        fillOpacity="0.08"
      />
    </svg>
  );
}
