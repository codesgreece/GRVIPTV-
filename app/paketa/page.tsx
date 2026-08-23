import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { PricingSection } from "@/components/PricingSection";

export const metadata: Metadata = {
  title: "Πακέτα",
  description:
    "Επιλέξτε το ιδανικό πακέτο GRVIP OTT — 1, 3, 6 ή 12 μήνες με πλήρη πρόσβαση και προσφορές.",
};

export default function PaketaPage() {
  return (
    <>
      <PageHero
        eyebrow="Πακέτα"
        title="Επιλέξτε το Πακέτο Σας"
        description="Απλή τιμολόγηση, άμεση ενεργοποίηση και πλήρης πρόσβαση σε κανάλια, ταινίες και σειρές."
      />
      <PricingSection showHeading={false} />
    </>
  );
}
