import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { contactConfig } from "@/lib/contact";

export function SetupSupportBlocks() {
  return (
    <section className="pb-20">
      <div className="container-premium grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-gold/25 bg-gradient-to-br from-[#16100a] to-[#0B0B0B] p-7">
          <h2 className="font-display text-2xl font-bold text-white">
            Δεν έχετε συνδρομή ακόμη;
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-muted md:text-base">
            Αποκτήστε GRVIP OTT — 24.000+ κανάλια, 120.000+ ταινίες & σειρές, Full
            HD / 4K ποιότητα. Άμεση ενεργοποίηση.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button href="/paketa" className="tracking-[0.08em] uppercase">
              Δείτε τα Πακέτα
            </Button>
            <Button
              href="/epikoinonia"
              variant="outline"
              className="tracking-[0.08em] uppercase"
            >
              Επικοινωνία
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#0B0B0B] p-7">
          <h2 className="font-display text-2xl font-bold text-white">
            Χρειάζεστε Περισσότερη Βοήθεια;
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-muted md:text-base">
            Η ομάδα υποστήριξης είναι διαθέσιμη 24/7. Στείλτε μήνυμα και θα σας
            βοηθήσουμε γρήγορα με το setup.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={contactConfig.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-[#D4A72C] to-[#F2C75C] px-5 py-3 text-sm font-semibold text-black"
            >
              <MessageCircle className="h-4 w-4" />
              Chat στο WhatsApp
            </a>
            <Link
              href="/epikoinonia"
              className="inline-flex items-center justify-center rounded-md border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-gold/40"
            >
              Κέντρο Υποστήριξης
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
