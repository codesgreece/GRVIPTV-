export function formatProviderCredits(credits: number | null | undefined): string {
  if (credits == null || !Number.isFinite(credits)) return "—";
  const rounded = Math.round(credits * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}
