"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { connectionDetailsText } from "@/lib/customers/connection-details";
import type { CustomerView } from "@/lib/customers/types";
import { cn } from "@/lib/cn";

type AdminConnectionDetailsProps = {
  customer: CustomerView;
  origin?: string;
  onCopyAll?: (text: string) => void;
  className?: string;
};

function formatDate(iso: string) {
  if (iso.includes("T")) {
    const date = new Date(iso);
    if (Number.isFinite(date.getTime())) {
      return new Intl.DateTimeFormat("el-GR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }
  }
  const [year, month, day] = iso.slice(0, 10).split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-black/30 px-2.5 py-2">
      <p className="text-[10px] font-semibold tracking-[0.12em] text-text-dim uppercase">{label}</p>
      <p className={cn("mt-0.5 break-all text-sm font-semibold text-white", mono && "font-mono text-xs")}>
        {value}
      </p>
    </div>
  );
}

export function AdminConnectionDetails({
  customer,
  origin,
  onCopyAll,
  className,
}: AdminConnectionDetailsProps) {
  const allText = connectionDetailsText(customer, origin);

  return (
    <div className={cn("rounded-xl border border-sky-500/25 bg-sky-500/5 p-3", className)}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-sky-200/90 uppercase">
          Στοιχεία σύνδεσης · {customer.providerServerLabel}
        </p>
        {onCopyAll ? (
          <Button
            variant="outline"
            className="h-8 px-2 py-1 text-[11px]"
            onClick={() => onCopyAll(allText)}
          >
            <Copy className="h-3.5 w-3.5" />
            Αντιγραφή όλων
          </Button>
        ) : null}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Row label="Username" value={customer.providerUsername ?? "—"} mono />
        <Row label="Password" value={customer.providerPassword ?? "—"} mono />
        <Row label="Line ID" value={customer.providerLineId ? String(customer.providerLineId) : "—"} mono />
        <Row
          label="Max connections"
          value={customer.providerMaxConnections != null ? String(customer.providerMaxConnections) : "—"}
        />
        <Row label="Λήξη" value={formatDate(customer.expiresAt)} />
        <Row
          label="Κατάσταση"
          value={customer.providerEnabled === false ? "Ανενεργό" : "Ενεργό"}
        />
      </div>
    </div>
  );
}
