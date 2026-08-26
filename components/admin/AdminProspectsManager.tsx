"use client";

import { useMemo, useState } from "react";
import { CalendarClock, Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  SALESPEOPLE,
  type Prospect,
  type ProspectInput,
  type SalespersonId,
} from "@/lib/customers/types";

type Draft = {
  name: string;
  contactAt: string;
  note: string;
};

type Props = {
  prospects: Prospect[];
  onCreate: (input: ProspectInput) => Promise<void>;
  onUpdate: (id: string, input: ProspectInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function todayYmd() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

function formatDate(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

function emptyDraft(): Draft {
  return { name: "", contactAt: todayYmd(), note: "" };
}

function contactTone(contactAt: string) {
  const today = todayYmd();
  if (contactAt < today) return "overdue" as const;
  if (contactAt === today) return "today" as const;
  return "upcoming" as const;
}

export function AdminProspectsManager({ prospects, onCreate, onUpdate, onDelete }: Props) {
  const [drafts, setDrafts] = useState<Record<SalespersonId, Draft>>({
    "dimos-leonidiou": emptyDraft(),
    "giannis-kalaouris": emptyDraft(),
    "andreas-leontios": emptyDraft(),
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Draft>(emptyDraft());
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const grouped = useMemo(() => {
    const map = Object.fromEntries(SALESPEOPLE.map((person) => [person.id, [] as Prospect[]])) as Record<
      SalespersonId,
      Prospect[]
    >;
    for (const prospect of prospects) {
      if (map[prospect.salespersonId]) {
        map[prospect.salespersonId].push(prospect);
      }
    }
    return map;
  }, [prospects]);

  const dueCount = prospects.filter((item) => {
    const tone = contactTone(item.contactAt);
    return tone === "today" || tone === "overdue";
  }).length;

  const setDraft = (salespersonId: SalespersonId, patch: Partial<Draft>) => {
    setDrafts((current) => ({
      ...current,
      [salespersonId]: { ...current[salespersonId], ...patch },
    }));
  };

  const submitCreate = async (salespersonId: SalespersonId) => {
    const draft = drafts[salespersonId];
    setError("");
    setSavingId(salespersonId);
    try {
      await onCreate({
        salespersonId,
        name: draft.name,
        contactAt: draft.contactAt,
        note: draft.note.trim() || undefined,
      });
      setDrafts((current) => ({ ...current, [salespersonId]: emptyDraft() }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Αποτυχία αποθήκευσης.");
    } finally {
      setSavingId(null);
    }
  };

  const startEdit = (prospect: Prospect) => {
    setEditingId(prospect.id);
    setEditDraft({
      name: prospect.name,
      contactAt: prospect.contactAt,
      note: prospect.note ?? "",
    });
    setError("");
  };

  const submitEdit = async (prospect: Prospect) => {
    setError("");
    setSavingId(prospect.id);
    try {
      await onUpdate(prospect.id, {
        salespersonId: prospect.salespersonId,
        name: editDraft.name,
        contactAt: editDraft.contactAt,
        note: editDraft.note.trim() || undefined,
      });
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Αποτυχία ενημέρωσης.");
    } finally {
      setSavingId(null);
    }
  };

  const submitDelete = async (id: string) => {
    if (!window.confirm("Να διαγραφεί αυτός ο πιθανός πελάτης;")) return;
    setError("");
    setSavingId(id);
    try {
      await onDelete(id);
      if (editingId === id) setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Αποτυχία διαγραφής.");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="mb-8 overflow-hidden rounded-3xl border border-sky-500/20 bg-[#0B0B0B] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-white">Πιθανοί πελάτες</h2>
          <p className="mt-1 text-sm text-text-muted">
            Όνομα κάτω από κάθε πωλητή + ημερομηνία που είπαν να τους στείλεις.
          </p>
        </div>
        <p className="text-xs font-semibold tracking-[0.12em] text-sky-300/90 uppercase">
          {dueCount > 0 ? `${dueCount} για σήμερα / καθυστερημένοι` : `${prospects.length} συνολικά`}
        </p>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {SALESPEOPLE.map((person) => {
          const list = grouped[person.id];
          const draft = drafts[person.id];
          const creating = savingId === person.id;

          return (
            <article
              key={person.id}
              className="flex min-w-0 flex-col rounded-2xl border border-white/10 bg-black/30 p-4"
            >
              <div className="border-b border-white/10 pb-3">
                <p className="text-[11px] font-bold tracking-[0.14em] text-text-dim uppercase">
                  Πωλητής
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-white">{person.name}</h3>
                <p className="mt-1 text-xs text-text-muted">
                  {list.length === 0
                    ? "Κανένας πιθανός πελάτης ακόμα"
                    : `${list.length} ${list.length === 1 ? "πιθανός πελάτης" : "πιθανοί πελάτες"}`}
                </p>
              </div>

              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.12em] text-text-dim uppercase">
                    Όνομα
                  </span>
                  <input
                    value={draft.name}
                    onChange={(event) => setDraft(person.id, { name: event.target.value })}
                    className="admin-input"
                    placeholder="π.χ. Νίκος"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.12em] text-text-dim uppercase">
                    Να τον/την στείλω στις
                  </span>
                  <input
                    type="date"
                    value={draft.contactAt}
                    onChange={(event) => setDraft(person.id, { contactAt: event.target.value })}
                    className="admin-input"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[11px] font-semibold tracking-[0.12em] text-text-dim uppercase">
                    Σημείωση (προαιρετικό)
                  </span>
                  <input
                    value={draft.note}
                    onChange={(event) => setDraft(person.id, { note: event.target.value })}
                    className="admin-input"
                    placeholder="π.χ. μετά τις 18:00"
                  />
                </label>
                <Button
                  fullWidth
                  className="font-extrabold"
                  disabled={creating}
                  onClick={() => void submitCreate(person.id)}
                >
                  <Plus className="h-4 w-4" />
                  Προσθήκη
                </Button>
              </div>

              <div className="mt-4 flex-1 space-y-2">
                {list.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-white/10 px-3 py-4 text-center text-sm text-text-dim">
                    Πρόσθεσε το πρώτο όνομα εδώ.
                  </p>
                ) : (
                  list.map((prospect) => {
                    const tone = contactTone(prospect.contactAt);
                    const editing = editingId === prospect.id;
                    const busy = savingId === prospect.id;

                    return (
                      <div
                        key={prospect.id}
                        className={cn(
                          "rounded-xl border p-3",
                          tone === "overdue" && "border-rose-500/30 bg-rose-500/10",
                          tone === "today" && "border-amber-500/30 bg-amber-500/10",
                          tone === "upcoming" && "border-white/10 bg-white/[0.03]",
                        )}
                      >
                        {editing ? (
                          <div className="space-y-2">
                            <input
                              value={editDraft.name}
                              onChange={(event) =>
                                setEditDraft((current) => ({ ...current, name: event.target.value }))
                              }
                              className="admin-input"
                            />
                            <input
                              type="date"
                              value={editDraft.contactAt}
                              onChange={(event) =>
                                setEditDraft((current) => ({
                                  ...current,
                                  contactAt: event.target.value,
                                }))
                              }
                              className="admin-input"
                            />
                            <input
                              value={editDraft.note}
                              onChange={(event) =>
                                setEditDraft((current) => ({ ...current, note: event.target.value }))
                              }
                              className="admin-input"
                              placeholder="Σημείωση"
                            />
                            <div className="flex gap-2">
                              <Button
                                className="flex-1 py-2 text-sm"
                                disabled={busy}
                                onClick={() => void submitEdit(prospect)}
                              >
                                Αποθήκευση
                              </Button>
                              <Button
                                variant="outline"
                                className="py-2 text-sm"
                                onClick={() => setEditingId(null)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-white">{prospect.name}</p>
                              <p className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
                                <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                                {formatDate(prospect.contactAt)}
                                {tone === "today" ? " · σήμερα" : null}
                                {tone === "overdue" ? " · καθυστέρηση" : null}
                              </p>
                              {prospect.note ? (
                                <p className="mt-1 text-xs text-text-dim">{prospect.note}</p>
                              ) : null}
                            </div>
                            <div className="flex shrink-0 gap-1">
                              <button
                                type="button"
                                className="rounded-lg p-2 text-text-muted transition hover:bg-white/5 hover:text-gold"
                                onClick={() => startEdit(prospect)}
                                aria-label="Επεξεργασία"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                className="rounded-lg p-2 text-text-muted transition hover:bg-white/5 hover:text-rose-400"
                                disabled={busy}
                                onClick={() => void submitDelete(prospect.id)}
                                aria-label="Διαγραφή"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
