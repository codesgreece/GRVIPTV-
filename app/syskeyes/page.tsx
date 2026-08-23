import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { DevicesSection } from "@/components/DevicesSection";

export const metadata: Metadata = {
  title: "Συσκευές",
  description:
    "Το GRVIP OTT λειτουργεί σε Smart TV, Android TV, Firestick, smartphones, tablets και υπολογιστές.",
};

export default function SyskeyesPage() {
  return (
    <>
      <PageHero
        eyebrow="Συσκευές"
        title="Παρακολουθήστε Σε Όλες Τις Συσκευές Σας"
        description="Επιλέξτε τη συσκευή σας και μεταβείτε απευθείας στον σχετικό οδηγό εγκατάστασης."
      />
      <DevicesSection />
    </>
  );
}
