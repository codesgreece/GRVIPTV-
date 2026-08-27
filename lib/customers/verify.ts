import { createCustomer, parseCustomerInput, removeCustomer, renewCustomer } from "@/lib/customers/service";
import { createServer } from "@/lib/customers/servers";
import { getCustomerByToken, loadCrm } from "@/lib/customers/store";
import { getSubscriptionView } from "@/lib/customers/status";
import { isValidMagicToken } from "@/lib/customers/token";
import { canEnableOffer, DEFAULT_PACKAGE_PRICING, validatePricingUpdate } from "@/lib/customers/pricing";
import { crmStatusFromDays, toCustomerView, validateSpecialOfferPrice } from "@/lib/customers/views";
import { DEFAULT_CREDIT_RATES_WHOLE } from "@/lib/customers/types";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

export function verifyCrmPricingLogic() {
  const threeMonths = DEFAULT_PACKAGE_PRICING.find((item) => item.packageId === "3-months");
  assert(threeMonths, "missing 3-month package seed");
  if (!threeMonths) throw new Error("missing 3-month package seed");

  assert(canEnableOffer(threeMonths).ok, "seed 3-month offer should be profitable");
  assert(!canEnableOffer({ ...threeMonths, offerPrice: 3 }).ok, "zero-profit offer must be blocked");
  assert(!validateSpecialOfferPrice(threeMonths, threeMonths.purchaseCost).ok, "special at cost blocked");
  assert(validateSpecialOfferPrice(threeMonths, 32).ok, "special 32 should be ok");
  assert(
    !validatePricingUpdate({ ...threeMonths, offerEnabled: true, offerPrice: 3 }).ok,
    "cannot enable zero-profit offer",
  );
  assert(crmStatusFromDays(8) === "active", "8 days should be active");
  assert(crmStatusFromDays(7) === "expiring", "7 days should be expiring soon");
  assert(crmStatusFromDays(0) === "expired", "today should be expired");
}

export async function verifyCustomerSystem() {
  verifyCrmPricingLogic();

  const server = await createServer({
    name: "Verify Server",
    creditsRemaining: 100,
    creditRates: DEFAULT_CREDIT_RATES_WHOLE,
  });

  const today = new Date();
  const start = today.toISOString().slice(0, 10);
  const future = new Date(today);
  future.setUTCDate(future.getUTCDate() + 247);
  const expiresAt = future.toISOString().slice(0, 10);

  const input = parseCustomerInput({
    name: "Test Customer",
    packageId: "12-months",
    activatedAt: start,
    expiresAt,
    setupGuideUrl: "/odigos-egkatastasis",
    serverId: server.id,
  });

  const beforeCredits = (await loadCrm()).servers.find((item) => item.id === server.id)?.creditsRemaining;
  const created = await createCustomer(input);
  assert(isValidMagicToken(created.token), "token is not cryptographically valid");
  const afterCreateCredits = (await loadCrm()).servers.find((item) => item.id === server.id)?.creditsRemaining;
  assert(
    beforeCredits != null &&
      afterCreateCredits != null &&
      afterCreateCredits === beforeCredits - DEFAULT_CREDIT_RATES_WHOLE["12-months"],
    "create must deduct server credits",
  );

  const loaded = await getCustomerByToken(created.token);
  assert(loaded?.id === created.id, "token did not load the same customer");
  if (!loaded) throw new Error("customer missing after create");

  const view = getSubscriptionView(loaded);
  assert(view.tone === "green", `expected green tone, got ${view.tone}`);

  const afterCreate = await loadCrm();
  const createdView = toCustomerView(loaded, afterCreate);
  assert(createdView.subscriptions.length === 1, "create should insert first subscription");
  const first = createdView.subscriptions[0];
  assert(first && first.amountPaid > 0, "first subscription must store amountPaid");
  assert(first && typeof first.purchaseCostAtTime === "number", "must snapshot purchase cost");
  assert(first && typeof first.profitAtTime === "number", "must snapshot profit");
  const firstPaid = first?.amountPaid ?? 0;
  const firstCost = first?.purchaseCostAtTime ?? 0;

  const beforeRenewCredits = (await loadCrm()).servers.find((item) => item.id === server.id)?.creditsRemaining;
  const renewed = await renewCustomer(created.id, { packageId: "3-months", serverId: server.id });
  assert(renewed, "renewal failed");
  if (!renewed) throw new Error("renewal failed");
  assert(renewed.customer.token === created.token, "magic link must stay the same after renewal");
  assert(renewed.customer.subscriptions.length === 2, "renewal must append history");
  assert(renewed.customer.subscriptions[0]?.amountPaid === firstPaid, "old payment must stay frozen");
  assert(renewed.customer.subscriptions[0]?.purchaseCostAtTime === firstCost, "old cost must stay frozen");
  const afterRenewCredits = (await loadCrm()).servers.find((item) => item.id === server.id)?.creditsRemaining;
  assert(
    beforeRenewCredits != null &&
      afterRenewCredits != null &&
      afterRenewCredits === beforeRenewCredits - DEFAULT_CREDIT_RATES_WHOLE["3-months"],
    "renew must deduct server credits",
  );

  const special = await renewCustomer(created.id, {
    packageId: "3-months",
    amountPaid: 32,
    priceType: "CUSTOMER_SPECIAL_OFFER",
    serverId: server.id,
  });
  assert(special?.subscription.priceType === "CUSTOMER_SPECIAL_OFFER", "special offer type");
  assert(special?.subscription.amountPaid === 32, "special amount");
  assert(special?.customer.token === created.token, "token unchanged after special");

  const deleted = await removeCustomer(created.id);
  assert(deleted, "customer was not deleted");

  return {
    token: created.token,
    daysRemaining: view.daysRemaining,
    tone: view.tone,
  };
}
