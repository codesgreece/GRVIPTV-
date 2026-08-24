import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/customers/auth";
import {
  addCustomerNote,
  deleteCustomerNote,
  updateCustomerNote,
} from "@/lib/customers/service";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { id } = await context.params;

  try {
    const body = (await request.json()) as { content?: string };
    const note = await addCustomerNote(id, String(body.content ?? ""));
    if (!note) return NextResponse.json({ error: "Δεν βρέθηκε." }, { status: 404 });
    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Αποτυχία δημιουργίας σημείωσης.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { id } = await context.params;

  try {
    const body = (await request.json()) as { noteId?: string; content?: string };
    const noteId = String(body.noteId ?? "").trim() || id;
    const note = await updateCustomerNote(noteId, String(body.content ?? ""));
    if (!note) return NextResponse.json({ error: "Δεν βρέθηκε." }, { status: 404 });
    return NextResponse.json({ note });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Αποτυχία ενημέρωσης σημείωσης.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const { id } = await context.params;
  const url = new URL(request.url);
  const noteId = url.searchParams.get("noteId")?.trim() || id;
  const deleted = await deleteCustomerNote(noteId);
  if (!deleted) return NextResponse.json({ error: "Δεν βρέθηκε." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
