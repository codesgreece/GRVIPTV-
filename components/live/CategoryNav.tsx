"use client";

import { cn } from "@/lib/cn";

type CategoryNavProps = {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
  showFavorites: boolean;
};

export function CategoryNav({
  categories,
  active,
  onChange,
  showFavorites,
}: CategoryNavProps) {
  const items = [
    { id: "ALL", label: "ALL" },
    ...(showFavorites ? [{ id: "FAVORITES", label: "Favorites" }] : []),
    ...categories.map((c) => ({ id: c, label: c })),
  ];

  return (
    <div className="sticky top-[72px] z-30 -mx-1 border-b border-white/5 bg-[#050505]/85 py-3 backdrop-blur-xl md:top-20">
      <div
        className="flex gap-2 overflow-x-auto px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Channel categories"
      >
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(item.id)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold whitespace-nowrap transition",
                isActive
                  ? "border-red-500/50 bg-red-600 text-white shadow-[0_8px_24px_rgba(220,38,38,0.25)]"
                  : "border-white/10 bg-white/[0.03] text-text-muted hover:border-white/20 hover:text-white",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
