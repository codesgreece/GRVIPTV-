import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { FAQSection } from "@/components/FAQSection";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Συχνές ερωτήσεις για το GRVIP OTT, ενεργοποίηση, συσκευές και υποστήριξη.",
};

export default function FaqPage() {
  return (
    <>
      <PageHero
        title="Συχνές Ερωτήσεις"
        description="Βρείτε γρήγορες απαντήσεις για την υπηρεσία, τις συσκευές και την υποστήριξη."
      />
      <FAQSection showHeading={false} />
    </>
  );
}
