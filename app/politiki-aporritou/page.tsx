import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Πολιτική Απορρήτου",
};

export default function PolitikiAporritouPage() {
  return (
    <>
      <PageHero
        title="Πολιτική Απορρήτου"
        description="Πώς συλλέγουμε και προστατεύουμε τα δεδομένα σας."
      />
      <section className="container-premium max-w-3xl space-y-6 pb-20 text-text-muted">
        <p>
          Στο GRVIP OTT σεβόμαστε την ιδιωτικότητά σας. Η παρούσα πολιτική
          περιγράφει τι δεδομένα ενδέχεται να συλλέγονται και για ποιον σκοπό.
        </p>
        <h2 className="font-display text-xl font-semibold text-white">
          Δεδομένα επικοινωνίας
        </h2>
        <p>
          Όταν συμπληρώνετε φόρμα επικοινωνίας, συλλέγουμε τα στοιχεία που μας
          παρέχετε (όνομα, email, μήνυμα) για να απαντήσουμε στο αίτημά σας.
        </p>
        <h2 className="font-display text-xl font-semibold text-white">
          Cookies & analytics
        </h2>
        <p>
          Ενδέχεται να χρησιμοποιούνται βασικά τεχνικά cookies για τη σωστή
          λειτουργία του site. Μπορείτε να ενημερώσετε αυτή την ενότητα όταν
          ενεργοποιήσετε analytics.
        </p>
        <h2 className="font-display text-xl font-semibold text-white">
          Δικαιώματα
        </h2>
        <p>
          Μπορείτε να ζητήσετε ενημέρωση ή διαγραφή των δεδομένων επικοινωνίας
          σας μέσω της σελίδας Επικοινωνία.
        </p>
      </section>
    </>
  );
}
