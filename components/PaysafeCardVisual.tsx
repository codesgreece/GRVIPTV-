import { cn } from "@/lib/cn";

type PaysafeCardVisualProps = {
  amount: 5 | 10 | 25 | 50 | 100;
  className?: string;
};

export function PaysafeCardVisual({ amount, className }: PaysafeCardVisualProps) {
  return (
    <div
      className={cn(
        "relative aspect-[5/7] w-full min-w-[96px] overflow-hidden rounded-[10px] bg-gradient-to-br from-[#00A3E8] via-[#0082C9] to-[#006AA8] shadow-[0_8px_20px_rgba(0,120,200,0.35)]",
        className,
      )}
      aria-label={`PaysafeCard ${amount} EUR`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-transparent" />

      <div className="absolute top-0 left-1/2 h-[12px] w-[32%] -translate-x-1/2 rounded-b-md bg-white" />

      <p className="absolute top-[10px] right-[8px] font-display text-[13px] font-black leading-none text-white">
        €{amount}
      </p>

      <div className="absolute inset-x-0 top-[42%] px-2 text-center">
        <p className="text-[9px] font-bold uppercase leading-tight tracking-[0.06em] text-white">
          Paysafe
        </p>
        <p className="mt-0.5 text-[9px] font-bold uppercase leading-tight tracking-[0.06em] text-white/95">
          Card
        </p>
      </div>

      <div className="absolute inset-x-[8px] bottom-[8px] h-[26%] rounded-md border border-white/10 bg-white/8" />
    </div>
  );
}
