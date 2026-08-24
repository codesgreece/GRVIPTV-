import { NextResponse } from "next/server";
import { defaultPublicPricing, toPublicPricing } from "@/lib/customers/pricing";
import { getPricingCatalog } from "@/lib/customers/store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const pricing = await getPricingCatalog();
    return NextResponse.json(
      { pricing: toPublicPricing(pricing) },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { pricing: defaultPublicPricing() },
      { headers: { "Cache-Control": "no-store" } },
    );
  }
}
