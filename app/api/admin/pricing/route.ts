import { NextResponse } from "next/server";
import { isAdminAuthenticated, unauthorized } from "@/lib/customers/auth";
import { parsePricingPayload, validatePricingUpdate } from "@/lib/customers/pricing";
import { replacePricing } from "@/lib/customers/store";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) return unauthorized();

  try {
    const pricing = parsePricingPayload(await request.json());

    for (const pkg of pricing) {
      const check = validatePricingUpdate(pkg);
      if (!check.ok) {
        return NextResponse.json(
          { error: `${pkg.packageName}: ${check.message}`, packageId: pkg.packageId },
          { status: 400 },
        );
      }
    }

    const saved = await replacePricing(pricing);
    return NextResponse.json({ pricing: saved });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Αποτυχία αποθήκευσης τιμών.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
