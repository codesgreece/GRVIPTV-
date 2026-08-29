import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/customers/auth";
import { syncCustomerProvider } from "@/lib/customers/service";
import { ProviderApiError } from "@/lib/iptv/errors";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const { id } = await context.params;

  try {
    const customer = await syncCustomerProvider(id);
    if (!customer) return NextResponse.json({ error: "Δεν βρέθηκε." }, { status: 404 });
    return NextResponse.json({ customer });
  } catch (error) {
    if (error instanceof ProviderApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Αποτυχία συγχρονισμού.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
