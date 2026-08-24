import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/customers/auth";
import { createCustomer, parseCustomerInput } from "@/lib/customers/service";
import { customerStoreMode, loadCrm } from "@/lib/customers/store";
import { buildCustomerViews, buildDashboard, toCustomerView } from "@/lib/customers/views";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const data = await loadCrm();
  const customers = buildCustomerViews(data);

  return NextResponse.json({
    customers,
    dashboard: buildDashboard(data, customers),
    pricing: data.pricing,
    store: customerStoreMode(),
  });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  try {
    const input = parseCustomerInput(await request.json());
    const customer = await createCustomer(input);
    const data = await loadCrm();
    return NextResponse.json(
      { customer: toCustomerView(customer, data.subscriptions) },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Αποτυχία δημιουργίας.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
