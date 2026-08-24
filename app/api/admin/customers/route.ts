import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/customers/auth";
import { createCustomer, parseCustomerInput } from "@/lib/customers/service";
import { customerStoreMode, listCustomers } from "@/lib/customers/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const customers = await listCustomers();
  return NextResponse.json({
    customers,
    store: customerStoreMode(),
  });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  try {
    const input = parseCustomerInput(await request.json());
    const customer = await createCustomer(input);
    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Αποτυχία δημιουργίας.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
