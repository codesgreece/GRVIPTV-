import type { CustomerView } from "./types";
import { magicLink } from "./messages";

function formatDate(iso: string): string {
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

export function connectionDetailsText(customer: CustomerView, origin?: string): string {
  const lines = [
    `👤 ${customer.name}`,
    `📦 ${customer.packageLabel}`,
    "",
    "🔐 Στοιχεία σύνδεσης IPTV",
    `Username: ${customer.providerUsername ?? "—"}`,
    `Password: ${customer.providerPassword ?? "—"}`,
    `Line ID: ${customer.providerLineId ?? "—"}`,
    `Λήξη: ${formatDate(customer.expiresAt)}`,
    `Συνδέσεις: ${customer.providerMaxConnections ?? "—"}`,
    `Κατάσταση: ${customer.providerEnabled === false ? "Ανενεργό" : "Ενεργό"}`,
    "",
    "🔗 Magic Link",
    magicLink(customer.token, origin),
  ];
  return lines.join("\n");
}
