"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DEFAULT_CREDIT_RATES_FRACTIONAL,
  DEFAULT_CREDIT_RATES_WHOLE,
  PACKAGE_OPTIONS,
  type CreditRates,
  type Server,
  type ServerInput,
} from "@/lib/customers/types";
import { cn } from "@/lib/cn";

type Props = {
  servers: Server[];
  onCreate: (input: ServerInput) => Promise<void>;
  onUpdate: (id: string, input: ServerInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

type Draft = {
  name: string;
  creditsRemaining: string;
  creditRates: CreditRates;
};

function emptyDraft(rates: CreditRates = DEFAULT_CREDIT_RATES_WHOLE): Draft {
  return {
    name: "",
    creditsRemaining: "0",
    creditRates: { ...rates },
  };
}

function fromServer(server: Server): Draft {
  return {
    name: server.name,
    creditsRemaining: String(server.creditsRemaining),
    creditRates: { ...server.creditRates },
  };
}

function toInput(draft: Draft): ServerInput {
  return {
    name: draft.name.trim(),
    creditsRemaining: Number(draft.creditsRemaining),
    creditRates: draft.creditRates,
  };
}

export function AdminServersManager({ servers, onCreate, onUpdate, onDelete }: Props) {
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const setRate = (packageId: keyof CreditRates, value: string) => {
    const parsed = Number(value);
    setDraft((current) => ({
      ...current,
      creditRates: {
        ...current.creditRates,
        [packageId]: Number.isFinite(parsed) ? parsed : 0,
      },
    }));
  };

  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      const input = toInput(draft);
      if (editingId) await onUpdate(editingId, input);
      else await onCreate(input);
      setDraft(emptyDraft());
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Αποτυχία αποθήκευσης.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-base font-bold text-white">Servers & credits</h2>
          <p className="mt-0.5 text-xs text-text-muted">
            Όρισε servers, υπόλοιπο credits και πόσα credits «τρώει» κάθε πακέτο.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Button
            variant="outline"
            className="h-8 px-2.5 py-1.5 text-xs sm:px-2.5 sm:py-1.5 sm:text-xs"
            onClick={() => setDraft(emptyDraft(DEFAULT_CREDIT_RATES_WHOLE))}
          >
            Rates 1/3/6/12
          </Button>
          <Button
            variant="outline"
            className="h-8 px-2.5 py-1.5 text-xs sm:px-2.5 sm:py-1.5 sm:text-xs"
            onClick={() => setDraft(emptyDraft(DEFAULT_CREDIT_RATES_FRACTIONAL))}
          >
            Rates 0.1/0.3/0.6/1
          </Button>
        </div>
      </div>

      <section className="rounded-xl border border-white/10 bg-[#0B0B0B] p-3">
        <h3 className="text-sm font-bold text-white">
          {editingId ? "Επεξεργασία server" : "Νέος server"}
        </h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <label className="block min-w-0">
            <span className="mb-1 block text-[10px] font-semibold tracking-wide text-text-dim uppercase">
              Όνομα
            </span>
            <input
              value={draft.name}
              onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
              className="admin-input"
              placeholder="π.χ. Server A"
            />
          </label>
          <label className="block min-w-0">
            <span className="mb-1 block text-[10px] font-semibold tracking-wide text-text-dim uppercase">
              Credits υπόλοιπο
            </span>
            <input
              type="number"
              min={0}
              step="0.01"
              value={draft.creditsRemaining}
              onChange={(event) =>
                setDraft((current) => ({ ...current, creditsRemaining: event.target.value }))
              }
              className="admin-input"
            />
          </label>
        </div>

        <p className="mt-3 text-[10px] font-semibold tracking-wide text-text-dim uppercase">
          Κατανάλωση credits ανά πακέτο
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PACKAGE_OPTIONS.map((option) => (
            <label key={option.id} className="block min-w-0">
              <span className="mb-1 block truncate text-[10px] font-semibold text-text-dim">
                {option.label}
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={draft.creditRates[option.id]}
                onChange={(event) => setRate(option.id, event.target.value)}
                className="admin-input"
              />
            </label>
          ))}
        </div>

        {error ? <p className="mt-2 text-xs text-rose-400">{error}</p> : null}

        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            className="h-9 px-3 py-2 text-xs sm:px-3 sm:py-2 sm:text-xs"
            disabled={busy}
            onClick={() => void submit()}
          >
            <Plus className="h-3.5 w-3.5" />
            {editingId ? "Αποθήκευση" : "Προσθήκη server"}
          </Button>
          {editingId ? (
            <Button
              variant="ghost"
              className="h-9 px-3 py-2 text-xs sm:px-3 sm:py-2 sm:text-xs"
              onClick={() => {
                setEditingId(null);
                setDraft(emptyDraft());
              }}
            >
              <X className="h-3.5 w-3.5" />
              Ακύρωση
            </Button>
          ) : null}
        </div>
      </section>

      <div className="grid gap-2">
        {servers.length === 0 ? (
          <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-center text-sm text-text-muted">
            Δεν έχεις servers ακόμα. Πρόσθεσε τον πρώτο παραπάνω.
          </p>
        ) : (
          servers.map((server) => (
            <article
              key={server.id}
              className="rounded-xl border border-white/10 bg-[#0B0B0B] p-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">{server.name}</h3>
                  <p className="mt-1 text-sm font-semibold text-gold">
                    Υπόλοιπο: {server.creditsRemaining} credits
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    className="rounded p-1.5 text-text-muted hover:bg-white/5 hover:text-gold"
                    onClick={() => {
                      setEditingId(server.id);
                      setDraft(fromServer(server));
                    }}
                    aria-label="Επεξεργασία"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    className="rounded p-1.5 text-text-muted hover:bg-white/5 hover:text-rose-400"
                    onClick={() => {
                      void (async () => {
                        if (!window.confirm(`Διαγραφή «${server.name}»;`)) return;
                        setError("");
                        try {
                          await onDelete(server.id);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : "Αποτυχία διαγραφής.");
                        }
                      })();
                    }}
                    aria-label="Διαγραφή"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {PACKAGE_OPTIONS.map((option) => (
                  <span
                    key={option.id}
                    className={cn(
                      "rounded-md border border-white/10 px-2 py-0.5 text-[10px] text-text-muted",
                    )}
                  >
                    {option.label}: {server.creditRates[option.id]}
                  </span>
                ))}
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
