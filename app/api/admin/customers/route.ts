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

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const data = await loadCrm();
  const customers = buildCustomerViews(data);
  const dashboard = buildDashboard(data, customers);

  return NextResponse.json({
    customers,
    dashboard,
    notifications: buildNotifications(customers),
    pricing: data.pricing,
    tags: data.tags,
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
    const message = error instanceof Error ? error.message : "Αποτυχία δημιουργίας.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
