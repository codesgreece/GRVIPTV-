import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/customers/auth";
import { renewCustomer } from "@/lib/customers/service";
import { CUSTOMER_PACKAGES, type PackageId } from "@/lib/customers/types";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const { id } = await context.params;

  try {
    const body = (await request.json()) as { packageId?: string };
    const packageId = String(body.packageId ?? "").trim() as PackageId;

    if (!CUSTOMER_PACKAGES.some((item) => item.id === packageId)) {
      return NextResponse.json({ error: "Μη έγκυρο πακέτο." }, { status: 400 });
    }

    const result = await renewCustomer(id, packageId);
    if (!result) return NextResponse.json({ error: "Δεν βρέθηκε." }, { status: 404 });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Αποτυχία ανανέωσης.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
