import { type Server, type ServerInput } from "@/lib/customers/types";
import { createCustomerId } from "@/lib/customers/token";
import { mutateCrm } from "@/lib/customers/store";

export function parseServerInput(body: unknown): ServerInput {
  const data = (body ?? {}) as Record<string, unknown>;
  const name = String(data.name ?? "").trim();

  if (name.length < 2 || name.length > 80) {
    throw new Error("Το όνομα server πρέπει να έχει 2-80 χαρακτήρες.");
  }

  return { name };
}

export async function createServer(input: ServerInput) {
  const now = new Date().toISOString();
  const server: Server = {
    id: `srv-${createCustomerId()}`,
    name: input.name,
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
      createdAt: String(raw.createdAt ?? new Date().toISOString()),
      updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
    };
  });
}
