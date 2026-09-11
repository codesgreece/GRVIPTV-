import { formatExpiryDisplay } from "@/lib/customers/athens-datetime";
import type { CustomerView } from "./types";

import { magicLink } from "./messages";

function formatDate(iso: string): string {
  return formatExpiryDisplay(iso);
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
