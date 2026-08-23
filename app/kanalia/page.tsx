import type { Metadata } from "next";
import { Clapperboard, Film, Globe2, Music2, Newspaper, Sparkles, Trophy, Baby } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { channelCategories } from "@/data/content";

export const metadata: Metadata = {
  title: "Κανάλια",
  description:
    "Εξερευνήστε κατηγορίες περιεχομένου GRVIP OTT: ελληνικά, αθλητικά, ταινίες, σειρές και πολλά ακόμη.",
};

const icons = [
  Clapperboard,
  Trophy,
  Film,
  Sparkles,
  Baby,
  Globe2,
  Newspaper,
  Music2,
];

export default function KanaliaPage() {
  return (
    <>
      <PageHero
        title="Ο Κόσμος Της Ψυχαγωγίας Σε Ένα Μέρος"
        description="Ανακαλύψτε κατηγορίες περιεχομένου για κάθε διάθεση. Οι κάρτες είναι ενδεικτικές κατηγορίες και όχι ισχυρισμοί συγκεκριμένων δικαιωμάτων μετάδοσης."
      />
      <section className="container-premium pb-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {channelCategories.map((category, index) => {
            const Icon = icons[index % icons.length];
            return (
              <article
                key={category.id}
                className="glass-card group rounded-2xl p-6 transition hover:-translate-y-1 hover:border-gold/40"
              >
                <Icon className="mb-4 h-7 w-7 text-gold" />
                <h2 className="font-display text-xl font-semibold text-white">
                  {category.title}
                </h2>
                <p className="mt-2 text-sm text-text-muted">
                  {category.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
