import {
  activePrice,
  formatEuro,
  getPricingById,
  packageLabel,
  priceType as catalogPriceType,
  roundMoney,
} from "@/lib/customers/pricing";
import { athensTodayYmd, daysRemainingFromExpiry } from "@/lib/customers/status";
import { createCustomerId } from "@/lib/customers/token";
import type {
  AdminNotification,
  CrmData,
  Customer,
  CustomerNote,
  CustomerStatus,
  CustomerTag,
  CustomerView,
  DashboardStats,
  PackageId,
  PackagePricing,
  PriceType,
  Subscription,
} from "@/lib/customers/types";
import { DEFAULT_CUSTOMER_TAGS } from "@/lib/customers/types";

export function crmStatusFromDays(daysRemaining: number): CustomerStatus {
  if (daysRemaining <= 0) return "expired";
  if (daysRemaining <= 7) return "expiring";
  return "active";
}

export function ensureTags(list: CustomerTag[] | undefined): CustomerTag[] {
  const now = new Date().toISOString();
  const byId = new Map((list ?? []).map((item) => [item.id, item]));
  for (const seed of DEFAULT_CUSTOMER_TAGS) {
    if (!byId.has(seed.id)) {
      byId.set(seed.id, { ...seed, createdAt: now });
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, "el"));
}

export function normalizeSubscription(
  item: Subscription,
  pricing: PackagePricing[],
): { subscription: Subscription; changed: boolean } {
  const amountPaid = roundMoney(Number(item.amountPaid) || 0);
  const hasCost = typeof item.purchaseCostAtTime === "number" && Number.isFinite(item.purchaseCostAtTime);
  const hasProfit = typeof item.profitAtTime === "number" && Number.isFinite(item.profitAtTime);

  if (hasCost && hasProfit && item.priceType) {
    return {
      subscription: {
        ...item,
        amountPaid,
        purchaseCostAtTime: roundMoney(item.purchaseCostAtTime),
        profitAtTime: roundMoney(item.profitAtTime),
        priceType: item.priceType,
      },
      changed: amountPaid !== item.amountPaid,
    };
  }

  const pkg = getPricingById(pricing, item.packageId);
  const purchaseCostAtTime = hasCost ? roundMoney(item.purchaseCostAtTime) : roundMoney(pkg.purchaseCost);
  const profitAtTime = hasProfit ? roundMoney(item.profitAtTime) : roundMoney(amountPaid - purchaseCostAtTime);
  const priceType: PriceType =
    item.priceType === "OFFER" || item.priceType === "CUSTOMER_SPECIAL_OFFER" || item.priceType === "NORMAL"
      ? item.priceType
      : catalogPriceType(pkg);

  return {
    subscription: {
      ...item,
      amountPaid,
      purchaseCostAtTime,
      profitAtTime,
      priceType,
    },
    changed: true,
  };
}

export function toCustomerView(customer: Customer, data: CrmData, now = new Date()): CustomerView {
  const history = data.subscriptions
    .filter((item) => item.customerId === customer.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.startDate.localeCompare(b.startDate));
  const daysRemaining = daysRemainingFromExpiry(customer.expiresAt, now);
  const tagIds = customer.tagIds ?? [];
  const tags = data.tags.filter((tag) => tagIds.includes(tag.id));
  const notes = data.notes
    .filter((note) => note.customerId === customer.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return {
    ...customer,
    tagIds,
    daysRemaining,
    status: crmStatusFromDays(daysRemaining),
    packageLabel: packageLabel(customer.packageId),
    totalPaid: roundMoney(history.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0)),
    totalProfit: roundMoney(history.reduce((sum, item) => sum + Number(item.profitAtTime || 0), 0)),
    tags,
    notes,
    subscriptions: history,
    serverName: data.servers.find((server) => server.id === customer.serverId)?.name ?? null,
  };
}

export function visibleCustomers(customers: Customer[]) {
  return customers.filter((customer) => !customer.archivedAt);
}

export function buildCustomerViews(data: CrmData, now = new Date()): CustomerView[] {
  return visibleCustomers(data.customers)
    .map((customer) => toCustomerView(customer, data, now))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function monthPrefix(today = athensTodayYmd()) {
  return today.slice(0, 7);
}

export function buildDashboard(data: CrmData, views = buildCustomerViews(data)): DashboardStats {
  const month = monthPrefix();
  const monthSubs = data.subscriptions.filter((item) => item.createdAt.slice(0, 7) === month || item.startDate.slice(0, 7) === month);

  const totalRevenue = roundMoney(data.subscriptions.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0));
  const totalCost = roundMoney(
    data.subscriptions.reduce((sum, item) => sum + Number(item.purchaseCostAtTime || 0), 0),
  );
  const totalProfit = roundMoney(
    data.subscriptions.reduce((sum, item) => sum + Number(item.profitAtTime || 0), 0),
  );
  const monthRevenue = roundMoney(monthSubs.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0));
  const monthProfit = roundMoney(monthSubs.reduce((sum, item) => sum + Number(item.profitAtTime || 0), 0));

  const profitByPackage = new Map<PackageId, { name: string; profit: number }>();
  for (const item of data.subscriptions) {
    const current = profitByPackage.get(item.packageId) ?? { name: item.packageName, profit: 0 };
    current.profit = roundMoney(current.profit + Number(item.profitAtTime || 0));
    current.name = item.packageName || current.name;
    profitByPackage.set(item.packageId, current);
  }

  let topProfitPackageId: PackageId | null = null;
  let topProfitPackageName: string | null = null;
  let topProfitPackageAmount = 0;
  for (const [packageId, value] of profitByPackage) {
    if (value.profit > topProfitPackageAmount) {
      topProfitPackageId = packageId;
      topProfitPackageName = value.name;
      topProfitPackageAmount = value.profit;
    }
  }

  return {
    totalCustomers: views.length,
    activeSubscriptions: views.filter((item) => item.status === "active").length,
    expiringSoon: views.filter((item) => item.status === "expiring").length,
    expiredSubscriptions: views.filter((item) => item.status === "expired").length,
    totalRevenue,
    totalCost,
    totalProfit,
    monthRevenue,
    monthProfit,
    topProfitPackageId,
    topProfitPackageName,
    topProfitPackageAmount,
  };
}

export function buildNotifications(views: CustomerView[], now = new Date()): AdminNotification[] {
  const today = athensTodayYmd(now);
  const items: AdminNotification[] = [];

  for (const customer of views) {
    if (customer.status === "expiring") {
      items.push({
        id: `expiring:${customer.id}`,
        kind: "expiring_soon",
        customerId: customer.id,
        customerName: customer.name,
        packageLabel: customer.packageLabel,
        expiresAt: customer.expiresAt,
        daysRemaining: customer.daysRemaining,
        title: `🟠 Λήγει σύντομα — ${customer.name}`,
        detail: `${customer.packageLabel} · λήξη ${customer.expiresAt} · απομένουν ${customer.daysRemaining} ημέρες`,
      });
    } else if (customer.daysRemaining === 0) {
      items.push({
        id: `expired-today:${customer.id}`,
        kind: "expired_today",
        customerId: customer.id,
        customerName: customer.name,
        packageLabel: customer.packageLabel,
        expiresAt: customer.expiresAt,
        daysRemaining: 0,
        title: `🔴 Έληξε σήμερα — ${customer.name}`,
        detail: `${customer.packageLabel} · λήξη ${customer.expiresAt}`,
      });
    } else if (customer.daysRemaining < 0) {
      const daysPast = Math.abs(customer.daysRemaining);
      items.push({
        id: `expired:${customer.id}`,
        kind: "expired",
        customerId: customer.id,
        customerName: customer.name,
        packageLabel: customer.packageLabel,
        expiresAt: customer.expiresAt,
        daysRemaining: customer.daysRemaining,
        title: `🔴 Έχει λήξει — ${customer.name}`,
        detail: `${customer.packageLabel} · πριν ${daysPast} ${daysPast === 1 ? "ημέρα" : "ημέρες"}`,
      });
    }

    if (customer.activatedAt === today || customer.createdAt.slice(0, 10) === today) {
      items.push({
        id: `new:${customer.id}:${customer.activatedAt}`,
        kind: "new_activation",
        customerId: customer.id,
        customerName: customer.name,
        packageLabel: customer.packageLabel,
        expiresAt: customer.expiresAt,
        daysRemaining: customer.daysRemaining,
        title: `🔵 Νέα ενεργοποίηση — ${customer.name}`,
        detail: `${customer.packageLabel} · ενεργοποίηση ${customer.activatedAt}`,
      });
    }
  }

  const rank: Record<AdminNotification["kind"], number> = {
    expired_today: 0,
    expiring_soon: 1,
    expired: 2,
    new_activation: 3,
  };

  return items.sort((a, b) => rank[a.kind] - rank[b.kind] || a.customerName.localeCompare(b.customerName, "el"));
}

export function makeSubscription(input: {
  customerId: string;
  packageId: PackageId;
  startDate: string;
  endDate: string;
  pricing: PackagePricing[];
  createdAt?: string;
  amountPaid?: number;
  priceType?: PriceType;
  purchaseCostAtTime?: number;
}): Subscription {
  const pkg = getPricingById(input.pricing, input.packageId);
  const amountPaid = roundMoney(input.amountPaid ?? activePrice(pkg));
  const purchaseCostAtTime = roundMoney(input.purchaseCostAtTime ?? pkg.purchaseCost);
  const profitAtTime = roundMoney(amountPaid - purchaseCostAtTime);
  return {
    id: createCustomerId(),
    customerId: input.customerId,
    packageId: input.packageId,
    packageName: pkg.packageName,
    startDate: input.startDate,
    endDate: input.endDate,
    amountPaid,
    purchaseCostAtTime,
    profitAtTime,
    priceType: input.priceType ?? catalogPriceType(pkg),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function validateSpecialOfferPrice(
  pkg: PackagePricing,
  specialPrice: number,
): { ok: boolean; profit: number; message?: string } {
  const profit = roundMoney(specialPrice - pkg.purchaseCost);
  if (!Number.isFinite(specialPrice) || specialPrice <= 0) {
    return { ok: false, profit, message: "Η ειδική τιμή δεν είναι έγκυρη." };
  }
  if (specialPrice <= pkg.purchaseCost || profit <= 0) {
    return { ok: false, profit, message: "Η ειδική τιμή δεν αφήνει κέρδος" };
  }
  if (profit < (pkg.minimumProfit ?? 0)) {
    return {
      ok: false,
      profit,
      message: `Το κέρδος ${formatEuro(profit)} είναι κάτω από το ελάχιστο ${formatEuro(pkg.minimumProfit ?? 0)}`,
    };
  }
  return { ok: true, profit };
}

export function priceTypeLabel(type: PriceType) {
  if (type === "OFFER") return "🔥 Προσφορά";
  if (type === "CUSTOMER_SPECIAL_OFFER") return "🎁 Ειδική προσφορά";
  return "Κανονική";
}

export function formatPaidLabel(amount: number) {
  return `Σύνολο πληρωμών: ${formatEuro(amount)}`;
}

export function sortNotes(notes: CustomerNote[]) {
  return [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
