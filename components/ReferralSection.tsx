"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Gift, Link2, MessageCircle, Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { referralProgram } from "@/data/content";
import { contactConfig } from "@/lib/contact";
import { cn } from "@/lib/cn";

function referralWhatsAppUrl(code?: string) {
  const message = code
    ? `Γεια! Ήρθα από referral code: ${code}. Θέλω να ενεργοποιήσω πακέτο GRVIP OTT.`
    : "Γεια! Είμαι ήδη πελάτης και θέλω να πάρω τον προσωπικό μου referral code για το πρόγραμμα φίλων.";
  return `${contactConfig.whatsapp}?text=${encodeURIComponent(message)}`;
}

function ReferralSectionContent() {
  const searchParams = useSearchParams();
  const incomingRef = searchParams.get("ref")?.trim().toUpperCase();
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (!incomingRef || typeof window === "undefined") return null;
    const url = new URL("/paketa", window.location.origin);
    url.searchParams.set("ref", incomingRef);
    return url.toString();
  }, [incomingRef]);

  const onCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section id="referral" className="relative py-12 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.06),transparent_55%)]" />
      <div className="container-premium relative z-10">
        <SectionHeading
          eyebrow={referralProgram.eyebrow}
          title={referralProgram.title}
          description={referralProgram.description}
        />

        <Reveal className="mx-auto mb-10 max-w-3xl">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-[#0B0B0B] p-6 text-center sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(52,211,153,0.12),transparent_60%)]" />
            <div className="relative">
              <Gift className="mx-auto mb-3 h-8 w-8 text-emerald-400" />
              <p className="font-display text-3xl font-black text-white sm:text-4xl">
                {referralProgram.reward}
              </p>
              <p className="mt-2 text-sm text-text-muted md:text-base">
                {referralProgram.rewardDetail}
              </p>
            </div>
          </div>
        </Reveal>

        <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
          {referralProgram.steps.map((step, i) => (
            <Reveal key={step.id} delay={i * 0.08}>
              <article className="relative h-full rounded-2xl border border-white/10 bg-[#0B0B0B] p-6">
                <span className="mb-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold/15 text-sm font-black text-gold">
                  {i + 1}
                </span>
                <h3 className="font-display text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">
                  {step.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>

        {incomingRef && shareUrl ? (
          <Reveal delay={0.2} className="mx-auto mt-10 max-w-3xl">
            <div className="rounded-2xl border border-white/10 bg-[#0B0B0B] p-5 sm:p-6">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Link2 className="h-4 w-4 text-gold" />
                Το link που μοιράζεσαι
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <code className="flex-1 truncate rounded-lg border border-white/10 bg-black/50 px-4 py-3 text-sm text-emerald-300">
                  {shareUrl}
                </code>
                <button
                  type="button"
                  onClick={onCopy}
                  className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition",
                    copied
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-white/15 bg-white/5 text-white hover:border-gold/40",
                  )}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Αντιγράφηκε" : "Αντιγραφή"}
                </button>
              </div>
              <p className="mt-3 text-sm text-emerald-300">
                Ενεργός referral κωδικός: <strong>{incomingRef}</strong>
              </p>
            </div>
          </Reveal>
        ) : (
          <Reveal delay={0.2} className="mx-auto mt-10 max-w-3xl">
            <p className="rounded-2xl border border-white/10 bg-[#0B0B0B] px-5 py-4 text-center text-sm text-text-muted sm:text-base">
              Μετά την αγορά θα λάβεις τον προσωπικό σου κωδικό και το link σου μέσω WhatsApp.
            </p>
          </Reveal>
        )}

        <Reveal delay={0.24} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button href={referralWhatsAppUrl()} className="font-extrabold">
            <MessageCircle className="h-4 w-4" />
            {referralProgram.ctaNew}
          </Button>
          <Button
            href={referralWhatsAppUrl(incomingRef || undefined)}
            variant="outline"
            className="font-extrabold"
          >
            <Share2 className="h-4 w-4" />
            {referralProgram.ctaExisting}
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

export function ReferralSection() {
  return (
    <Suspense fallback={null}>
      <ReferralSectionContent />
    </Suspense>
  );
}
