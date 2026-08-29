export class ProviderApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ProviderApiError";
    this.status = status;
    this.code = code;
  }
}

export function providerErrorMessage(status: number, fallback?: string) {
  if (status === 401) return "Λάθος API Key. Έλεγξε το GRVIP_PROVIDER_API_KEY.";
  if (status === 404) return "Δεν βρέθηκε η γραμμή στον provider.";
  if (status === 422) return "Ανεπαρκή credits ή μη έγκυρο αίτημα στον provider.";
  if (status === 429) return "Πολλά αιτήματα στον provider. Δοκίμασε ξανά σε λίγο.";
  if (fallback && fallback.length > 0 && fallback.length < 120) return fallback;
  return "Αποτυχία επικοινωνίας με τον IPTV provider.";
}
