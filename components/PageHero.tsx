import { cn } from "@/lib/cn";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function PageHero({
  eyebrow,
  title,
  description,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "section-noise relative overflow-hidden pt-28 pb-12 md:pt-32 md:pb-16",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 h-64 w-[480px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,167,44,0.14),transparent_70%)]" />
      </div>
      <div className="container-premium relative z-10 max-w-3xl">
        {eyebrow ? (
          <p className="mb-3 text-xs font-semibold tracking-[0.22em] text-gold uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-3xl font-bold tracking-tight text-white md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-4 text-base leading-relaxed text-text-muted md:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
