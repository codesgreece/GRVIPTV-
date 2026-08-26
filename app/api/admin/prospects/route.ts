import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/customers/auth";
import { createProspect, parseProspectInput } from "@/lib/customers/service";
import { loadCrm } from "@/lib/customers/store";

export const dynamic = "force-dynamic";

function sortedProspects(prospects: Awaited<ReturnType<typeof loadCrm>>["prospects"]) {
  return [...prospects].sort((a, b) => {
    const byDate = a.contactAt.localeCompare(b.contactAt);
    if (byDate !== 0) return byDate;
    return a.name.localeCompare(b.name, "el");
  });
}

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const data = await loadCrm();
  return NextResponse.json({ prospects: sortedProspects(data.prospects) });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  try {
    const input = parseProspectInput(await request.json());
    const prospect = await createProspect(input);
    return NextResponse.json({ prospect }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Αποτυχία δημιουργίας.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
