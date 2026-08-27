import { PACKAGE_OPTIONS, type Customer, type PackageId, type SubscriptionView } from "@/lib/customers/types";

const ATHENS_TZ = "Europe/Athens";

function getAthensYmd(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ATHENS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
  };
}

function ymdToUtcMs(year: number, month: number, day: number) {
  return Date.UTC(year, month - 1, day);
}

function parseYmd(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.slice(0, 10));
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;

  return { year, month, day };
}

export function isDateTimeExpiry(value: string) {
  return value.includes("T") || value.length > 10;
}

export function daysBetweenYmd(from: string, to: string) {
  const start = parseYmd(from);
  const end = parseYmd(to);
  if (!start || !end) return 0;

  const diff = ymdToUtcMs(end.year, end.month, end.day) - ymdToUtcMs(start.year, start.month, start.day);
  return Math.round(diff / 86_400_000);
}

export function athensTodayYmd(now = new Date()) {
  const { year, month, day } = getAthensYmd(now);
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function remainingMsFromExpiry(expiresAt: string, now = new Date()) {
  if (isDateTimeExpiry(expiresAt)) {
    const end = new Date(expiresAt).getTime();
    if (!Number.isFinite(end)) return 0;
    return end - now.getTime();
  }

  const days = daysBetweenYmd(athensTodayYmd(now), expiresAt.slice(0, 10));
  return days * 86_400_000;
}

export function daysRemainingFromExpiry(expiresAt: string, now = new Date()) {
  const ms = remainingMsFromExpiry(expiresAt, now);
  if (ms <= 0) return Math.min(0, Math.floor(ms / 86_400_000));
  return Math.max(1, Math.ceil(ms / 86_400_000));
}

export function getPackageOption(packageId: PackageId) {
  return PACKAGE_OPTIONS.find((item) => item.id === packageId);
}

export function getPackageLabel(packageId: Customer["packageId"]) {
  return getPackageOption(packageId)?.label ?? packageId;
}

export function getPackageMonths(packageId: Customer["packageId"]) {
  return getPackageOption(packageId)?.months ?? 0;
}

export function getPackageMinutes(packageId: Customer["packageId"]) {
  return getPackageOption(packageId)?.minutes ?? 0;
}

export function isTrialPackage(packageId: PackageId) {
  return getPackageMinutes(packageId) > 0;
}

export function addMonthsToYmd(ymd: string, months: number) {
  const parsed = parseYmd(ymd);
  if (!parsed) return ymd;

  const date = new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day));
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

export function computePackageExpiry(packageId: PackageId, activatedAtYmd: string, now = new Date()) {
  const minutes = getPackageMinutes(packageId);
  if (minutes > 0) {
    return new Date(now.getTime() + minutes * 60_000).toISOString();
  }
  const months = getPackageMonths(packageId);
  return addMonthsToYmd(activatedAtYmd.slice(0, 10), Math.max(months, 1));
}

export function formatGreekDate(ymd: string) {
  const parsed = parseYmd(ymd);
  if (!parsed) return ymd;

  return new Intl.DateTimeFormat("el-GR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(Date.UTC(parsed.year, parsed.month - 1, parsed.day)));
}

export function getSubscriptionView(
  customer: Pick<Customer, "activatedAt" | "expiresAt">,
  now = new Date(),
): SubscriptionView {
  const today = athensTodayYmd(now);
  const daysRemaining = daysRemainingFromExpiry(customer.expiresAt, now);
  const totalDays = Math.max(
    1,
    isDateTimeExpiry(customer.expiresAt)
      ? Math.max(
          1,
          Math.ceil(
            Math.max(0, new Date(customer.expiresAt).getTime() - new Date(customer.activatedAt).getTime()) /
              86_400_000,
          ),
        )
      : daysBetweenYmd(customer.activatedAt.slice(0, 10), customer.expiresAt.slice(0, 10)),
  );
  const elapsedDays = Math.max(0, daysBetweenYmd(customer.activatedAt.slice(0, 10), today));
  const remainingPercent = Math.max(
    0,
    Math.min(100, Math.round((Math.max(daysRemaining, 0) / totalDays) * 100)),
  );

  if (remainingMsFromExpiry(customer.expiresAt, now) <= 0) {
    return {
      daysRemaining: Math.min(daysRemaining, 0),
      totalDays,
      elapsedDays,
      remainingPercent: 0,
      tone: "expired",
      statusLabel: "Έληξε",
      statusHint: "Η συνδρομή έχει λήξει. Ανανέωσε για να συνεχίσεις χωρίς διακοπή.",
    };
  }

  if (daysRemaining <= 7) {
    return {
      daysRemaining,
      totalDays,
      elapsedDays,
      remainingPercent,
      tone: "red",
      statusLabel: "Λήγει άμεσα",
      statusHint: "Απομένουν λίγες ημέρες. Ανανέωσε τώρα για να μην μείνεις χωρίς γραμμή.",
    };
  }

  if (daysRemaining <= 30) {
    return {
      daysRemaining,
      totalDays,
      elapsedDays,
      remainingPercent,
      tone: "orange",
      statusLabel: "Λήγει σύντομα",
      statusHint: "Η συνδρομή πλησιάζει στη λήξη. Καλό είναι να ανανεώσεις έγκαιρα.",
    };
  }

  return {
    daysRemaining,
    totalDays,
    elapsedDays,
    remainingPercent,
    tone: "green",
    statusLabel: "Ενεργή",
    statusHint: "Η συνδρομή σου είναι ενεργή. Απόλαυσε το περιεχόμενο χωρίς άγχος.",
  };
}

export function adminStatusFromDays(daysRemaining: number) {
  if (daysRemaining <= 0) return { tone: "expired" as const, label: "Έληξε" };
  if (daysRemaining <= 7) return { tone: "orange" as const, label: "Λήγει σύντομα" };
  return { tone: "green" as const, label: "Ενεργή" };
}
