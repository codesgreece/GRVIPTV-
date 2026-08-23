import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Πολιτική Επιστροφών",
};

export default function PolitikiEpistrofonPage() {
  return (
    <>
      <PageHero
        title="Πολιτική Επιστροφών"
        description="Πληροφορίες σχετικά με ακυρώσεις και αιτήματα επιστροφής."
      />
      <section className="container-premium max-w-3xl space-y-6 pb-20 text-text-muted">
        <p>
          Η πολιτική επιστροφών μπορεί να διαφέρει ανάλογα με το πακέτο και την
          κατάσταση ενεργοποίησης της υπηρεσίας.
        </p>
        <p>
          Για οποιοδήποτε αίτημα, επικοινωνήστε με την υποστήριξη το συντομότερο
          δυνατό και περιγράψτε το ζήτημα με λεπτομέρεια.
        </p>
        <p>
          Ενημερώστε αυτό το κείμενο με τους τελικούς εμπορικούς όρους της
          επιχείρησής σας πριν από την παραγωγική δημοσίευση.
        </p>
      </section>
    </>
  );
}
