import { createCustomer, parseCustomerInput, removeCustomer } from "@/lib/customers/service";
import { getCustomerByToken } from "@/lib/customers/store";
import { getSubscriptionView } from "@/lib/customers/status";
import { isValidMagicToken } from "@/lib/customers/token";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

export async function verifyCustomerSystem() {
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
