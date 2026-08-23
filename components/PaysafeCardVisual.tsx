import { cn } from "@/lib/cn";

type PaysafeCardVisualProps = {
  amount: 5 | 10 | 25 | 50 | 100;
  className?: string;
  compact?: boolean;
};

export function PaysafeCardVisual({
  amount,
  className,
  compact = false,
}: PaysafeCardVisualProps) {
  return (
    <div
      className={cn(
        "relative aspect-[5/7] w-full overflow-hidden rounded-[8px] bg-gradient-to-br from-[#00A3E8] via-[#0082C9] to-[#006AA8] shadow-[0_6px_14px_rgba(0,120,200,0.28)] sm:rounded-[10px] sm:shadow-[0_8px_20px_rgba(0,120,200,0.35)]",
        className,
      )}
      aria-label={`PaysafeCard ${amount} EUR`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-white/5 to-transparent" />

      <div
        className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 rounded-b-md bg-white",
          compact ? "h-[8px] w-[30%]" : "h-[10px] w-[32%] sm:h-[12px]",
        )}
      />

      <p
        className={cn(
          "absolute right-[6px] font-display font-black leading-none text-white",
          compact ? "top-[7px] text-[10px]" : "top-[8px] text-[11px] sm:top-[10px] sm:text-[13px]",
        )}
      >
        €{amount}
      </p>

      <div className="absolute inset-x-0 top-[40%] px-1 text-center sm:top-[42%] sm:px-2">
        <p
          className={cn(
            "font-bold uppercase leading-tight tracking-[0.05em] text-white",
            compact ? "text-[6px]" : "text-[7px] sm:text-[9px]",
          )}
        >
          Paysafe
        </p>
        <p
          className={cn(
            "font-bold uppercase leading-tight tracking-[0.05em] text-white/95",
            compact ? "mt-px text-[6px]" : "mt-0.5 text-[7px] sm:text-[9px]",
          )}
        >
          Card
        </p>
      </div>

      <div
        className={cn(
          "absolute inset-x-[6px] rounded-md border border-white/10 bg-white/8 sm:inset-x-[8px]",
          compact ? "bottom-[5px] h-[24%]" : "bottom-[6px] h-[24%] sm:bottom-[8px] sm:h-[26%]",
        )}
      />
    </div>
  );
}
