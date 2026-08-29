const ATHENS_TZ = "Europe/Athens";

export function formatAthensDateTime(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return iso;

  return new Intl.DateTimeFormat("el-GR", {
    timeZone: ATHENS_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatAthensDate(iso: string): string {
  const date = new Date(iso.includes("T") ? iso : `${iso.slice(0, 10)}T12:00:00`);
  if (!Number.isFinite(date.getTime())) return iso.slice(0, 10);

  return new Intl.DateTimeFormat("el-GR", {
    timeZone: ATHENS_TZ,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function ymdFromUnixAthens(unixSeconds: number): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ATHENS_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(unixSeconds * 1000));

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return `${read("year")}-${read("month")}-${read("day")}`;
}

export function unixToIso(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toISOString();
}

export function formatAthensDateTimeFromUnix(unixSeconds: number): string {
  return formatAthensDateTime(unixToIso(unixSeconds));
}

export function isDateTimeExpiry(value: string) {
  return value.includes("T") || value.length > 10;
}

/** Display expiry in Europe/Athens — datetime trials show time, paid packages show date only. */
export function formatExpiryDisplay(iso: string, options?: { withTimezoneLabel?: boolean }): string {
  const withLabel = options?.withTimezoneLabel ?? true;
  const suffix = withLabel ? " (ώρα Ελλάδας)" : "";

  if (isDateTimeExpiry(iso)) {
    return `${formatAthensDateTime(iso)}${suffix}`;
  }

  return formatAthensDate(iso);
}
