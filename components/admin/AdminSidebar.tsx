"use client";

import { LayoutDashboard, LogOut, Tag, UserPlus, Users } from "lucide-react";
import { AdminProviderCredits } from "@/components/admin/AdminProviderCredits";
import { cn } from "@/lib/cn";

export type AdminSidebarTab = "overview" | "customers" | "pricing" | "prospects";

const NAV: { id: AdminSidebarTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Επισκόπηση", icon: LayoutDashboard },
  { id: "customers", label: "Πελάτες", icon: Users },
  { id: "pricing", label: "Τιμές", icon: Tag },
  { id: "prospects", label: "Πιθανοί", icon: UserPlus },
];

type AdminSidebarProps = {
  tab: AdminSidebarTab;
  onTabChange: (tab: AdminSidebarTab) => void;
  badges: Partial<Record<AdminSidebarTab, number>>;
  providerConnected: boolean;
  providerCredits: number | null;
  providerStatusLabel: string;
  refreshingCredits: boolean;
  onRefreshCredits: () => void;
  onLogout: () => void;
};

export function AdminSidebar({
  tab,
  onTabChange,
  badges,
  providerConnected,
  providerCredits,
  providerStatusLabel,
  refreshingCredits,
  onRefreshCredits,
  onLogout,
}: AdminSidebarProps) {
  return (
    <aside className="flex w-[4.25rem] shrink-0 flex-col border-r border-white/10 bg-[#080808] md:w-52">
      <div className="border-b border-white/10 px-2 py-3 md:px-4">
        <p className="hidden font-display text-lg font-black text-white md:block">GRVIP Admin</p>
        <p className="text-center font-display text-sm font-black text-gold md:hidden">GR</p>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          const badge = badges[item.id];
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-sm font-semibold transition-colors md:px-3",
                active
                  ? "bg-gold/15 text-gold"
                  : "text-text-muted hover:bg-white/5 hover:text-white",
              )}
              title={item.label}
            >
              <Icon className="mx-auto h-4 w-4 shrink-0 md:mx-0" />
              <span className="hidden flex-1 md:inline">{item.label}</span>
              {badge != null && badge > 0 ? (
                <span
                  className={cn(
                    "hidden rounded px-1.5 py-0.5 text-[10px] font-bold md:inline",
                    item.id === "overview" || item.id === "prospects"
                      ? "bg-amber-500/20 text-amber-200"
                      : "bg-white/10 text-text-dim",
                  )}
                >
                  {badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-white/10 p-2 md:p-3">
        <div className="hidden md:block">
          <AdminProviderCredits
            compact
            connected={providerConnected}
            credits={providerCredits}
            statusLabel={providerStatusLabel}
            refreshing={refreshingCredits}
            onRefresh={onRefreshCredits}
          />
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-2 py-2 text-xs font-semibold text-text-muted hover:text-white md:justify-start md:px-3"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden md:inline">Έξοδος</span>
        </button>
      </div>
    </aside>
  );
}
