import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/customers/auth";
import { createTag } from "@/lib/customers/service";
import { loadCrm } from "@/lib/customers/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const data = await loadCrm();
  return NextResponse.json({ tags: data.tags });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  try {
    const body = (await request.json()) as { name?: string; emoji?: string };
    const tag = await createTag({
      name: String(body.name ?? ""),
      emoji: String(body.emoji ?? "🏷️"),
    });
    return NextResponse.json({ tag }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Αποτυχία δημιουργίας tag.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
