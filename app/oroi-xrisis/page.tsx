import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Όροι Χρήσης",
};

export default function OroiXrisisPage() {
  return (
    <>
      <PageHero title="Όροι Χρήσης" description="Τελευταία ενημέρωση: 2026" />
      <section className="container-premium prose-invert max-w-3xl space-y-6 pb-20 text-text-muted">
        <p>
          Καλώς ήρθατε στο GRVIP OTT. Χρησιμοποιώντας την ιστοσελίδα και τις
          υπηρεσίες μας, αποδέχεστε τους παρόντες όρους χρήσης.
        </p>
        <h2 className="font-display text-xl font-semibold text-white">
          1. Υπηρεσία
        </h2>
        <p>
          Το GRVIP OTT παρέχει πρόσβαση σε υπηρεσίες streaming σύμφωνα με το
          ενεργό πακέτο συνδρομής κάθε χρήστη.
        </p>
        <h2 className="font-display text-xl font-semibold text-white">
          2. Λογαριασμός
        </h2>
        <p>
          Ο χρήστης είναι υπεύθυνος για την ασφαλή φύλαξη των στοιχείων σύνδεσης
          και για κάθε δραστηριότητα που πραγματοποιείται μέσω του λογαριασμού
          του.
        </p>
        <h2 className="font-display text-xl font-semibold text-white">
          3. Αποδεκτή χρήση
        </h2>
        <p>
          Απαγορεύεται η μη εξουσιοδοτημένη κοινοποίηση, μεταπώληση ή κατάχρηση
          της υπηρεσίας. Διατηρούμε το δικαίωμα αναστολής σε περιπτώσεις
          παραβίασης.
        </p>
        <h2 className="font-display text-xl font-semibold text-white">
          4. Επικοινωνία
        </h2>
        <p>
          Για ερωτήσεις σχετικά με τους όρους, επικοινωνήστε μέσω της σελίδας
          Επικοινωνία.
        </p>
      </section>
    </>
  );
}
