import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/customers/auth";
import { parseCustomerInput, regenerateCustomerToken, removeCustomer, updateCustomer } from "@/lib/customers/service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const { id } = await context.params;

  try {
    const input = parseCustomerInput(await request.json());
    const customer = await updateCustomer(id, input);
    if (!customer) return NextResponse.json({ error: "Δεν βρέθηκε." }, { status: 404 });
    return NextResponse.json({ customer });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Αποτυχία ενημέρωσης.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const { id } = await context.params;
  const deleted = await removeCustomer(id);
  if (!deleted) return NextResponse.json({ error: "Δεν βρέθηκε." }, { status: 404 });
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const { id } = await context.params;
  const url = new URL(request.url);

  if (url.searchParams.get("action") !== "regenerate") {
    return NextResponse.json({ error: "Μη έγκυρη ενέργεια." }, { status: 400 });
  }

  const customer = await regenerateCustomerToken(id);
  if (!customer) return NextResponse.json({ error: "Δεν βρέθηκε." }, { status: 404 });
  return NextResponse.json({ customer });
}
