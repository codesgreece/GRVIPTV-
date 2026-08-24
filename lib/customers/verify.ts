import { createCustomer, parseCustomerInput, removeCustomer, renewCustomer } from "@/lib/customers/service";
import { getCustomerByToken, loadCrm } from "@/lib/customers/store";
import { getSubscriptionView } from "@/lib/customers/status";
import { isValidMagicToken } from "@/lib/customers/token";
import { canEnableOffer, DEFAULT_PACKAGE_PRICING, validatePricingUpdate } from "@/lib/customers/pricing";
import { crmStatusFromDays, toCustomerView } from "@/lib/customers/views";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

export function verifyCrmPricingLogic() {
  const threeMonths = DEFAULT_PACKAGE_PRICING.find((item) => item.packageId === "3-months");
  assert(threeMonths, "missing 3-month package seed");
  if (!threeMonths) throw new Error("missing 3-month package seed");

  assert(canEnableOffer(threeMonths).ok, "seed 3-month offer should be profitable");
  assert(!canEnableOffer({ ...threeMonths, offerPrice: 3 }).ok, "zero-profit offer must be blocked");
  assert(!canEnableOffer({ ...threeMonths, offerPrice: 2 }).ok, "negative-profit offer must be blocked");
  assert(
    !validatePricingUpdate({ ...threeMonths, offerEnabled: true, offerPrice: 3 }).ok,
    "cannot enable zero-profit offer",
  );
  assert(
    validatePricingUpdate({ ...threeMonths, offerEnabled: false, offerPrice: 3 }).ok,
    "disabled offer can be stored",
  );
  assert(crmStatusFromDays(8) === "active", "8 days should be active");
  assert(crmStatusFromDays(7) === "expiring", "7 days should be expiring soon");
  assert(crmStatusFromDays(1) === "expiring", "1 day should be expiring soon");
  assert(crmStatusFromDays(0) === "expired", "today should be expired");
}

export async function verifyCustomerSystem() {
  verifyCrmPricingLogic();

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
  });

  const created = await createCustomer(input);
  assert(isValidMagicToken(created.token), "token is not cryptographically valid");
  assert(!created.token.toLowerCase().includes("test"), "token leaked personal data");

  const loaded = await getCustomerByToken(created.token);
  assert(loaded?.id === created.id, "token did not load the same customer");
  assert(loaded?.name === "Test Customer", "wrong customer payload");
  assert(loaded?.packageId === "12-months", "wrong package");
  if (!loaded) throw new Error("customer missing after create");

  const view = getSubscriptionView(loaded);
  assert(view.daysRemaining >= 246 && view.daysRemaining <= 248, `unexpected remaining days: ${view.daysRemaining}`);
  assert(view.tone === "green", `expected green tone, got ${view.tone}`);

  const afterCreate = await loadCrm();
  const createdView = toCustomerView(loaded, afterCreate.subscriptions);
  assert(createdView.subscriptions.length === 1, "create should insert first subscription");
  const firstPaid = createdView.subscriptions[0]?.amountPaid ?? 0;
  assert(firstPaid > 0, "first subscription must store amountPaid");

  const renewed = await renewCustomer(created.id, "3-months");
  assert(renewed, "renewal failed");
  if (!renewed) throw new Error("renewal failed");
  assert(renewed.customer.token === created.token, "magic link must stay the same after renewal");
  assert(renewed.customer.subscriptions.length === 2, "renewal must append history");
  assert(renewed.customer.subscriptions[0]?.amountPaid === firstPaid, "old payment must stay frozen");
  assert(renewed.customer.totalPaid === firstPaid + renewed.subscription.amountPaid, "total paid should sum history");

  const deleted = await removeCustomer(created.id);
  assert(deleted, "customer was not deleted");
  const missing = await getCustomerByToken(created.token);
  assert(missing === null, "deleted token still resolves");

  return {
    token: created.token,
    daysRemaining: view.daysRemaining,
    tone: view.tone,
  };
}
