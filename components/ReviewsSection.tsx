"use client";

import { useReducedMotion } from "framer-motion";
import { MessageCircle, Send, Star } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { customerReviews, reviewsSummary, type Review } from "@/data/reviews";
import { cn } from "@/lib/cn";

const platformStyles = {
  WhatsApp: {
    label: "WhatsApp",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  },
  Telegram: {
    label: "Telegram",
    className: "border-sky-400/30 bg-sky-500/10 text-sky-300",
  },
  Messenger: {
    label: "Messenger",
    className: "border-indigo-400/30 bg-indigo-500/10 text-indigo-300",
  },
  Viber: {
    label: "Viber",
    className: "border-violet-400/30 bg-violet-500/10 text-violet-300",
  },
} as const;

function Stars({ rating }: { rating: Review["rating"] }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  return (
    <div className="flex items-center gap-1" aria-label={`${rating} από 5 αστέρια`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < fullStars
              ? "fill-gold text-gold"
              : i === fullStars && hasHalf
                ? "fill-gold/60 text-gold"
                : "fill-white/10 text-white/15",
          )}
        />
      ))}
      <span className="ml-1 text-xs font-bold text-gold">{rating.toFixed(1)}</span>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const platform = platformStyles[review.platform];

  return (
    <article className="w-[300px] shrink-0 rounded-2xl border border-white/10 bg-[#0A0A0A] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.35)] sm:w-[320px]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <Stars rating={review.rating} />
        <span
          className={cn(
            "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide uppercase",
            platform.className,
          )}
        >
          {platform.label}
        </span>
      </div>
      <p className="min-h-[72px] text-sm leading-relaxed text-text-muted">
        «{review.comment}»
      </p>
      <div className="mt-4 flex items-center gap-2 border-t border-white/8 pt-4">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gold/12 text-xs font-black text-gold">
          {review.name.charAt(0)}
        </span>
        <p className="text-sm font-semibold text-white">{review.name}</p>
      </div>
    </article>
  );
}

function MarqueeRow({
  reviews,
  reverse = false,
}: {
  reviews: Review[];
  reverse?: boolean;
}) {
  const reduce = useReducedMotion();
  const loop = [...reviews, ...reviews];

  if (reduce) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {reviews.slice(0, 8).map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    );
  }

  return (
    <div className="marquee-mask relative overflow-hidden">
      <div
        className={cn(
          "flex w-max gap-4 py-1",
          reverse ? "animate-marquee-reverse" : "animate-marquee",
        )}
      >
        {loop.map((review, index) => (
          <ReviewCard key={`${review.id}-${index}`} review={review} />
        ))}
      </div>
    </div>
  );
}

export function ReviewsSection() {
  const rowA = customerReviews.filter((_, i) => i % 2 === 0);
  const rowB = customerReviews.filter((_, i) => i % 2 === 1);

  return (
    <section id="reviews" className="section-noise relative overflow-hidden py-14 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,167,44,0.07),transparent_55%)]" />

      <div className="container-premium relative z-10">
        <SectionHeading
          eyebrow="Κριτικές Πελατών"
          title="Τι Λένε οι Πελάτες μας"
          description="Πραγματικές εμπειρίες από πελάτες που επικοινώνησαν μαζί μας μέσω WhatsApp, Telegram, Messenger και Viber."
        />

        <Reveal className="mx-auto mb-10 flex max-w-3xl flex-col items-center justify-center gap-4 rounded-2xl border border-gold/25 bg-[#0A0A0A] px-6 py-5 sm:flex-row sm:gap-10">
          <div className="text-center sm:text-left">
            <p className="font-display text-5xl font-black text-white">
              {reviewsSummary.average.toFixed(1)}
              <span className="text-gold">/5</span>
            </p>
            <div className="mt-2 flex justify-center sm:justify-start">
              <Stars rating={5} />
            </div>
          </div>
          <div className="hidden h-12 w-px bg-white/10 sm:block" />
          <div className="text-center sm:text-left">
            <p className="font-display text-3xl font-black text-white">
              {reviewsSummary.total}+
            </p>
            <p className="mt-1 text-sm text-text-muted">κριτικές πελατών</p>
          </div>
          <div className="hidden h-12 w-px bg-white/10 sm:block" />
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <MessageCircle className="h-4 w-4 text-gold" />
            <Send className="h-4 w-4 text-gold" />
            <span>WhatsApp · Telegram · Messenger · Viber</span>
          </div>
        </Reveal>

        <div className="space-y-4">
          <MarqueeRow reviews={rowA} />
          <MarqueeRow reviews={rowB} reverse />
        </div>
      </div>
    </section>
  );
}
