import { roundMoney } from "@/lib/customers/pricing";
import type { CrmData } from "@/lib/customers/types";

function normalizeGreekName(name: string) {
  return name
    .toLocaleLowerCase("el")
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

function isApostolosDontoros(name: string) {
  const normalized = normalizeGreekName(name);
  return normalized.includes("αποστολος") && normalized.includes("ντοντορο");
}

/** One-off: customer paid 55€ for 12 months, not the catalog 89€. */
function fixApostolosDontorosPayment(data: CrmData): { data: CrmData; changed: boolean } {
  const customer = data.customers.find((item) => isApostolosDontoros(item.name));
  if (!customer) return { data, changed: false };

  const correctedAmount = 55;
  let changed = false;

  const subscriptions = data.subscriptions.map((subscription) => {
    if (subscription.customerId !== customer.id) return subscription;
    if (subscription.amountPaid !== 89) return subscription;

    const purchaseCostAtTime = roundMoney(Number(subscription.purchaseCostAtTime) || 15);
    changed = true;

    return {
      ...subscription,
      amountPaid: correctedAmount,
      purchaseCostAtTime,
      profitAtTime: roundMoney(correctedAmount - purchaseCostAtTime),
      priceType: "CUSTOMER_SPECIAL_OFFER" as const,
    };
  });

  if (!changed) return { data, changed: false };
  return { data: { ...data, subscriptions }, changed: true };
}

export function applyCrmMigrations(data: CrmData): { data: CrmData; changed: boolean } {
  return fixApostolosDontorosPayment(data);
}
