import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/customers/auth";
import {
  parseCustomerInput,
  regenerateCustomerToken,
  removeCustomer,
  setCustomerTags,
  updateCustomer,
} from "@/lib/customers/service";
import { loadCrm } from "@/lib/customers/store";
import { toCustomerView } from "@/lib/customers/views";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const { id } = await context.params;

  try {
    const body = await request.json();
    if (body && typeof body === "object" && Array.isArray((body as { tagIds?: unknown }).tagIds)) {
      const customer = await setCustomerTags(id, (body as { tagIds: string[] }).tagIds);
      if (!customer) return NextResponse.json({ error: "Δεν βρέθηκε." }, { status: 404 });
      return NextResponse.json({ customer });
    }

    const input = parseCustomerInput(body);
    const customer = await updateCustomer(id, input);
    if (!customer) return NextResponse.json({ error: "Δεν βρέθηκε." }, { status: 404 });
    const data = await loadCrm();
    return NextResponse.json({ customer: toCustomerView(customer, data) });
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
  const data = await loadCrm();
  return NextResponse.json({ customer: toCustomerView(customer, data) });
}
