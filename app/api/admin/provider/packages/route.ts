import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/customers/auth";
import { getProviderPackages } from "@/lib/iptv/client";
import { ProviderApiError } from "@/lib/iptv/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();

  try {
    const packages = await getProviderPackages();
    return NextResponse.json({ packages });
  } catch (error) {
    if (error instanceof ProviderApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Αποτυχία φόρτωσης πακέτων provider." }, { status: 500 });
  }
}
