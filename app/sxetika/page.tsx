import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Σχετικά με Εμάς",
};

export default function SxetikaPage() {
  return (
    <>
      <PageHero
        title="Σχετικά με το GRVIP OTT"
        description="Premium streaming εμπειρία με έμφαση στην ποιότητα, τη σταθερότητα και την υποστήριξη."
      />
      <section className="container-premium max-w-3xl space-y-6 pb-20 text-text-muted">
        <p>
          Το GRVIP OTT δημιουργήθηκε για χρήστες που θέλουν μία καθαρή, γρήγορη
          και πολυτελή εμπειρία ψυχαγωγίας — από ζωντανά κανάλια έως ταινίες και
          σειρές, σε πλήθος συσκευών.
        </p>
        <p>
          Εστιάζουμε σε απλή εγκατάσταση, άμεση ενεργοποίηση και συνεχή
          υποστήριξη, ώστε να απολαμβάνετε το περιεχόμενο χωρίς περιττή
          πολυπλοκότητα.
        </p>
        <Button href="/paketa">
          Δείτε τα Πακέτα
        </Button>
      </section>
    </>
  );
}
