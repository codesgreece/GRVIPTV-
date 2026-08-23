import Link from "next/link";
import {
  CheckCircle2,
  Flame,
  MessageCircle,
  Signal,
  Timer,
  Tv,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { contactConfig } from "@/lib/contact";

const infoCards = [
  {
    icon: CheckCircle2,
    title: "Θα χρειαστείτε",
    text: "Username · Password · από την υποστήριξη — χωρίς περίπλοκη ρύθμιση.",
  },
  {
    icon: Signal,
    title: "Ταχύτητα Internet",
    text: "8 Mbps+ για HD · 15 Mbps+ για FHD / UHD",
  },
  {
    icon: Flame,
    title: "Πιο Δημοφιλές",
    text: "Amazon Firestick — TiviMate — Xtream Codes",
  },
  {
    icon: MessageCircle,
    title: "Κολλήσατε; Υποστήριξη",
    text: "Σας καθοδηγούμε live μέσω chat σε λίγα λεπτά.",
  },
];

const stats = [
  { value: "9", label: "Συσκευές" },
  { value: "5 λεπτά", label: "Μέσος χρόνος setup" },
  { value: "24/7", label: "Live υποστήριξη" },
];

export function SetupPageHero() {
  return (
    <section className="relative overflow-hidden pt-24 md:pt-28">
      <div className="container-premium">
        <div className="grid overflow-hidden rounded-2xl border border-gold/20 lg:grid-cols-2">
          <div className="relative bg-[#0B0B0B] p-8 md:p-10 lg:p-12">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,167,44,0.12),transparent_55%)]" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-gold uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                Εύκολος Οδηγός Εγκατάστασης
              </span>

              <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
                Ρυθμίστε το GRVIP OTT{" "}
                <span className="text-gold-gradient">Βήμα προς Βήμα</span>
              </h1>

              <p className="mt-4 max-w-lg text-base leading-relaxed text-text-muted md:text-lg">
                Επιλέξτε τη συσκευή σας και θα σας δείξουμε ακριβώς τι να κάνετε —
                απλές οδηγίες για όλους, χωρίς τεχνικές γνώσεις.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="#wizard">Ξεκινήστε τον Οδηγό</Button>
                <Button href="/epikoinonia" variant="outline">
                  Ζωντανή Βοήθεια
                </Button>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-lg font-bold text-white md:text-xl">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[10px] tracking-[0.14em] text-text-dim uppercase md:text-xs">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative bg-gradient-to-br from-[#16100a] via-[#1a140c] to-[#0c0a08] p-6 md:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(30,95,168,0.18),transparent_55%)]" />
            <div className="relative grid gap-3">
              {infoCards.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/35 p-4 backdrop-blur-sm"
                >
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gold/25 bg-gold/10 text-gold">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-text-muted">
                      {text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-text-dim">
          <Tv className="h-4 w-4 text-gold" />
          <span>Χρειάζεστε συνδρομή;</span>
          <Link href="/paketa" className="text-gold hover:underline">
            Δείτε τα πακέτα
          </Link>
          <span>·</span>
          <a
            href={contactConfig.whatsapp}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-gold hover:underline"
          >
            <Timer className="h-3.5 w-3.5" />
            Υποστήριξη WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
