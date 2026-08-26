import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/customers/auth";
import { parseProspectInput, removeProspect, updateProspect } from "@/lib/customers/service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  try {
    const { id } = await context.params;
    const input = parseProspectInput(await request.json());
    const prospect = await updateProspect(id, input);
    if (!prospect) {
      return NextResponse.json({ error: "Δεν βρέθηκε ο πιθανός πελάτης." }, { status: 404 });
    }
    return NextResponse.json({ prospect });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Αποτυχία ενημέρωσης.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const { id } = await context.params;
  const deleted = await removeProspect(id);
  if (!deleted) {
    return NextResponse.json({ error: "Δεν βρέθηκε ο πιθανός πελάτης." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
