"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Link2,
  LifeBuoy,
  MonitorSmartphone,
} from "lucide-react";
import {
  getWizardInstructions,
  wizardApps,
  wizardDevices,
  wizardMethods,
  type WizardChoice,
} from "@/data/setup-wizard";
import { contactConfig } from "@/lib/contact";
import { cn } from "@/lib/cn";

const STEPS = [
  { id: 1, label: "Συσκευή" },
  { id: 2, label: "Εφαρμογή" },
  { id: 3, label: "Μέθοδος" },
  { id: 4, label: "Βήματα" },
] as const;

type Selection = {
  device: WizardChoice | null;
  app: WizardChoice | null;
  method: WizardChoice | null;
};

export function SetupWizard() {
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState<Selection>({
    device: null,
    app: null,
    method: null,
  });

  const apps = useMemo(
    () => (sel.device ? wizardApps[sel.device.id] ?? [] : []),
    [sel.device],
  );

  const methods = useMemo(
    () => (sel.app ? wizardMethods[sel.app.id] ?? [] : []),
    [sel.app],
  );

  const instructions = useMemo(() => {
    if (!sel.device || !sel.app || !sel.method) return null;
    return getWizardInstructions(
      sel.device.id,
      sel.device.name,
      sel.app.id,
      sel.app.name,
      sel.method.id,
    );
  }, [sel]);

  const pickDevice = (device: WizardChoice) => {
    setSel({ device, app: null, method: null });
    setStep(2);
  };

  const pickApp = (app: WizardChoice) => {
    const nextMethods = wizardMethods[app.id] ?? [];
    if (nextMethods.length === 1) {
      setSel((prev) => ({ ...prev, app, method: nextMethods[0] }));
      setStep(4);
      return;
    }
    setSel((prev) => ({ ...prev, app, method: null }));
    setStep(3);
  };

  const pickMethod = (method: WizardChoice) => {
    setSel((prev) => ({ ...prev, method }));
    setStep(4);
  };

  const goBack = () => {
    if (step === 2) {
      setStep(1);
      return;
    }
    if (step === 3) {
      setStep(2);
      return;
    }
    if (step === 4) {
      const appMethods = sel.app ? wizardMethods[sel.app.id] ?? [] : [];
      setStep(appMethods.length <= 1 ? 2 : 3);
    }
  };

  return (
    <section id="wizard" className="scroll-mt-28 py-12 md:py-16">
      <div className="container-premium">
        <div className="rounded-2xl border border-gold/20 bg-[#0B0B0B] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-8">
          {/* Progress */}
          <div className="mb-8 flex items-center justify-between gap-2 overflow-x-auto pb-2">
            {STEPS.map((item, index) => {
              const done = step > item.id;
              const active = step === item.id;
              return (
                <div key={item.id} className="flex min-w-0 flex-1 items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition",
                        active &&
                          "border-gold bg-gold text-black shadow-[0_0_20px_rgba(212,167,44,0.35)]",
                        done && "border-gold/60 bg-gold/20 text-gold",
                        !active && !done && "border-white/15 text-text-dim",
                      )}
                    >
                      {done ? <CheckCircle2 className="h-4 w-4" /> : item.id}
                    </span>
                    <span
                      className={cn(
                        "hidden text-sm font-medium sm:inline",
                        active ? "text-gold" : done ? "text-white" : "text-text-dim",
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 ? (
                    <div
                      className={cn(
                        "mx-1 hidden h-px flex-1 sm:block",
                        step > item.id ? "bg-gold/50" : "bg-white/10",
                      )}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          {step > 1 ? (
            <button
              type="button"
              onClick={goBack}
              className="mb-4 inline-flex items-center gap-2 text-sm text-text-muted transition hover:text-gold"
            >
              <ArrowLeft className="h-4 w-4" />
              Πίσω
            </button>
          ) : null}

          {step === 1 ? (
            <Panel
              title="Βήμα 1 — Επιλέξτε τη Συσκευή σας"
              subtitle="Σε ποια συσκευή θέλετε να παρακολουθήσετε;"
            >
              <ChoiceGrid items={wizardDevices} onPick={pickDevice} />
            </Panel>
          ) : null}

          {step === 2 && sel.device ? (
            <Panel
              title="Βήμα 2 — Επιλέξτε Εφαρμογή"
              subtitle={
                <>
                  Επιλέξτε την εφαρμογή για το{" "}
                  <strong className="text-white">{sel.device.name}</strong>.
                </>
              }
            >
              <ChoiceGrid items={apps} onPick={pickApp} />
            </Panel>
          ) : null}

          {step === 3 && sel.device && sel.app ? (
            <Panel
              title="Βήμα 3 — Μέθοδος Σύνδεσης"
              subtitle={
                <>
                  Πώς θέλετε να συνδεθείτε στο{" "}
                  <strong className="text-white">{sel.app.name}</strong>;
                </>
              }
            >
              <ChoiceGrid
                items={methods}
                onPick={pickMethod}
                iconFor={(item) =>
                  item.id === "m3u" || item.id === "stalker" ? (
                    <Link2 className="h-5 w-5" />
                  ) : (
                    <KeyRound className="h-5 w-5" />
                  )
                }
              />
            </Panel>
          ) : null}

          {step === 4 && sel.device && sel.app && sel.method && instructions ? (
            <Panel
              title="Βήμα 4 — Ακολουθήστε τα Βήματα"
              subtitle={
                <>
                  Setup για <strong className="text-white">{sel.device.name}</strong>{" "}
                  με <strong className="text-white">{sel.app.name}</strong>
                </>
              }
            >
              <div className="overflow-hidden rounded-2xl border border-gold/25 bg-[#080808]">
                <div className="flex items-start gap-3 border-b border-white/10 bg-gradient-to-r from-gold/10 to-transparent p-5">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-gold/30 bg-gold/10 text-gold">
                    <MonitorSmartphone className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-display text-lg font-semibold text-white">
                      {instructions.title}
                    </h3>
                    <p className="mt-1 text-sm text-text-muted">
                      {instructions.subtitle}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  {instructions.warning ? (
                    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                      ⚠️ {instructions.warning}
                    </div>
                  ) : null}

                  <ol className="space-y-3">
                    {instructions.steps.map((item, index) => (
                      <li
                        key={item.title}
                        className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold text-sm font-bold text-black">
                          {index + 1}
                        </span>
                        <div>
                          <h4 className="font-semibold text-white">{item.title}</h4>
                          <p className="mt-1 text-sm leading-relaxed text-text-muted">
                            {item.description}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    ✅ {instructions.success}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-col items-start gap-4 rounded-xl border border-gold/20 bg-gold/[0.06] p-5 sm:flex-row sm:items-center">
                <LifeBuoy className="h-8 w-8 shrink-0 text-gold" />
                <div className="flex-1">
                  <h4 className="font-semibold text-white">
                    Κολλήσατε; Είμαστε εδώ 24/7
                  </h4>
                  <p className="mt-1 text-sm text-text-muted">
                    Η ομάδα υποστήριξης θα σας καθοδηγήσει live σε λίγα λεπτά.
                  </p>
                </div>
                <a
                  href={contactConfig.whatsapp}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-[#D4A72C] to-[#F2C75C] px-4 py-2.5 text-sm font-semibold text-black transition hover:brightness-105"
                >
                  Βοήθεια στο WhatsApp
                </a>
              </div>
            </Panel>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-text-muted">{subtitle}</p>
      <div className="mt-6">{children}</div>
    </div>
  );
}

function ChoiceGrid({
  items,
  onPick,
  iconFor,
}: {
  items: WizardChoice[];
  onPick: (item: WizardChoice) => void;
  iconFor?: (item: WizardChoice) => React.ReactNode;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onPick(item)}
          className={cn(
            "group relative rounded-xl border bg-[#080808] p-4 text-left transition duration-300 hover:-translate-y-0.5 hover:border-gold/50 hover:shadow-[0_12px_30px_rgba(212,167,44,0.12)]",
            item.popular
              ? "border-gold/40 bg-gold/[0.06]"
              : "border-white/10",
          )}
        >
          {item.badge ? (
            <span className="mb-3 inline-flex rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-bold tracking-[0.12em] text-gold uppercase">
              {item.badge}
            </span>
          ) : (
            <span className="mb-3 block h-5" />
          )}
          {iconFor ? (
            <span className="mb-3 inline-flex text-gold">{iconFor(item)}</span>
          ) : null}
          <p className="font-display text-base font-semibold text-white group-hover:text-gold">
            {item.name}
          </p>
          <p className="mt-1 text-sm text-text-dim">{item.sub}</p>
        </button>
      ))}
    </div>
  );
}
