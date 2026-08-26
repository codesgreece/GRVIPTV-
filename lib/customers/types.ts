export const PACKAGE_OPTIONS = [
  { id: "1-month", label: "1 Μήνας", months: 1 },
  { id: "3-months", label: "3 Μήνες", months: 3 },
  { id: "6-months", label: "6 Μήνες", months: 6 },
  { id: "12-months", label: "12 Μήνες", months: 12 },
] as const;

export const CUSTOMER_PACKAGES = PACKAGE_OPTIONS;

export type PackageId = (typeof PACKAGE_OPTIONS)[number]["id"];

export const DEFAULT_SETUP_GUIDE_PATH = "/odigos-egkatastasis";
export const RENEW_PATH = "https://grviptv.xyz/paketa";

export type CustomerStatus = "active" | "expiring" | "expired";
export type PriceType = "NORMAL" | "OFFER" | "CUSTOMER_SPECIAL_OFFER";

export type Customer = {
  id: string;
  token: string;
  name: string;
  packageId: PackageId;
  activatedAt: string;
  expiresAt: string;
  setupGuideUrl: string;
  createdAt: string;
  updatedAt: string;
  archivedAt?: string;
  tagIds?: string[];
};

export type Subscription = {
  id: string;
  customerId: string;
  packageId: PackageId;
  packageName: string;
  startDate: string;
  endDate: string;
  amountPaid: number;
  purchaseCostAtTime: number;
  profitAtTime: number;
  priceType: PriceType;
  createdAt: string;
};

export type PackagePricing = {
  packageId: PackageId;
  packageName: string;
  durationMonths: number;
  normalPrice: number;
  offerPrice: number;
  purchaseCost: number;
  offerEnabled: boolean;
  minimumProfit: number;
};

export type CustomerTag = {
  id: string;
  name: string;
  emoji: string;
  createdAt: string;
};

export type CustomerNote = {
  id: string;
  customerId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export const SALESPEOPLE = [
  { id: "dimos-leonidiou", name: "DIMOS LEONIDIOU" },
  { id: "giannis-kalaouris", name: "Γιάννης Καλαούρης" },
  { id: "andreas-leontios", name: "Ανδρέας Λεώντιος" },
] as const;

export type SalespersonId = (typeof SALESPEOPLE)[number]["id"];

export type Prospect = {
  id: string;
  salespersonId: SalespersonId;
  name: string;
  contactAt: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type ProspectInput = {
  salespersonId: SalespersonId;
  name: string;
  contactAt: string;
  note?: string;
};

export type CrmData = {
  customers: Customer[];
  subscriptions: Subscription[];
  pricing: PackagePricing[];
  tags: CustomerTag[];
  notes: CustomerNote[];
  prospects: Prospect[];
};

export type CustomerView = Customer & {
  daysRemaining: number;
  status: CustomerStatus;
  packageLabel: string;
  totalPaid: number;
  totalProfit: number;
  tags: CustomerTag[];
  notes: CustomerNote[];
  subscriptions: Subscription[];
};

export type DashboardStats = {
  totalCustomers: number;
  activeSubscriptions: number;
  expiringSoon: number;
  expiredSubscriptions: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  monthRevenue: number;
  monthProfit: number;
  topProfitPackageId: PackageId | null;
  topProfitPackageName: string | null;
  topProfitPackageAmount: number;
};

export type AdminNotificationKind =
  | "expiring_soon"
  | "expired_today"
  | "expired"
  | "new_activation";

export type AdminNotification = {
  id: string;
  kind: AdminNotificationKind;
  customerId: string;
  customerName: string;
  packageLabel: string;
  expiresAt: string;
  daysRemaining: number;
  title: string;
  detail: string;
};

export type CustomerInput = {
  name: string;
  packageId: PackageId;
  activatedAt: string;
  expiresAt: string;
  setupGuideUrl: string;
};

export type SubscriptionView = {
  daysRemaining: number;
  totalDays: number;
  elapsedDays: number;
  remainingPercent: number;
  tone: "green" | "orange" | "red" | "expired";
  statusLabel: string;
  statusHint: string;
};

export const DEFAULT_CUSTOMER_TAGS: Array<Omit<CustomerTag, "createdAt">> = [
  { id: "tag-vip", name: "VIP", emoji: "👑" },
  { id: "tag-old", name: "ΠΑΛΙΟΣ ΠΕΛΑΤΗΣ", emoji: "🔥" },
  { id: "tag-new", name: "ΝΕΟΣ ΠΕΛΑΤΗΣ", emoji: "🆕" },
  { id: "tag-offer", name: "ΠΡΟΣΦΟΡΑ", emoji: "🎁" },
  { id: "tag-frequent", name: "ΣΥΧΝΗ ΑΝΑΝΕΩΣΗ", emoji: "⭐" },
];
