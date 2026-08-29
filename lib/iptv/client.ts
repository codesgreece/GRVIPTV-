import { ymdFromUnixAthens } from "@/lib/customers/athens-datetime";
import { getProviderConfig } from "@/lib/iptv/config";
import { ProviderApiError, providerErrorMessage } from "@/lib/iptv/errors";
import type {
  ProviderApiEnvelope,
  ProviderCredits,
  ProviderLine,
  ProviderLinesPage,
  ProviderPackage,
  ProviderStatus,
} from "@/lib/iptv/types";

async function providerRequest<T>(
  path: string,
  init?: RequestInit & { skipAuth?: boolean },
): Promise<T> {
  const { baseUrl, apiKey, configured } = getProviderConfig();
  if (!configured) {
    throw new ProviderApiError("Ο IPTV provider δεν είναι ρυθμισμένος.", 503, "not_configured");
  }

  const headers = new Headers(init?.headers);
  headers.set("Authorization", `Bearer ${apiKey}`);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });

  let payload: ProviderApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ProviderApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    const message = providerErrorMessage(response.status, payload?.message);
    throw new ProviderApiError(message, response.status, payload?.error_code);
  }

  if (payload.data === undefined) {
    throw new ProviderApiError("Άκυρη απάντηση από τον provider.", response.status, "invalid_response");
  }

  return payload.data;
}

export async function getProviderCredits() {
  return providerRequest<ProviderCredits>("/credits");
}

export async function getProviderPackages() {
  return providerRequest<ProviderPackage[]>("/packages");
}

export async function createProviderLine(input: { package_id: number; username?: string; password?: string }) {
  return providerRequest<ProviderLine>("/lines", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getProviderLine(id: number) {
  return providerRequest<ProviderLine>(`/lines/${id}`);
}

export async function listProviderLines(page = 1, pageSize = 20) {
  return providerRequest<ProviderLine[] | ProviderLinesPage>(
    `/lines?page=${page}&page_size=${pageSize}`,
  );
}

export async function renewProviderLine(id: number, package_id: number) {
  return providerRequest<ProviderLine>(`/lines/${id}/renew`, {
    method: "POST",
    body: JSON.stringify({ package_id }),
  });
}

export async function getProviderStatus(): Promise<ProviderStatus> {
  const { configured } = getProviderConfig();
  if (!configured) {
    return { connected: false, credits: null, label: "Μη ρυθμισμένο" };
  }

  try {
    const credits = await getProviderCredits();
    return {
      connected: true,
      credits: credits.credits,
      label: "Connected",
    };
  } catch {
    return {
      connected: false,
      credits: null,
      label: "Offline",
    };
  }
}

export function providerExpiryIso(expDate: number) {
  return new Date(expDate * 1000).toISOString();
}

export function providerExpiryYmd(expDate: number) {
  return ymdFromUnixAthens(expDate);
}
