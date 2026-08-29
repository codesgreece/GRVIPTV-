export const PAID_PACKAGE_OPTIONS = [
  { id: "1-month", label: "1 Μήνας", months: 1, minutes: 0 },
  { id: "3-months", label: "3 Μήνες", months: 3, minutes: 0 },
  { id: "6-months", label: "6 Μήνες", months: 6, minutes: 0 },
  { id: "12-months", label: "12 Μήνες", months: 12, minutes: 0 },
] as const;

export const TRIAL_PACKAGE_OPTIONS = [
  { id: "trial-30min", label: "Trial 30 λεπτών", months: 0, minutes: 30 },
  { id: "trial-1hour", label: "Trial 1 ώρας", months: 0, minutes: 60 },
  { id: "trial-1day", label: "Trial 1 ημέρας", months: 0, minutes: 1_440 },
] as const;

export const PACKAGE_OPTIONS = [...PAID_PACKAGE_OPTIONS, ...TRIAL_PACKAGE_OPTIONS] as const;

export const CUSTOMER_PACKAGES = PACKAGE_OPTIONS;

export type PackageId = (typeof PACKAGE_OPTIONS)[number]["id"];
export type PaidPackageId = (typeof PAID_PACKAGE_OPTIONS)[number]["id"];

export const DEFAULT_SETUP_GUIDE_PATH = "/odigos-egkatastasis";
export const RENEW_PATH = "https://grviptv.xyz/paketa";

export type CustomerStatus = "active" | "expiring" | "expired";
export type PriceType = "NORMAL" | "OFFER" | "CUSTOMER_SPECIAL_OFFER";

export const PAYMENT_METHODS = [
  { id: "paysafe", label: "Paysafe" },
  { id: "iris", label: "IRIS" },
  { id: "paypal", label: "PayPal" },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

export type Server = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type ServerInput = {
  name: string;
};

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
  serverId?: string;
  paymentMethod?: PaymentMethodId;
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
  paymentMethod?: PaymentMethodId;
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
  servers: Server[];
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
  serverName: string | null;
  paymentMethodLabel: string | null;
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
  serverId: string;
  paymentMethod?: PaymentMethodId;
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
