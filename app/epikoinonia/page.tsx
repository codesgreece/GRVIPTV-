"use client";

import { FormEvent, useState } from "react";
import { Mail, Send } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Button } from "@/components/ui/Button";
import { contactConfig } from "@/lib/contact";

export default function EpikoinoniaPage() {
  const [sent, setSent] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <>
      <PageHero
        title="Επικοινωνία"
        description="Στείλτε μας μήνυμα και η ομάδα υποστήριξης θα σας απαντήσει το συντομότερο δυνατό."
      />

      <section className="container-premium grid gap-8 pb-20 lg:grid-cols-[1.1fr_0.9fr]">
        <form
          onSubmit={onSubmit}
          className="glass-card space-y-4 rounded-2xl p-6 md:p-8"
        >
          <div>
            <label htmlFor="name" className="mb-2 block text-sm text-text-muted">
              Όνομα
            </label>
            <input
              id="name"
              name="name"
              required
              className="w-full rounded-lg border border-white/10 bg-[#050505] px-4 py-3 text-white outline-none transition focus:border-gold/50"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-text-muted">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-white/10 bg-[#050505] px-4 py-3 text-white outline-none transition focus:border-gold/50"
            />
          </div>
          <div>
            <label htmlFor="subject" className="mb-2 block text-sm text-text-muted">
              Θέμα
            </label>
            <input
              id="subject"
              name="subject"
              required
              className="w-full rounded-lg border border-white/10 bg-[#050505] px-4 py-3 text-white outline-none transition focus:border-gold/50"
            />
          </div>
          <div>
            <label htmlFor="message" className="mb-2 block text-sm text-text-muted">
              Μήνυμα
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={5}
              className="w-full resize-y rounded-lg border border-white/10 bg-[#050505] px-4 py-3 text-white outline-none transition focus:border-gold/50"
            />
          </div>
          <Button type="submit" fullWidth>
            Αποστολή Μηνύματος
          </Button>
          {sent ? (
            <p className="text-sm text-gold">
              Το μήνυμά σας καταχωρήθηκε τοπικά (placeholder). Συνδέστε backend
              για πραγματική αποστολή.
            </p>
          ) : null}
        </form>

        <aside className="space-y-4">
          <SupportCard
            icon={Mail}
            title="Email"
            value={contactConfig.email}
            href={`mailto:${contactConfig.email}`}
          />
          <SupportCard
            icon={Send}
            title="Telegram"
            value={contactConfig.phone}
            href={contactConfig.telegram}
          />
          <div className="rounded-2xl border border-gold/20 bg-gold/[0.05] p-5 text-sm text-text-muted">
            Για άμεση εξυπηρέτηση, επικοινωνήστε μαζί μας στο Telegram.
          </div>
        </aside>
      </section>
    </>
  );
}

function SupportCard({
  icon: Icon,
  title,
  value,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="glass-card flex items-center gap-4 rounded-2xl p-5 transition hover:border-gold/40"
    >
      <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-gold/25 bg-gold/10 text-gold">
        <Icon className="h-5 w-5" />
      </span>
      <span>
        <span className="block text-sm text-text-dim">{title}</span>
        <span className="font-medium text-white">{value}</span>
      </span>
    </a>
  );
}
