import {
  CUSTOMER_PACKAGES,
  DEFAULT_SETUP_GUIDE_PATH,
  type Customer,
  type CustomerInput,
  type CustomerNote,
  type CustomerTag,
  type PackageId,
  type PriceType,
} from "@/lib/customers/types";
import { createCustomerId, createMagicToken } from "@/lib/customers/token";
import {
  deleteCustomer,
  getCustomerById,
  mutateCrm,
  tokenExists,
} from "@/lib/customers/store";
import { addMonthsToYmd, athensTodayYmd, getPackageMonths } from "@/lib/customers/status";
import { makeSubscription, toCustomerView, validateSpecialOfferPrice } from "@/lib/customers/views";
import { getPricingById } from "@/lib/customers/pricing";

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
  const expiresAtInput = String(data.expiresAt ?? "").trim();
  const setupGuideUrl = String(data.setupGuideUrl ?? DEFAULT_SETUP_GUIDE_PATH).trim() || DEFAULT_SETUP_GUIDE_PATH;

  if (name.length < 2 || name.length > 80) {
    throw new Error("Το ονοματεπώνυμο πρέπει να έχει 2-80 χαρακτήρες.");
  }

  if (!CUSTOMER_PACKAGES.some((item) => item.id === packageId)) {
    throw new Error("Μη έγκυρο πακέτο.");
  }

  if (!isYmd(activatedAt)) {
    throw new Error("Μη έγκυρες ημερομηνίες.");
  }

  const expiresAt = isYmd(expiresAtInput)
    ? expiresAtInput
    : addMonthsToYmd(activatedAt, getPackageMonths(packageId as PackageId));

  if (!isYmd(expiresAt)) {
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
    tagIds: [],
  };

  return mutateCrm((data) => {
    data.customers.push(customer);
    data.subscriptions.push(
      makeSubscription({
        customerId: customer.id,
        packageId: customer.packageId,
        startDate: customer.activatedAt,
        endDate: customer.expiresAt,
        pricing: data.pricing,
        createdAt: now,
      }),
    );
    return customer;
  });
}

export async function updateCustomer(id: string, input: CustomerInput) {
  return mutateCrm((data) => {
    const index = data.customers.findIndex((item) => item.id === id);
    if (index < 0) return null;

    const customer: Customer = {
      ...data.customers[index],
      ...input,
      tagIds: data.customers[index].tagIds ?? [],
      updatedAt: new Date().toISOString(),
    };
    data.customers[index] = customer;
    return customer;
  });
}

export async function regenerateCustomerToken(id: string) {
  const existing = await getCustomerById(id);
  if (!existing) return null;

  const customer: Customer = {
    ...existing,
    token: await uniqueToken(existing.id),
    updatedAt: new Date().toISOString(),
  };

  return mutateCrm((data) => {
    const index = data.customers.findIndex((item) => item.id === id);
    if (index < 0) return null;
    data.customers[index] = customer;
    return customer;
  });
}

export async function removeCustomer(id: string) {
  return deleteCustomer(id);
}

export type RenewOptions = {
  packageId: PackageId;
  amountPaid?: number;
  priceType?: PriceType;
};

export async function renewCustomer(id: string, options: PackageId | RenewOptions) {
  const packageId = typeof options === "string" ? options : options.packageId;
  const specialAmount = typeof options === "string" ? undefined : options.amountPaid;
  const specialType = typeof options === "string" ? undefined : options.priceType;

  if (!CUSTOMER_PACKAGES.some((item) => item.id === packageId)) {
    throw new Error("Μη έγκυρο πακέτο.");
  }

  return mutateCrm((data) => {
    const index = data.customers.findIndex((item) => item.id === id && !item.archivedAt);
    if (index < 0) return null;

    const existing = data.customers[index];
    const today = athensTodayYmd();
    const expiresAt = addMonthsToYmd(today, getPackageMonths(packageId));
    const now = new Date().toISOString();
    const pkg = getPricingById(data.pricing, packageId);

    if (specialType === "CUSTOMER_SPECIAL_OFFER") {
      const check = validateSpecialOfferPrice(pkg, Number(specialAmount));
      if (!check.ok) throw new Error(check.message ?? "Μη έγκυρη ειδική προσφορά.");
    }

    const subscription = makeSubscription({
      customerId: existing.id,
      packageId,
      startDate: today,
      endDate: expiresAt,
      pricing: data.pricing,
      createdAt: now,
      amountPaid: specialAmount,
      priceType: specialType,
      purchaseCostAtTime: pkg.purchaseCost,
    });

    data.subscriptions.push(subscription);

    const customer: Customer = {
      ...existing,
      packageId,
      activatedAt: today,
      expiresAt,
      updatedAt: now,
      tagIds: existing.tagIds ?? [],
    };
    data.customers[index] = customer;

    return {
      customer: toCustomerView(customer, data),
      subscription,
      charged: {
        amountPaid: subscription.amountPaid,
        purchaseCostAtTime: subscription.purchaseCostAtTime,
        profitAtTime: subscription.profitAtTime,
        priceType: subscription.priceType,
        packageName: pkg.packageName,
        normalPrice: pkg.normalPrice,
        offerPrice: pkg.offerPrice,
        offerEnabled: pkg.offerEnabled,
      },
    };
  });
}

export async function setCustomerTags(id: string, tagIds: string[]) {
  return mutateCrm((data) => {
    const index = data.customers.findIndex((item) => item.id === id);
    if (index < 0) return null;

    const allowed = new Set(data.tags.map((tag) => tag.id));
    const unique = [...new Set(tagIds.filter((tagId) => allowed.has(tagId)))];
    const customer: Customer = {
      ...data.customers[index],
      tagIds: unique,
      updatedAt: new Date().toISOString(),
    };
    data.customers[index] = customer;
    return toCustomerView(customer, data);
  });
}

export async function createTag(input: { name: string; emoji: string }) {
  const name = input.name.trim();
  const emoji = input.emoji.trim() || "🏷️";
  if (name.length < 2 || name.length > 40) throw new Error("Το όνομα tag πρέπει να έχει 2-40 χαρακτήρες.");

  return mutateCrm((data) => {
    const exists = data.tags.some((tag) => tag.name.toLocaleLowerCase("el") === name.toLocaleLowerCase("el"));
    if (exists) throw new Error("Υπάρχει ήδη tag με αυτό το όνομα.");
    const tag: CustomerTag = {
      id: `tag-${createCustomerId()}`,
      name,
      emoji,
      createdAt: new Date().toISOString(),
    };
    data.tags.push(tag);
    return tag;
  });
}

export async function addCustomerNote(customerId: string, content: string) {
  const text = content.trim();
  if (text.length < 1 || text.length > 1000) throw new Error("Η σημείωση πρέπει να έχει 1-1000 χαρακτήρες.");

  return mutateCrm((data) => {
    if (!data.customers.some((item) => item.id === customerId)) return null;
    const now = new Date().toISOString();
    const note: CustomerNote = {
      id: createCustomerId(),
      customerId,
      content: text,
      createdAt: now,
      updatedAt: now,
    };
    data.notes.push(note);
    return note;
  });
}

export async function updateCustomerNote(noteId: string, content: string) {
  const text = content.trim();
  if (text.length < 1 || text.length > 1000) throw new Error("Η σημείωση πρέπει να έχει 1-1000 χαρακτήρες.");

  return mutateCrm((data) => {
    const index = data.notes.findIndex((item) => item.id === noteId);
    if (index < 0) return null;
    const note: CustomerNote = {
      ...data.notes[index],
      content: text,
      updatedAt: new Date().toISOString(),
    };
    data.notes[index] = note;
    return note;
  });
}

export async function deleteCustomerNote(noteId: string) {
  return mutateCrm((data) => {
    const before = data.notes.length;
    data.notes = data.notes.filter((item) => item.id !== noteId);
    return data.notes.length !== before;
  });
}
