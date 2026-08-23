import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: "gold" | "outline" | "ghost";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  fullWidth?: boolean;
};

export function Button({
  href,
  children,
  variant = "gold",
  className,
  onClick,
  type = "button",
  fullWidth,
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60",
    fullWidth && "w-full",
    variant === "gold" &&
      "bg-gradient-to-r from-[#D4A72C] via-[#F2C75C] to-[#D4A72C] text-[#0a0a0a] shadow-[0_8px_28px_rgba(212,167,44,0.28)] hover:shadow-[0_10px_36px_rgba(212,167,44,0.42)] hover:brightness-105",
    variant === "outline" &&
      "border border-white/20 bg-white/5 text-white hover:border-gold/50 hover:bg-white/10",
    variant === "ghost" && "text-text-muted hover:text-gold",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
