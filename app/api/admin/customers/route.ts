import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/customers/auth";
import { createCustomer, parseCustomerInput } from "@/lib/customers/service";
import { customerStoreMode, loadCrm } from "@/lib/customers/store";
import {
  buildCustomerViews,
  buildDashboard,
  buildNotifications,
  toCustomerView,
} from "@/lib/customers/views";
import { getProviderStatus } from "@/lib/iptv/client";
import { ProviderApiError } from "@/lib/iptv/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const data = await loadCrm();
  const customers = buildCustomerViews(data);
  const provider = await getProviderStatus();
  const dashboard = {
    ...buildDashboard(data, customers),
    providerConnected: provider.connected,
    providerCredits: provider.credits,
    providerStatusLabel: provider.connected ? "Connected" : "Offline",
  };

  return NextResponse.json({
    customers,
    dashboard,
    notifications: buildNotifications(customers),
    pricing: data.pricing,
    tags: data.tags,
    prospects: [...data.prospects].sort((a, b) => {
      const byDate = a.contactAt.localeCompare(b.contactAt);
      if (byDate !== 0) return byDate;
      return a.name.localeCompare(b.name, "el");
    }),
    store: customerStoreMode(),
  });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  try {
    const input = parseCustomerInput(await request.json());
    const customer = await createCustomer(input);
    const data = await loadCrm();
    return NextResponse.json({ customer: toCustomerView(customer, data) }, { status: 201 });
  } catch (error) {
    if (error instanceof ProviderApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Αποτυχία δημιουργίας.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
