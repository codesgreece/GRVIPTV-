import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Customer } from "@/lib/customers/types";

const REDIS_KEY = "grvip:customers";
const FILE_PATH = path.join(process.cwd(), "data", ".customers.json");

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

async function readFromFile(): Promise<Customer[]> {
  try {
    const raw = await readFile(FILE_PATH, "utf8");
    const parsed = JSON.parse(raw) as Customer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeToFile(customers: Customer[]) {
  await mkdir(path.dirname(FILE_PATH), { recursive: true });
  await writeFile(FILE_PATH, `${JSON.stringify(customers, null, 2)}\n`, "utf8");
}

async function readAll(): Promise<Customer[]> {
  if (activeBackend() === "upstash") {
    const result = await redisCommand(["GET", REDIS_KEY]);
    if (!result || typeof result !== "string") return [];
    try {
      const parsed = JSON.parse(result) as Customer[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return readFromFile();
}

async function writeAll(customers: Customer[]) {
  const mode = customerStoreMode();
  if (!mode.persistent) {
    throw new Error(mode.warning ?? "Το storage δεν είναι persistent στο Vercel.");
  }

  if (activeBackend() === "upstash") {
    await redisCommand(["SET", REDIS_KEY, JSON.stringify(customers)]);
    return;
  }

  await writeToFile(customers);
}

export async function listCustomers() {
  const customers = await readAll();
  return [...customers].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getCustomerByToken(token: string) {
  const customers = await readAll();
  return customers.find((customer) => customer.token === token) ?? null;
}

export async function getCustomerById(id: string) {
  const customers = await readAll();
  return customers.find((customer) => customer.id === id) ?? null;
}

export async function saveCustomer(customer: Customer) {
  const customers = await readAll();
  const index = customers.findIndex((item) => item.id === customer.id);
  if (index >= 0) {
    customers[index] = customer;
  } else {
    customers.push(customer);
  }
  await writeAll(customers);
  return customer;
}

export async function deleteCustomer(id: string) {
  const customers = await readAll();
  const next = customers.filter((customer) => customer.id !== id);
  if (next.length === customers.length) return false;
  await writeAll(next);
  return true;
}

export async function tokenExists(token: string, ignoreId?: string) {
  const customers = await readAll();
  return customers.some((customer) => customer.token === token && customer.id !== ignoreId);
}
