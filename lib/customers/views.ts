import {
  activePrice,
  formatEuro,
  getPricingById,
  packageLabel,
  priceType,
  roundMoney,
} from "@/lib/customers/pricing";
import { daysRemainingFromExpiry } from "@/lib/customers/status";
import { createCustomerId } from "@/lib/customers/token";
import type {
  CrmData,
  Customer,
  CustomerStatus,
  CustomerView,
  DashboardStats,
  PackageId,
  PackagePricing,
  Subscription,
} from "@/lib/customers/types";

export function crmStatusFromDays(daysRemaining: number): CustomerStatus {
  if (daysRemaining <= 0) return "expired";
  if (daysRemaining <= 7) return "expiring";
  return "active";
}

export function toCustomerView(
  customer: Customer,
  subscriptions: Subscription[],
  now = new Date(),
): CustomerView {
  const history = subscriptions
    .filter((item) => item.customerId === customer.id)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.startDate.localeCompare(b.startDate));
  const daysRemaining = daysRemainingFromExpiry(customer.expiresAt, now);

  return {
    ...customer,
    daysRemaining,
    status: crmStatusFromDays(daysRemaining),
    packageLabel: packageLabel(customer.packageId),
    totalPaid: roundMoney(history.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0)),
    subscriptions: history,
  };
}

export function visibleCustomers(customers: Customer[]) {
  return customers.filter((customer) => !customer.archivedAt);
}

export function buildCustomerViews(data: CrmData, now = new Date()): CustomerView[] {
  return visibleCustomers(data.customers)
    .map((customer) => toCustomerView(customer, data.subscriptions, now))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function buildDashboard(data: CrmData, views = buildCustomerViews(data)): DashboardStats {
  return {
    totalCustomers: views.length,
    activeSubscriptions: views.filter((item) => item.status === "active").length,
    expiringSoon: views.filter((item) => item.status === "expiring").length,
    expiredSubscriptions: views.filter((item) => item.status === "expired").length,
    totalRevenue: roundMoney(data.subscriptions.reduce((sum, item) => sum + Number(item.amountPaid || 0), 0)),
  };
}

export function makeSubscription(input: {
  customerId: string;
  packageId: PackageId;
  startDate: string;
  endDate: string;
  pricing: PackagePricing[];
  createdAt?: string;
}): Subscription {
  const pkg = getPricingById(input.pricing, input.packageId);
  return {
    id: createCustomerId(),
    customerId: input.customerId,
    packageId: input.packageId,
    packageName: pkg.packageName,
    startDate: input.startDate,
    endDate: input.endDate,
    amountPaid: roundMoney(activePrice(pkg)),
    priceType: priceType(pkg),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function formatPaidLabel(amount: number) {
  return `Σύνολο πληρωμών: ${formatEuro(amount)}`;
}
