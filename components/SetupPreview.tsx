"use client";

import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { apps } from "@/data/content";

const steps = [
  {
    title: "Επιλέξτε το Πακέτο σας",
    description:
      "Διαλέξτε το πακέτο που ταιριάζει στις ανάγκες σας και ολοκληρώστε την αγορά σας.",
  },
  {
    title: "Λάβετε τα Στοιχεία σας",
    description:
      "Θα λάβετε άμεσα τα στοιχεία σύνδεσης και τις απαραίτητες οδηγίες.",
  },
  {
    title: "Απολαύστε το Περιεχόμενο",
    description:
      "Προσθέστε τα στοιχεία στην εφαρμογή σας και ξεκινήστε αμέσως.",
  },
];

export function SetupPreview() {
  return (
    <section className="relative py-16 md:py-24">
      <div className="container-premium grid items-start gap-12 lg:grid-cols-2">
        <Reveal>
          <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-gold uppercase">
            Οδηγός Εγκατάστασης
          </p>
          <h2 className="font-display text-3xl font-bold text-white md:text-4xl">
            Ξεκινήστε σε 3 Απλά Βήματα
          </h2>

          <ol className="relative mt-10 space-y-8 border-l border-gold/25 pl-6">
            {steps.map((step, index) => (
              <li key={step.title} className="relative">
                <span className="absolute top-0 -left-[1.9rem] flex h-7 w-7 items-center justify-center rounded-full border border-gold/40 bg-[#111] text-xs font-bold text-gold">
                  {index + 1}
                </span>
                <h3 className="font-display text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>

          <Button
            href="/odigos-egkatastasis"
            className="mt-8 tracking-[0.1em] uppercase"
          >
            Δείτε τον Αναλυτικό Οδηγό
          </Button>
        </Reveal>

        <Reveal delay={0.12}>
          <div className="glass-card rounded-2xl p-6 md:p-8">
            <h3 className="font-display text-2xl font-semibold text-white">
              Δημοφιλείς Εφαρμογές Που Υποστηρίζουμε
            </h3>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {apps.map((app) => (
                <div
                  key={app.id}
                  className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 transition hover:border-gold/35"
                >
                  <p className="text-sm font-semibold text-white">{app.name}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-text-muted">
              Χρειάζεστε βοήθεια; Δείτε τον αναλυτικό οδηγό εγκατάστασης.
            </p>
            <Button
              href="/odigos-egkatastasis"
              variant="outline"
              className="mt-4 tracking-[0.1em] uppercase"
            >
              Ανοίξτε τον Οδηγό
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
