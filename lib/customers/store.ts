import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ensurePricing, migrateStoredPricing } from "@/lib/customers/pricing";
import type {
  CrmData,
  Customer,
  CustomerNote,
  CustomerTag,
  PackagePricing,
  Prospect,
  Server,
  Subscription,
} from "@/lib/customers/types";
import { ensureTags, makeSubscription, normalizeSubscription } from "@/lib/customers/views";
import { normalizeServers } from "@/lib/customers/servers";
import { applyCrmMigrations } from "@/lib/customers/migrations";

const CRM_REDIS_KEY = "grvip:crm";
const LEGACY_REDIS_KEY = "grvip:customers";
const CRM_FILE_PATH = path.join(process.cwd(), "data", ".crm.json");
const LEGACY_FILE_PATH = path.join(process.cwd(), "data", ".customers.json");

type StoreBackend = "upstash" | "file";

function upstashConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

function activeBackend(): StoreBackend {
  if (upstashConfig()) return "upstash";
  return "file";
}

export function customerStoreMode() {
  const backend = activeBackend();
  const vercel = Boolean(process.env.VERCEL);

  if (backend === "file" && vercel) {
    return {
      backend,
      persistent: false,
      warning:
        "Στο Vercel χρειάζονται UPSTASH_REDIS_REST_URL και UPSTASH_REDIS_REST_TOKEN για να μην χάνονται οι πελάτες μετά από κάθε deploy.",
    };
  }

  return {
    backend,
    persistent: backend === "upstash" || !vercel,
    warning: null as string | null,
  };
}

async function redisCommand(command: Array<string>) {
  const config = upstashConfig();
  if (!config) throw new Error("UPSTASH_NOT_CONFIGURED");

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Upstash error ${response.status}: ${detail}`);
  }

  const payload = (await response.json()) as { result?: unknown };
  return payload.result;
}

function parseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isCrmData(value: unknown): value is CrmData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<CrmData>;
  return Array.isArray(data.customers);
}

function isCustomerArray(value: unknown): value is Customer[] {
  return Array.isArray(value);
}

function emptyCrm(): CrmData {
  return {
    customers: [],
    subscriptions: [],
    pricing: migrateStoredPricing([]),
    tags: ensureTags([]),
    notes: [],
    prospects: [],
    servers: [],
  };
}

function normalizeCustomers(customers: Customer[]): { customers: Customer[]; changed: boolean } {
  let changed = false;
  const next = customers.map((customer) => {
    if (Array.isArray(customer.tagIds)) return customer;
    changed = true;
    return { ...customer, tagIds: [] };
  });
  return { customers: next, changed };
}

function normalizeSubscriptions(
  subscriptions: Subscription[],
  pricing: PackagePricing[],
): { subscriptions: Subscription[]; changed: boolean } {
  let changed = false;
  const next = subscriptions.map((item) => {
    const result = normalizeSubscription(item, pricing);
    if (result.changed) changed = true;
    return result.subscription;
  });
  return { subscriptions: next, changed };
}

function normalizeCrm(value: unknown): { data: CrmData; migrated: boolean } {
  if (isCrmData(value)) {
    const pricing = migrateStoredPricing(value.pricing);
    const tags = ensureTags(value.tags);
    const notes = Array.isArray(value.notes) ? (value.notes as CustomerNote[]) : [];
    const prospects = Array.isArray(value.prospects) ? (value.prospects as Prospect[]) : [];
    const servers = normalizeServers((value as CrmData).servers);
    const customersResult = normalizeCustomers(value.customers ?? []);
    const subscriptionsResult = normalizeSubscriptions(
      Array.isArray(value.subscriptions) ? value.subscriptions : [],
      pricing,
    );
    const pricingChanged = JSON.stringify(value.pricing ?? []) !== JSON.stringify(pricing);
    const tagsChanged = JSON.stringify(value.tags ?? []) !== JSON.stringify(tags);
    const notesMissing = !Array.isArray(value.notes);
    const prospectsMissing = !Array.isArray(value.prospects);
    const serversMissing = !Array.isArray((value as { servers?: unknown }).servers);

    return {
      data: {
        customers: customersResult.customers,
        subscriptions: subscriptionsResult.subscriptions,
        pricing,
        tags,
        notes,
        prospects,
        servers,
      },
      migrated:
        pricingChanged ||
        tagsChanged ||
        notesMissing ||
        prospectsMissing ||
        serversMissing ||
        customersResult.changed ||
        subscriptionsResult.changed ||
        !Array.isArray(value.subscriptions) ||
        !Array.isArray(value.pricing),
    };
  }

  if (isCustomerArray(value)) {
    return {
      data: {
        customers: value.map((customer) => ({ ...customer, tagIds: customer.tagIds ?? [] })),
        subscriptions: [],
        pricing: migrateStoredPricing([]),
        tags: ensureTags([]),
        notes: [],
        prospects: [],
        servers: [],
      },
      migrated: true,
    };
  }

  return { data: emptyCrm(), migrated: false };
}

function backfillSubscriptions(data: CrmData): { data: CrmData; changed: boolean } {
  const known = new Set(data.subscriptions.map((item) => item.customerId));
  const extra: Subscription[] = [];

  for (const customer of data.customers) {
    if (known.has(customer.id)) continue;
    extra.push(
      makeSubscription({
        customerId: customer.id,
        packageId: customer.packageId,
        startDate: customer.activatedAt,
        endDate: customer.expiresAt,
        pricing: data.pricing,
        createdAt: customer.createdAt,
      }),
    );
  }

  if (extra.length === 0) return { data, changed: false };

  return {
    data: {
      ...data,
      subscriptions: [...data.subscriptions, ...extra],
    },
    changed: true,
  };
}

async function readFileJson(filePath: string): Promise<unknown> {
  try {
    const raw = await readFile(filePath, "utf8");
    return parseJson(raw);
  } catch {
    return null;
  }
}

async function writeFileJson(filePath: string, value: unknown) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function readRaw(): Promise<{ value: unknown; fromLegacy: boolean }> {
  if (activeBackend() === "upstash") {
    const crm = await redisCommand(["GET", CRM_REDIS_KEY]);
    if (typeof crm === "string" && crm) {
      return { value: parseJson(crm), fromLegacy: false };
    }

    const legacy = await redisCommand(["GET", LEGACY_REDIS_KEY]);
    if (typeof legacy === "string" && legacy) {
      return { value: parseJson(legacy), fromLegacy: true };
    }

    return { value: null, fromLegacy: false };
  }

  const crmFile = await readFileJson(CRM_FILE_PATH);
  if (crmFile != null) return { value: crmFile, fromLegacy: false };

  const legacyFile = await readFileJson(LEGACY_FILE_PATH);
  if (legacyFile != null) return { value: legacyFile, fromLegacy: true };

  return { value: null, fromLegacy: false };
}

async function persistCrm(data: CrmData) {
  const mode = customerStoreMode();
  if (!mode.persistent) {
    throw new Error(mode.warning ?? "Το storage δεν είναι persistent στο Vercel.");
  }

  if (activeBackend() === "upstash") {
    await redisCommand(["SET", CRM_REDIS_KEY, JSON.stringify(data)]);
    return;
  }

  await writeFileJson(CRM_FILE_PATH, data);
}

let writeChain: Promise<unknown> = Promise.resolve();

function enqueueWrite<T>(work: () => Promise<T>): Promise<T> {
  const next = writeChain.then(work, work);
  writeChain = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

export async function loadCrm(): Promise<CrmData> {
  const raw = await readRaw();
  const normalized = normalizeCrm(raw.value);
  const filled = backfillSubscriptions(normalized.data);
  const migrated = applyCrmMigrations(filled.data);
  const dirty = raw.fromLegacy || normalized.migrated || filled.changed || migrated.changed;

  if (dirty && customerStoreMode().persistent) {
    await persistCrm(migrated.data);
  }

  return migrated.data;
}

export async function mutateCrm<T>(mutator: (data: CrmData) => T | Promise<T>): Promise<T> {
  return enqueueWrite(async () => {
    const data = await loadCrm();
    const result = await mutator(data);
    await persistCrm(data);
    return result;
  });
}

export async function listCustomers() {
  const data = await loadCrm();
  return [...data.customers]
    .filter((customer) => !customer.archivedAt)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getCustomerByToken(token: string) {
  const data = await loadCrm();
  return data.customers.find((customer) => customer.token === token && !customer.archivedAt) ?? null;
}

export async function getCustomerById(id: string) {
  const data = await loadCrm();
  return data.customers.find((customer) => customer.id === id) ?? null;
}

export async function saveCustomer(customer: Customer) {
  return mutateCrm((data) => {
    const index = data.customers.findIndex((item) => item.id === customer.id);
    if (index >= 0) {
      data.customers[index] = customer;
    } else {
      data.customers.push(customer);
    }
    return customer;
  });
}

export async function deleteCustomer(id: string) {
  return mutateCrm((data) => {
    const before = data.customers.length;
    data.customers = data.customers.filter((customer) => customer.id !== id);
    data.subscriptions = data.subscriptions.filter((item) => item.customerId !== id);
    data.notes = data.notes.filter((note) => note.customerId !== id);
    return data.customers.length !== before;
  });
}

export async function tokenExists(token: string, ignoreId?: string) {
  const data = await loadCrm();
  return data.customers.some((customer) => customer.token === token && customer.id !== ignoreId);
}

export async function getPricingCatalog(): Promise<PackagePricing[]> {
  const data = await loadCrm();
  return data.pricing;
}

export async function replacePricing(pricing: PackagePricing[]) {
  return mutateCrm((data) => {
    data.pricing = ensurePricing(pricing);
    return data.pricing;
  });
}

export type { CustomerTag };
