import {
  DEFAULT_CREDIT_RATES_WHOLE,
  PACKAGE_OPTIONS,
  type CreditRates,
  type PackageId,
  type Server,
  type ServerInput,
} from "@/lib/customers/types";
import { createCustomerId } from "@/lib/customers/token";
import { mutateCrm } from "@/lib/customers/store";
import { roundMoney } from "@/lib/customers/pricing";

export function normalizeCreditRates(input?: Partial<CreditRates> | null): CreditRates {
  const next = { ...DEFAULT_CREDIT_RATES_WHOLE };
  for (const option of PACKAGE_OPTIONS) {
    const value = Number(input?.[option.id]);
    next[option.id] = Number.isFinite(value) && value >= 0 ? roundMoney(value) : DEFAULT_CREDIT_RATES_WHOLE[option.id];
  }
  return next;
}

export function parseServerInput(body: unknown): ServerInput {
  const data = (body ?? {}) as Record<string, unknown>;
  const name = String(data.name ?? "").trim();
  const creditsRemaining = Number(data.creditsRemaining);
  const ratesRaw =
    data.creditRates && typeof data.creditRates === "object"
      ? (data.creditRates as Partial<CreditRates>)
      : {};

  if (name.length < 2 || name.length > 80) {
    throw new Error("Το όνομα server πρέπει να έχει 2-80 χαρακτήρες.");
  }
  if (!Number.isFinite(creditsRemaining) || creditsRemaining < 0) {
    throw new Error("Μη έγκυρο υπόλοιπο credits.");
  }

  return {
    name,
    creditsRemaining: roundMoney(creditsRemaining),
    creditRates: normalizeCreditRates(ratesRaw),
  };
}

export function creditCostForPackage(server: Server, packageId: PackageId) {
  const value = Number(server.creditRates[packageId] ?? 0);
  return Number.isFinite(value) && value > 0 ? roundMoney(value) : 0;
}

export function deductServerCredits(servers: Server[], serverId: string, packageId: PackageId) {
  const index = servers.findIndex((item) => item.id === serverId);
  if (index < 0) throw new Error("Επίλεξε έγκυρο server.");

  const server = servers[index];
  const cost = creditCostForPackage(server, packageId);
  if (cost > server.creditsRemaining + 1e-9) {
    throw new Error(
      `Ανεπαρκή credits στον «${server.name}». Χρειάζονται ${cost}, υπόλοιπο ${server.creditsRemaining}.`,
    );
  }

  servers[index] = {
    ...server,
    creditsRemaining: roundMoney(server.creditsRemaining - cost),
    updatedAt: new Date().toISOString(),
  };

  return { server: servers[index], cost };
}

export async function createServer(input: ServerInput) {
  const now = new Date().toISOString();
  const server: Server = {
    id: `srv-${createCustomerId()}`,
    name: input.name,
    creditsRemaining: input.creditsRemaining,
    creditRates: normalizeCreditRates(input.creditRates),
    createdAt: now,
    updatedAt: now,
  };

  return mutateCrm((data) => {
    data.servers.push(server);
    return server;
  });
}

export async function updateServer(id: string, input: ServerInput) {
  return mutateCrm((data) => {
    const index = data.servers.findIndex((item) => item.id === id);
    if (index < 0) return null;
    const server: Server = {
      ...data.servers[index],
      name: input.name,
      creditsRemaining: input.creditsRemaining,
      creditRates: normalizeCreditRates(input.creditRates),
      updatedAt: new Date().toISOString(),
    };
    data.servers[index] = server;
    return server;
  });
}

export async function removeServer(id: string) {
  return mutateCrm((data) => {
    const inUse = data.customers.some((customer) => customer.serverId === id && !customer.archivedAt);
    if (inUse) {
      throw new Error("Ο server χρησιμοποιείται από πελάτες και δεν μπορεί να διαγραφεί.");
    }
    const before = data.servers.length;
    data.servers = data.servers.filter((item) => item.id !== id);
    return data.servers.length !== before;
  });
}

export function normalizeServers(list: unknown): Server[] {
  if (!Array.isArray(list)) return [];
  return list.map((item) => {
    const raw = item as Partial<Server>;
    return {
      id: String(raw.id ?? `srv-${createCustomerId()}`),
      name: String(raw.name ?? "Server").trim() || "Server",
      creditsRemaining: roundMoney(Number(raw.creditsRemaining) || 0),
      creditRates: normalizeCreditRates(raw.creditRates),
      createdAt: String(raw.createdAt ?? new Date().toISOString()),
      updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
    };
  });
}
