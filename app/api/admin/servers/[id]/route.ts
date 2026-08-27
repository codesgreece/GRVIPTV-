import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/customers/auth";
import { parseServerInput, removeServer, updateServer } from "@/lib/customers/servers";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { id } = await context.params;

  try {
    const input = parseServerInput(await request.json());
    const server = await updateServer(id, input);
    if (!server) return NextResponse.json({ error: "Δεν βρέθηκε." }, { status: 404 });
    return NextResponse.json({ server });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Αποτυχία ενημέρωσης.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { id } = await context.params;

  try {
    const ok = await removeServer(id);
    if (!ok) return NextResponse.json({ error: "Δεν βρέθηκε." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Αποτυχία διαγραφής.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
