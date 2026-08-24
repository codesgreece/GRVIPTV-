import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { BecomeResellerSection } from "@/components/BecomeResellerSection";
import { GuaranteeStrip } from "@/components/GuaranteeStrip";
import { LiveOrderLineSection, LivePricingSection } from "@/components/LiveCatalogSections";
import { ReferralSection } from "@/components/ReferralSection";
import { ResellersSection } from "@/components/ResellersSection";

export const metadata: Metadata = {
  title: "Πακέτα",
  description:
    "Επιλέξτε το ιδανικό πακέτο GRVIP OTT — 1, 3, 6 ή 12 μήνες με πλήρη πρόσβαση και προσφορές.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function PaketaPage() {
  return (
    <>
      <PageHero
        eyebrow="Πακέτα"
        title="Επιλέξτε το Πακέτο Σας"
        description="Απλή τιμολόγηση, άμεση ενεργοποίηση και πλήρης πρόσβαση σε κανάλια, ταινίες και σειρές."
      />
      <LivePricingSection showHeading={false} />
      <LiveOrderLineSection />
      <ResellersSection />
      <BecomeResellerSection />
      <ReferralSection />
      <GuaranteeStrip />
    </>
  );
}
