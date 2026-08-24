import { CUSTOMER_PACKAGES, DEFAULT_SETUP_GUIDE_PATH, type Customer, type CustomerInput } from "@/lib/customers/types";
import { createCustomerId, createMagicToken } from "@/lib/customers/token";
import { deleteCustomer, getCustomerById, saveCustomer, tokenExists } from "@/lib/customers/store";

function isYmd(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isSafeSetupUrl(value: string) {
  if (value.startsWith("/")) {
    return !value.startsWith("//") && !value.includes("://");
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function parseCustomerInput(body: unknown): CustomerInput {
  const data = (body ?? {}) as Record<string, unknown>;
  const name = String(data.name ?? "").trim();
  const packageId = String(data.packageId ?? "").trim();
  const activatedAt = String(data.activatedAt ?? "").trim();
  const expiresAt = String(data.expiresAt ?? "").trim();
  const setupGuideUrl = String(data.setupGuideUrl ?? DEFAULT_SETUP_GUIDE_PATH).trim() || DEFAULT_SETUP_GUIDE_PATH;

  if (name.length < 2 || name.length > 80) {
    throw new Error("Το ονοματεπώνυμο πρέπει να έχει 2-80 χαρακτήρες.");
  }

  if (!CUSTOMER_PACKAGES.some((item) => item.id === packageId)) {
    throw new Error("Μη έγκυρο πακέτο.");
  }

  if (!isYmd(activatedAt) || !isYmd(expiresAt)) {
    throw new Error("Μη έγκυρες ημερομηνίες.");
  }

  if (expiresAt < activatedAt) {
    throw new Error("Η λήξη δεν μπορεί να είναι πριν την ενεργοποίηση.");
  }

  if (!isSafeSetupUrl(setupGuideUrl) || setupGuideUrl.length > 300) {
    throw new Error("Μη έγκυρο link οδηγού εγκατάστασης.");
  }

  return {
    name,
    packageId: packageId as CustomerInput["packageId"],
    activatedAt,
    expiresAt,
    setupGuideUrl,
  };
}

async function uniqueToken(ignoreId?: string) {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const token = createMagicToken();
    if (!(await tokenExists(token, ignoreId))) return token;
  }

  throw new Error("Αποτυχία δημιουργίας μοναδικού Magic Link.");
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const now = new Date().toISOString();
  const customer: Customer = {
    id: createCustomerId(),
    token: await uniqueToken(),
    name: input.name,
    packageId: input.packageId,
    activatedAt: input.activatedAt,
    expiresAt: input.expiresAt,
    setupGuideUrl: input.setupGuideUrl,
    createdAt: now,
    updatedAt: now,
  };

  await saveCustomer(customer);
  return customer;
}

export async function updateCustomer(id: string, input: CustomerInput) {
  const existing = await getCustomerById(id);
  if (!existing) return null;

  const customer: Customer = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  await saveCustomer(customer);
  return customer;
}

export async function regenerateCustomerToken(id: string) {
  const existing = await getCustomerById(id);
  if (!existing) return null;

  const customer: Customer = {
    ...existing,
    token: await uniqueToken(existing.id),
    updatedAt: new Date().toISOString(),
  };

  await saveCustomer(customer);
  return customer;
}

export async function removeCustomer(id: string) {
  return deleteCustomer(id);
}
