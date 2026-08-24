export const CUSTOMER_PACKAGES = [
  { id: "1-month", label: "1 Μήνας", months: 1 },
  { id: "3-months", label: "3 Μήνες", months: 3 },
  { id: "6-months", label: "6 Μήνες", months: 6 },
  { id: "12-months", label: "12 Μήνες", months: 12 },
] as const;

export type CustomerPackageId = (typeof CUSTOMER_PACKAGES)[number]["id"];

export type Customer = {
  id: string;
  token: string;
  name: string;
  packageId: CustomerPackageId;
  activatedAt: string;
  expiresAt: string;
  setupGuideUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type CustomerInput = {
  name: string;
  packageId: CustomerPackageId;
  activatedAt: string;
  expiresAt: string;
  setupGuideUrl: string;
};

export type SubscriptionTone = "green" | "orange" | "red" | "expired";

export type SubscriptionView = {
  daysRemaining: number;
  totalDays: number;
  elapsedDays: number;
  remainingPercent: number;
  tone: SubscriptionTone;
  statusLabel: string;
  statusHint: string;
};

export const DEFAULT_SETUP_GUIDE_PATH = "/odigos-egkatastasis";
export const RENEW_PATH = "/paketa";
