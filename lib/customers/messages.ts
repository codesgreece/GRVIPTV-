import type { CustomerView, Subscription } from "./types";
import { formatEuro } from "./pricing";

const SITE = "https://grviptv.xyz";
const RENEW_URL = `${SITE}/paketa`;

function formatDate(iso: string): string {
  const [year, month, day] = iso.slice(0, 10).split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

export function magicLink(token: string, origin = SITE): string {
  return `${origin.replace(/\/$/, "")}/account/${token}`;
}

export function activationMessage(customer: CustomerView, origin?: string): string {
  const lines = [
    `Γεια σου ${customer.name}! 👋`,
    "",
    `Η συνδρομή σου στο GRVIP OTT ενεργοποιήθηκε.`,
    `Πακέτο: ${customer.packageLabel}`,
    `Ημερομηνία ενεργοποίησης: ${formatDate(customer.activatedAt)}`,
    `Ημερομηνία λήξης: ${formatDate(customer.expiresAt)}`,
  ];

  if (customer.providerUsername || customer.providerPassword) {
    lines.push(
      "",
      "🔐 Στοιχεία σύνδεσης IPTV",
      `Username: ${customer.providerUsername ?? "—"}`,
      `Password: ${customer.providerPassword ?? "—"}`,
    );
  }

  lines.push(
    "",
    `Προσωπικός σου σύνδεσμος:`,
    magicLink(customer.token, origin),
    "",
    `Από εκεί βλέπεις τις ημέρες που απομένουν και τον οδηγό εγκατάστασης.`,
    `Υποστήριξη: https://t.me/+306955940150`,
  );

  return lines.join("\n");
}

export function expiringSoonMessage(customer: CustomerView): string {
  const days = Math.max(customer.daysRemaining, 1);
  return [
    `Γεια σου ${customer.name},`,
    "",
    `Η συνδρομή σου στο GRVIP OTT λήγει σε ${days} ${days === 1 ? "ημέρα" : "ημέρες"} (${formatDate(customer.expiresAt)}).`,
    "",
    `Για ανανέωση:`,
    RENEW_URL,
    "",
    `Αν θέλεις βοήθεια, στείλε μας στο Telegram: https://t.me/+306955940150`,
  ].join("\n");
}

export function expiredMessage(customer: CustomerView): string {
  return [
    `Γεια σου ${customer.name},`,
    "",
    `Η συνδρομή σου στο GRVIP OTT έχει λήξει (${formatDate(customer.expiresAt)}).`,
    "",
    `Για να την ανανεώσεις, επίλεξε πακέτο εδώ:`,
    RENEW_URL,
    "",
    `Telegram: https://t.me/+306955940150`,
  ].join("\n");
}

export function renewalMessage(customer: CustomerView, latest?: Subscription, origin?: string): string {
  const sub = latest ?? customer.subscriptions[customer.subscriptions.length - 1];
  return [
    `Γεια σου ${customer.name}!`,
    "",
    `Η ανανέωσή σου στο GRVIP OTT ολοκληρώθηκε.`,
    `Νέο πακέτο: ${sub?.packageName ?? customer.packageLabel}`,
    `Νέα ημερομηνία λήξης: ${formatDate(sub?.endDate ?? customer.expiresAt)}`,
    ...(sub ? [`Ποσό: ${formatEuro(sub.amountPaid)}`] : []),
    "",
    `Ο προσωπικός σου σύνδεσμος παραμένει ο ίδιος:`,
    magicLink(customer.token, origin),
    "",
    `Telegram: https://t.me/+306955940150`,
  ].join("\n");
}
