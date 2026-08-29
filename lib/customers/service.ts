import {
  CUSTOMER_PACKAGES,
  DEFAULT_SETUP_GUIDE_PATH,
  SALESPEOPLE,
  type Customer,
  type CustomerInput,
  type CustomerNote,
  type CustomerTag,
  type PackageId,
  type PackagePricing,
  type PriceType,
  type PaymentMethodId,
  type Prospect,
  type ProspectInput,
  type SalespersonId,
} from "@/lib/customers/types";
import { createCustomerId, createMagicToken } from "@/lib/customers/token";
import {
  deleteCustomer,
  getCustomerById,
  loadCrm,
  mutateCrm,
  tokenExists,
} from "@/lib/customers/store";
import {
  athensTodayYmd,
  isDateTimeExpiry,
  isTrialPackage,
} from "@/lib/customers/status";
import { makeSubscription, toCustomerView, validateSpecialOfferPrice } from "@/lib/customers/views";
import { activePrice, getPricingById, priceType as catalogPriceType, roundMoney } from "@/lib/customers/pricing";
import { parsePaymentMethod } from "@/lib/customers/payment";
import {
  createProviderLine,
  getProviderLine,
  providerExpiryIso,
  providerExpiryYmd,
  renewProviderLine,
} from "@/lib/iptv/client";
import { ProviderApiError } from "@/lib/iptv/errors";
import type { ProviderLine } from "@/lib/iptv/types";

function isYmd(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isExpiryValue(value: string) {
  return isYmd(value) || isDateTimeExpiry(value);
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

function requireProviderPackageId(packageId: PackageId, pricing: PackagePricing[]) {
  const pkg = getPricingById(pricing, packageId);
  if (!pkg.providerPackageId) {
    throw new Error(
      `Το πακέτο «${pkg.packageName}» δεν έχει συνδεδεμένο provider package. Ρύθμισέ το στο Τιμές.`,
    );
  }
  return pkg;
}

function providerPurchaseCost(pkg: ReturnType<typeof getPricingById>) {
  if (typeof pkg.providerCredits === "number" && Number.isFinite(pkg.providerCredits)) {
    return roundMoney(pkg.providerCredits);
  }
  return roundMoney(pkg.purchaseCost);
}

function resolveSale(
  pkg: ReturnType<typeof getPricingById>,
  input: { priceType?: PriceType; amountPaid?: number },
) {
  if (input.priceType === "CUSTOMER_SPECIAL_OFFER") {
    const check = validateSpecialOfferPrice(pkg, Number(input.amountPaid));
    if (!check.ok) throw new Error(check.message ?? "Μη έγκυρη ειδική προσφορά.");
    return {
      amountPaid: roundMoney(Number(input.amountPaid)),
      priceType: "CUSTOMER_SPECIAL_OFFER" as const,
      purchaseCostAtTime: providerPurchaseCost(pkg),
    };
  }

  if (input.priceType === "OFFER" || (input.priceType !== "NORMAL" && pkg.offerEnabled)) {
    return {
      amountPaid: roundMoney(pkg.offerPrice),
      priceType: "OFFER" as const,
      purchaseCostAtTime: providerPurchaseCost(pkg),
    };
  }

  return {
    amountPaid: roundMoney(input.amountPaid ?? activePrice(pkg)),
    priceType: (input.priceType ?? catalogPriceType(pkg)) as PriceType,
    purchaseCostAtTime: providerPurchaseCost(pkg),
  };
}

function customerFromProviderLine(line: ProviderLine, base: Partial<Customer>): Customer {
  return {
    id: base.id ?? createCustomerId(),
    token: base.token ?? "",
    name: base.name ?? "",
    packageId: base.packageId ?? "1-month",
    activatedAt: base.activatedAt ?? athensTodayYmd(),
    expiresAt: providerExpiryIso(line.exp_date),
    setupGuideUrl: base.setupGuideUrl ?? DEFAULT_SETUP_GUIDE_PATH,
    createdAt: base.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tagIds: base.tagIds ?? [],
    paymentMethod: base.paymentMethod,
    providerLineId: line.id,
    providerUsername: line.username,
    providerPassword: line.password,
    providerMaxConnections: line.max_connections,
    providerEnabled: line.enabled,
    providerNotes: line.notes ?? "",
  };
}

export function parseCustomerInput(body: unknown): CustomerInput {
  const data = (body ?? {}) as Record<string, unknown>;
  const name = String(data.name ?? "").trim();
  const packageId = String(data.packageId ?? "").trim();
  const activatedAt = String(data.activatedAt ?? "").trim() || athensTodayYmd();
  const expiresAtInput = String(data.expiresAt ?? "").trim();
  const setupGuideUrl = String(data.setupGuideUrl ?? DEFAULT_SETUP_GUIDE_PATH).trim() || DEFAULT_SETUP_GUIDE_PATH;
  const priceTypeRaw = String(data.priceType ?? "").trim();
  const priceType =
    priceTypeRaw === "OFFER" || priceTypeRaw === "CUSTOMER_SPECIAL_OFFER" || priceTypeRaw === "NORMAL"
      ? (priceTypeRaw as PriceType)
      : undefined;
  const amountPaid = typeof data.amountPaid === "number" ? data.amountPaid : undefined;

  if (name.length < 2 || name.length > 80) {
    throw new Error("Το ονοματεπώνωμο πρέπει να έχει 2-80 χαρακτήρες.");
  }

  if (!CUSTOMER_PACKAGES.some((item) => item.id === packageId)) {
    throw new Error("Μη έγκυρο πακέτο.");
  }

  if (!isYmd(activatedAt)) {
    throw new Error("Μη έγκυρες ημερομηνίες.");
  }

  const expiresAt = expiresAtInput && isExpiryValue(expiresAtInput) ? expiresAtInput : activatedAt;

  if (!isSafeSetupUrl(setupGuideUrl) || setupGuideUrl.length > 300) {
    throw new Error("Μη έγκυρο link οδηγού εγκατάστασης.");
  }

  const paymentMethod = parsePaymentMethod(data.paymentMethod, !isTrialPackage(packageId as PackageId));

  return {
    name,
    packageId: packageId as CustomerInput["packageId"],
    activatedAt,
    expiresAt,
    setupGuideUrl,
    paymentMethod,
    priceType,
    amountPaid,
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
  const crm = await loadCrm();
  const pkg = requireProviderPackageId(input.packageId, crm.pricing);
  const sale = resolveSale(pkg, input);

  let line: ProviderLine;
  try {
    line = await createProviderLine({ package_id: pkg.providerPackageId! });
  } catch (error) {
    if (error instanceof ProviderApiError) throw error;
    throw new Error("Αποτυχία δημιουργίας γραμμής στον provider.");
  }

  const now = new Date().toISOString();
  const activatedAt = providerExpiryYmd(line.exp_date) >= athensTodayYmd() ? athensTodayYmd() : input.activatedAt;
  const customer = customerFromProviderLine(line, {
    name: input.name,
    packageId: input.packageId,
    activatedAt,
    setupGuideUrl: input.setupGuideUrl,
    paymentMethod: input.paymentMethod,
    token: await uniqueToken(),
    createdAt: now,
  });

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
        amountPaid: sale.amountPaid,
        priceType: sale.priceType,
        purchaseCostAtTime: sale.purchaseCostAtTime,
        paymentMethod: input.paymentMethod,
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
      name: input.name,
      packageId: input.packageId,
      activatedAt: input.activatedAt,
      expiresAt: input.expiresAt,
      setupGuideUrl: input.setupGuideUrl,
      paymentMethod: input.paymentMethod ?? data.customers[index].paymentMethod,
      tagIds: data.customers[index].tagIds ?? [],
      updatedAt: new Date().toISOString(),
    };
    data.customers[index] = customer;
    return customer;
  });
}

export async function syncCustomerProvider(id: string) {
  const existing = await getCustomerById(id);
  if (!existing) return null;
  if (!existing.providerLineId) {
    throw new Error("Ο πελάτης δεν έχει provider line ID.");
  }

  const line = await getProviderLine(existing.providerLineId);

  return mutateCrm((data) => {
    const index = data.customers.findIndex((item) => item.id === id);
    if (index < 0) return null;

    const customer: Customer = {
      ...data.customers[index],
      expiresAt: providerExpiryIso(line.exp_date),
      providerUsername: line.username,
      providerPassword: line.password,
      providerMaxConnections: line.max_connections,
      providerEnabled: line.enabled,
      providerNotes: line.notes ?? data.customers[index].providerNotes ?? "",
      updatedAt: new Date().toISOString(),
    };
    data.customers[index] = customer;
    return toCustomerView(customer, data);
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
  paymentMethod?: PaymentMethodId;
};

export async function renewCustomer(id: string, options: PackageId | RenewOptions) {
  const packageId = typeof options === "string" ? options : options.packageId;
  const specialAmount = typeof options === "string" ? undefined : options.amountPaid;
  const specialType = typeof options === "string" ? undefined : options.priceType;
  const renewPaymentMethod =
    typeof options === "string" ? undefined : parsePaymentMethod(options.paymentMethod, !isTrialPackage(packageId));

  if (!CUSTOMER_PACKAGES.some((item) => item.id === packageId)) {
    throw new Error("Μη έγκυρο πακέτο.");
  }

  const crm = await loadCrm();
  const existing = crm.customers.find((item) => item.id === id && !item.archivedAt);
  if (!existing) return null;
  if (!existing.providerLineId) {
    throw new Error("Ο πελάτης δεν έχει provider line. Δεν μπορεί να ανανεωθεί μέσω API.");
  }

  const pkg = requireProviderPackageId(packageId, crm.pricing);
  const sale = resolveSale(pkg, {
    priceType: specialType,
    amountPaid: specialAmount,
  });

  let line: ProviderLine;
  try {
    line = await renewProviderLine(existing.providerLineId, pkg.providerPackageId!);
  } catch (error) {
    if (error instanceof ProviderApiError) throw error;
    throw new Error("Αποτυχία ανανέωσης γραμμής στον provider.");
  }

  const today = athensTodayYmd();
  const expiresAt = providerExpiryIso(line.exp_date);
  const now = new Date().toISOString();

  return mutateCrm((data) => {
    const index = data.customers.findIndex((item) => item.id === id && !item.archivedAt);
    if (index < 0) return null;

    const current = data.customers[index];
    const subscription = makeSubscription({
      customerId: current.id,
      packageId,
      startDate: today,
      endDate: expiresAt,
      pricing: data.pricing,
      createdAt: now,
      amountPaid: sale.amountPaid,
      priceType: sale.priceType,
      purchaseCostAtTime: sale.purchaseCostAtTime,
      paymentMethod: renewPaymentMethod,
    });

    data.subscriptions.push(subscription);

    const customer: Customer = {
      ...current,
      packageId,
      activatedAt: today,
      expiresAt,
      paymentMethod: renewPaymentMethod ?? current.paymentMethod,
      providerEnabled: line.enabled,
      providerMaxConnections: line.max_connections ?? current.providerMaxConnections,
      updatedAt: now,
      tagIds: current.tagIds ?? [],
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

function isSalespersonId(value: string): value is SalespersonId {
  return SALESPEOPLE.some((person) => person.id === value);
}

export function parseProspectInput(body: unknown): ProspectInput {
  const data = (body ?? {}) as Record<string, unknown>;
  const name = String(data.name ?? "").trim();
  const salespersonId = String(data.salespersonId ?? "").trim();
  const contactAt = String(data.contactAt ?? "").trim();
  const note = String(data.note ?? "").trim();

  if (name.length < 2 || name.length > 80) {
    throw new Error("Το όνομα πρέπει να έχει 2-80 χαρακτήρες.");
  }

  if (!isSalespersonId(salespersonId)) {
    throw new Error("Μη έγκυρος πωλητής.");
  }

  if (!isYmd(contactAt)) {
    throw new Error("Μη έγκυρη ημερομηνία επικοινωνίας.");
  }

  if (note.length > 500) {
    throw new Error("Η σημείωση πρέπει να έχει μέχρι 500 χαρακτήρες.");
  }

  return {
    salespersonId,
    name,
    contactAt,
    note: note || undefined,
  };
}

export async function createProspect(input: ProspectInput) {
  const now = new Date().toISOString();
  const prospect: Prospect = {
    id: createCustomerId(),
    salespersonId: input.salespersonId,
    name: input.name,
    contactAt: input.contactAt,
    note: input.note,
    createdAt: now,
    updatedAt: now,
  };

  return mutateCrm((data) => {
    data.prospects.push(prospect);
    return prospect;
  });
}

export async function updateProspect(id: string, input: ProspectInput) {
  return mutateCrm((data) => {
    const index = data.prospects.findIndex((item) => item.id === id);
    if (index < 0) return null;

    const prospect: Prospect = {
      ...data.prospects[index],
      ...input,
      updatedAt: new Date().toISOString(),
    };
    data.prospects[index] = prospect;
    return prospect;
  });
}

export async function removeProspect(id: string) {
  return mutateCrm((data) => {
    const before = data.prospects.length;
    data.prospects = data.prospects.filter((item) => item.id !== id);
    return data.prospects.length !== before;
  });
}
