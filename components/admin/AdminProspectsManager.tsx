"use client";

import { useMemo, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
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

const tinyInput = "admin-input !rounded-md !px-2 !py-1.5 text-sm";

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
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-display text-base font-bold text-white">Πιθανοί πελάτες</h2>
        <p className="text-[11px] font-semibold text-sky-300/90">
          {dueCount > 0 ? `${dueCount} σήμερα/καθυστ.` : `${prospects.length} συνολικά`}
        </p>
      </div>

      {error ? <p className="mb-2 text-xs text-rose-400">{error}</p> : null}

      <div className="grid gap-2 md:grid-cols-3 md:max-w-5xl">
        {SALESPEOPLE.map((person) => {
          const list = grouped[person.id];
          const draft = drafts[person.id];
          const creating = savingId === person.id;

          return (
            <div key={person.id} className="min-w-0 rounded-md border border-white/10 p-2">
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <h3 className="truncate text-sm font-bold text-white">{person.name}</h3>
                <span className="shrink-0 text-[11px] text-text-dim">{list.length}</span>
              </div>

              <div className="mb-1.5 flex gap-1">
                <input
                  value={draft.name}
                  onChange={(event) => setDraft(person.id, { name: event.target.value })}
                  className={cn(tinyInput, "min-w-0 flex-1")}
                  placeholder="Όνομα"
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void submitCreate(person.id);
                  }}
                />
                <input
                  type="date"
                  value={draft.contactAt}
                  onChange={(event) => setDraft(person.id, { contactAt: event.target.value })}
                  className={cn(tinyInput, "w-[7.5rem] shrink-0")}
                />
                <Button
                  className="h-7 w-7 shrink-0 !px-0 !py-0 sm:h-7 sm:w-7 sm:!px-0 sm:!py-0"
                  disabled={creating || !draft.name.trim()}
                  onClick={() => void submitCreate(person.id)}
                  aria-label="Προσθήκη"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <ul className="space-y-1">
                {list.length === 0 ? (
                  <li className="px-1 py-1 text-[11px] text-text-dim">Κενό</li>
                ) : (
                  list.map((prospect) => {
                    const tone = contactTone(prospect.contactAt);
                    const editing = editingId === prospect.id;
                    const busy = savingId === prospect.id;

                    return (
                      <li
                        key={prospect.id}
                        className={cn(
                          "rounded-md border px-2 py-1.5",
                          tone === "overdue" && "border-rose-500/30 bg-rose-500/10",
                          tone === "today" && "border-amber-500/30 bg-amber-500/10",
                          tone === "upcoming" && "border-white/8 bg-white/[0.02]",
                        )}
                      >
                        {editing ? (
                          <div className="grid gap-1">
                            <input
                              value={editDraft.name}
                              onChange={(event) =>
                                setEditDraft((current) => ({ ...current, name: event.target.value }))
                              }
                              className={tinyInput}
                            />
                            <div className="grid grid-cols-[1fr_auto_auto] gap-1">
                              <input
                                type="date"
                                value={editDraft.contactAt}
                                onChange={(event) =>
                                  setEditDraft((current) => ({
                                    ...current,
                                    contactAt: event.target.value,
                                  }))
                                }
                                className={tinyInput}
                              />
                              <Button
                                className="h-8 px-2 py-1 text-[11px] sm:px-2 sm:py-1 sm:text-[11px]"
                                disabled={busy}
                                onClick={() => void submitEdit(prospect)}
                              >
                                OK
                              </Button>
                              <Button
                                variant="outline"
                                className="h-8 w-8 !px-0 !py-0 sm:!px-0 sm:!py-0"
                                onClick={() => setEditingId(null)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <input
                              value={editDraft.note}
                              onChange={(event) =>
                                setEditDraft((current) => ({ ...current, note: event.target.value }))
                              }
                              className={tinyInput}
                              placeholder="Σημείωση"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-white">{prospect.name}</p>
                              <p className="text-[11px] text-text-muted">
                                {formatDate(prospect.contactAt)}
                                {tone === "today" ? " · σήμερα" : null}
                                {tone === "overdue" ? " · καθυστ." : null}
                                {prospect.note ? ` · ${prospect.note}` : null}
                              </p>
                            </div>
                            <div className="flex shrink-0">
                              <button
                                type="button"
                                className="rounded p-1 text-text-muted hover:text-gold"
                                onClick={() => startEdit(prospect)}
                                aria-label="Επεξεργασία"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                className="rounded p-1 text-text-muted hover:text-rose-400"
                                disabled={busy}
                                onClick={() => void submitDelete(prospect.id)}
                                aria-label="Διαγραφή"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
