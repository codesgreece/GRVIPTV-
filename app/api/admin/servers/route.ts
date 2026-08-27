import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/customers/auth";
import { createServer, parseServerInput } from "@/lib/customers/servers";
import { loadCrm } from "@/lib/customers/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();
  const data = await loadCrm();
  return NextResponse.json({
    servers: [...data.servers].sort((a, b) => a.name.localeCompare(b.name, "el")),
  });
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  try {
    const input = parseServerInput(await request.json());
    const server = await createServer(input);
    return NextResponse.json({ server }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Αποτυχία δημιουργίας server.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
