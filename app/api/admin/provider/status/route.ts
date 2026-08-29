import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/customers/auth";
import { getProviderStatus } from "@/lib/iptv/client";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) return unauthorized();

  const status = await getProviderStatus();
  return NextResponse.json({
    connected: status.connected,
    credits: status.credits,
    label: status.label,
  });
}
