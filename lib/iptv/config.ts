export const DEFAULT_PROVIDER_BASE_URL = "https://api.26-cdn.com/v1/api/external";
export const PROVIDER_DISPLAY_NAME = "GRVIP Provider";

export function getProviderConfig() {
  const baseUrl =
    process.env.GRVIP_PROVIDER_API_BASE_URL?.trim().replace(/\/$/, "") || DEFAULT_PROVIDER_BASE_URL;
  const apiKey = process.env.GRVIP_PROVIDER_API_KEY?.trim() || "";
  return {
    baseUrl,
    apiKey,
    configured: apiKey.length > 0,
  };
}
