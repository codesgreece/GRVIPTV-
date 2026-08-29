"use client";

import { useState } from "react";
import {
  Copy,
  ExternalLink,
  Gift,
  MessageCircle,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { AdminModal } from "@/components/admin/AdminCrmModals";
import { AdminSubscriptionHistory } from "@/components/admin/AdminSubscriptionHistory";
import { Button } from "@/components/ui/Button";
import { formatEuro } from "@/lib/customers/pricing";
import { adminStatusFromDays } from "@/lib/customers/status";
import type { CustomerTag, CustomerView } from "@/lib/customers/types";
import { cn } from "@/lib/cn";

type ProfileTab = "overview" | "tags" | "notes" | "history";

type AdminCustomerProfileProps = {
  customer: CustomerView;
  allTags: CustomerTag[];
  onClose: () => void;
  onRenew: () => void;
  onSpecial: () => void;
  onMessages: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onCopyLink: () => void;
  onRegenerateLink: () => void;
  onSync: () => Promise<void>;
  onTagsChange: (tagIds: string[]) => Promise<void>;
  onCreateTag: (name: string, emoji: string) => Promise<void>;
  onAddNote: (content: string) => Promise<void>;
  onUpdateNote: (noteId: string, content: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
};

function formatDate(iso: string) {
  if (iso.includes("T")) {
    const date = new Date(iso);
    if (Number.isFinite(date.getTime())) {
      return new Intl.DateTimeFormat("el-GR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    }
  }
  const [year, month, day] = iso.slice(0, 10).split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

const actionBtnClass =
  "h-auto min-h-8 w-full min-w-0 px-2 py-1.5 text-[11px] leading-tight whitespace-normal sm:w-auto sm:px-3 sm:py-2 sm:text-xs";

const PROFILE_TABS: { id: ProfileTab; label: string }[] = [
  { id: "overview", label: "Στοιχεία" },
  { id: "tags", label: "Tags" },
  { id: "notes", label: "Σημειώσεις" },
  { id: "history", label: "Ιστορικό" },
];

export function AdminCustomerProfile({
  customer,
  allTags,
  onClose,
  onRenew,
  onSpecial,
  onMessages,
  onEdit,
  onDelete,
  onCopyLink,
  onRegenerateLink,
  onSync,
  onTagsChange,
  onCreateTag,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}: AdminCustomerProfileProps) {
  const status = adminStatusFromDays(customer.daysRemaining);
  const [tab, setTab] = useState<ProfileTab>("overview");
  const [noteDraft, setNoteDraft] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagEmoji, setNewTagEmoji] = useState("🏷️");
  const [busy, setBusy] = useState(false);

  const toggleTag = async (tagId: string) => {
    const current = new Set(customer.tagIds ?? []);
    if (current.has(tagId)) current.delete(tagId);
    else current.add(tagId);
    setBusy(true);
    await onTagsChange([...current]);
    setBusy(false);
  };

  return (
    <AdminModal title={customer.name} onClose={onClose} wide>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-md border border-white/10 px-2 py-0.5 text-[11px] font-semibold text-text-muted">
          {status.label}
        </span>
        <span className="text-xs text-gold">{customer.packageLabel}</span>
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto border-b border-white/10 pb-px">
        {PROFILE_TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2 text-xs font-semibold transition-colors",
              tab === item.id
                ? "border-gold text-gold"
                : "border-transparent text-text-muted hover:text-white",
            )}
          >
            {item.label}
            {item.id === "notes" && customer.notes.length > 0 ? (
              <span className="ml-1 text-text-dim">({customer.notes.length})</span>
            ) : null}
            {item.id === "history" && customer.subscriptions.length > 0 ? (
              <span className="ml-1 text-text-dim">({customer.subscriptions.length})</span>
            ) : null}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <>
          <div className="grid gap-2 sm:grid-cols-2">
            <Info label="Ενεργοποίηση" value={formatDate(customer.activatedAt)} />
            <Info label="Λήξη" value={formatDate(customer.expiresAt)} />
            <Info label="Πληρωμή με" value={customer.paymentMethodLabel ?? "—"} />
            <Info
              label="Απομένουν"
              value={customer.daysRemaining > 0 ? `${customer.daysRemaining} ημέρες` : "0 ημέρες"}
            />
            <Info label="Magic Link" value={`/account/${customer.token}`} mono />
            <Info label="Σύνολο πληρωμών" value={formatEuro(customer.totalPaid)} />
            <Info label="Συνολικό κέρδος" value={formatEuro(customer.totalProfit)} />
          </div>

          <div className="mt-3 rounded-xl border border-sky-500/20 bg-sky-500/5 p-3">
            <p className="text-[10px] font-semibold tracking-[0.12em] text-sky-200/80 uppercase">
              Provider · {customer.providerServerLabel}
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <Info label="Username" value={customer.providerUsername ?? "—"} mono />
              <Info label="Password" value={customer.providerPassword ?? "—"} mono />
              <Info
                label="Line ID"
                value={customer.providerLineId ? String(customer.providerLineId) : "—"}
              />
              <Info
                label="Max connections"
                value={
                  customer.providerMaxConnections != null
                    ? String(customer.providerMaxConnections)
                    : "—"
                }
              />
              <Info
                label="Enabled"
                value={
                  customer.providerEnabled == null
                    ? "—"
                    : customer.providerEnabled
                      ? "Ναι"
                      : "Όχι"
                }
              />
            </div>
          </div>

          <div className="mt-3 grid w-full min-w-0 grid-cols-2 gap-1.5 sm:flex sm:flex-wrap">
            <Button className={actionBtnClass} onClick={onRenew}>
              <RefreshCw className="h-3.5 w-3.5 shrink-0" />
              Ανανέωση
            </Button>
            <Button variant="outline" className={actionBtnClass} onClick={onSpecial}>
              <Gift className="h-3.5 w-3.5 shrink-0" />
              Ειδική
            </Button>
            <Button variant="outline" className={actionBtnClass} onClick={onMessages}>
              <MessageCircle className="h-3.5 w-3.5 shrink-0" />
              Μηνύματα
            </Button>
            <Button variant="outline" className={actionBtnClass} onClick={onCopyLink}>
              <Copy className="h-3.5 w-3.5 shrink-0" />
              Αντιγραφή
            </Button>
            <Button href={`/account/${customer.token}`} variant="outline" className={actionBtnClass}>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
              Άνοιγμα
            </Button>
            <Button variant="outline" className={actionBtnClass} onClick={() => void onSync()}>
              <RefreshCw className="h-3.5 w-3.5 shrink-0" />
              Sync
            </Button>
            <Button variant="outline" className={actionBtnClass} onClick={onEdit}>
              <Pencil className="h-3.5 w-3.5 shrink-0" />
              Επεξεργασία
            </Button>
            <Button variant="outline" className={actionBtnClass} onClick={onRegenerateLink}>
              <RefreshCw className="h-3.5 w-3.5 shrink-0" />
              Νέο link
            </Button>
            <Button variant="ghost" className={actionBtnClass} onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5 shrink-0" />
              Διαγραφή
            </Button>
          </div>
        </>
      ) : null}

      {tab === "tags" ? (
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => {
              const active = (customer.tagIds ?? []).includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  disabled={busy}
                  onClick={() => void toggleTag(tag.id)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-semibold",
                    active
                      ? "border-gold/40 bg-gold/15 text-gold"
                      : "border-white/10 bg-black/20 text-text-muted",
                  )}
                >
                  {tag.emoji} {tag.name}
                </button>
              );
            })}
            {allTags.length === 0 ? (
              <p className="text-sm text-text-muted">Δεν υπάρχουν tags ακόμα.</p>
            ) : null}
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_4.5rem_auto]">
            <input
              value={newTagName}
              onChange={(event) => setNewTagName(event.target.value)}
              className="admin-input"
              placeholder="Νέο custom tag"
            />
            <input
              value={newTagEmoji}
              onChange={(event) => setNewTagEmoji(event.target.value)}
              className="admin-input"
              placeholder="🏷️"
            />
            <Button
              variant="outline"
              className={actionBtnClass}
              disabled={busy || newTagName.trim().length < 2}
              onClick={() => {
                void (async () => {
                  setBusy(true);
                  await onCreateTag(newTagName.trim(), newTagEmoji.trim() || "🏷️");
                  setNewTagName("");
                  setNewTagEmoji("🏷️");
                  setBusy(false);
                })();
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Tag
            </Button>
          </div>
        </div>
      ) : null}

      {tab === "notes" ? (
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <div className="grid gap-2">
            <textarea
              value={noteDraft}
              onChange={(event) => setNoteDraft(event.target.value)}
              className="admin-input min-h-20"
              placeholder="Προσθήκη σημείωσης (μόνο admin)"
            />
            <Button
              className={cn(actionBtnClass, "sm:w-fit")}
              disabled={busy || !noteDraft.trim()}
              onClick={() => {
                void (async () => {
                  setBusy(true);
                  await onAddNote(noteDraft.trim());
                  setNoteDraft("");
                  setBusy(false);
                })();
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Προσθήκη
            </Button>
          </div>

          <div className="mt-3 grid gap-2">
            {customer.notes.length === 0 ? (
              <p className="text-sm text-text-muted">Δεν υπάρχουν σημειώσεις.</p>
            ) : (
              customer.notes.map((note) => (
                <article key={note.id} className="rounded-lg border border-white/8 bg-[#0B0B0B] p-2.5">
                  {editingNoteId === note.id ? (
                    <>
                      <textarea
                        value={editingNoteText}
                        onChange={(event) => setEditingNoteText(event.target.value)}
                        className="admin-input min-h-20"
                      />
                      <div className="mt-2 flex gap-2">
                        <Button
                          className={actionBtnClass}
                          onClick={() => {
                            void (async () => {
                              setBusy(true);
                              await onUpdateNote(note.id, editingNoteText.trim());
                              setEditingNoteId(null);
                              setBusy(false);
                            })();
                          }}
                        >
                          Αποθήκευση
                        </Button>
                        <Button variant="ghost" className={actionBtnClass} onClick={() => setEditingNoteId(null)}>
                          Ακύρωση
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="whitespace-pre-wrap text-sm text-white">{note.content}</p>
                      <p className="mt-1.5 text-[10px] text-text-dim">
                        Δημιουργία {formatDate(note.createdAt)} · Ενημέρωση {formatDate(note.updatedAt)}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <Button
                          variant="outline"
                          className={actionBtnClass}
                          onClick={() => {
                            setEditingNoteId(note.id);
                            setEditingNoteText(note.content);
                          }}
                        >
                          Επεξεργασία
                        </Button>
                        <Button
                          variant="ghost"
                          className={actionBtnClass}
                          onClick={() => {
                            void (async () => {
                              setBusy(true);
                              await onDeleteNote(note.id);
                              setBusy(false);
                            })();
                          }}
                        >
                          Διαγραφή
                        </Button>
                      </div>
                    </>
                  )}
                </article>
              ))
            )}
          </div>
        </div>
      ) : null}

      {tab === "history" ? <AdminSubscriptionHistory subscriptions={customer.subscriptions} /> : null}
    </AdminModal>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/10 bg-black/30 px-2.5 py-2">
      <p className="text-[10px] font-semibold tracking-[0.12em] text-text-dim uppercase">{label}</p>
      <p className={cn("mt-0.5 break-words text-sm font-semibold text-white", mono && "font-mono text-xs")}>
        {value}
      </p>
    </div>
  );
}
