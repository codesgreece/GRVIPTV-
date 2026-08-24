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
  onTagsChange: (tagIds: string[]) => Promise<void>;
  onCreateTag: (name: string, emoji: string) => Promise<void>;
  onAddNote: (content: string) => Promise<void>;
  onUpdateNote: (noteId: string, content: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
};

function formatDate(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

const actionBtnClass =
  "h-auto min-h-10 w-full min-w-0 px-2 py-2 text-[11px] leading-tight whitespace-normal sm:min-h-0 sm:w-auto sm:px-6 sm:py-3 sm:text-base";

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
  onTagsChange,
  onCreateTag,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
}: AdminCustomerProfileProps) {
  const status = adminStatusFromDays(customer.daysRemaining);
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
    <AdminModal title={`👤 ${customer.name}`} onClose={onClose} wide>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold text-text-muted">
          {status.label}
        </span>
        <span className="text-sm text-gold">{customer.packageLabel}</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Info label="Ενεργοποίηση" value={formatDate(customer.activatedAt)} />
        <Info label="Λήξη" value={formatDate(customer.expiresAt)} />
        <Info
          label="Απομένουν"
          value={customer.daysRemaining > 0 ? `${customer.daysRemaining} ημέρες` : "0 ημέρες"}
        />
        <Info label="Magic Link" value={`/account/${customer.token}`} mono />
        <Info label="Σύνολο πληρωμών" value={formatEuro(customer.totalPaid)} />
        <Info label="Συνολικό κέρδος" value={formatEuro(customer.totalProfit)} />
      </div>

      <div className="mt-4 grid w-full min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Button className={actionBtnClass} onClick={onRenew}>
          <RefreshCw className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          Ανανέωση
        </Button>
        <Button variant="outline" className={actionBtnClass} onClick={onSpecial}>
          <Gift className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          Ειδική προσφορά
        </Button>
        <Button variant="outline" className={actionBtnClass} onClick={onMessages}>
          <MessageCircle className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          Μηνύματα
        </Button>
        <Button variant="outline" className={actionBtnClass} onClick={onCopyLink}>
          <Copy className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          Αντιγραφή link
        </Button>
        <Button href={`/account/${customer.token}`} variant="outline" className={actionBtnClass}>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          Άνοιγμα
        </Button>
        <Button variant="outline" className={actionBtnClass} onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          Επεξεργασία
        </Button>
        <Button variant="ghost" className={actionBtnClass} onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
          Διαγραφή
        </Button>
      </div>

      <section className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
        <h3 className="font-display text-base font-bold text-white">🏷️ Tags</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {allTags.map((tag) => {
            const active = (customer.tagIds ?? []).includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                disabled={busy}
                onClick={() => void toggleTag(tag.id)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-semibold",
                  active
                    ? "border-gold/40 bg-gold/15 text-gold"
                    : "border-white/10 bg-black/20 text-text-muted",
                )}
              >
                {tag.emoji} {tag.name}
              </button>
            );
          })}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_5rem_auto]">
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
            <Plus className="h-4 w-4" />
            Tag
          </Button>
        </div>
      </section>

      <section className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4">
        <h3 className="font-display text-base font-bold text-white">📝 Σημειώσεις</h3>
        <div className="mt-3 grid gap-2">
          <textarea
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            className="admin-input min-h-24"
            placeholder="Προσθήκη σημείωσης (μόνο admin)"
          />
          <Button
            className="sm:w-fit"
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
            <Plus className="h-4 w-4" />
            Προσθήκη σημείωσης
          </Button>
        </div>

        <div className="mt-4 grid gap-3">
          {customer.notes.length === 0 ? (
            <p className="text-sm text-text-muted">Δεν υπάρχουν σημειώσεις.</p>
          ) : (
            customer.notes.map((note) => (
              <article key={note.id} className="rounded-xl border border-white/8 bg-[#0B0B0B] p-3">
                {editingNoteId === note.id ? (
                  <>
                    <textarea
                      value={editingNoteText}
                      onChange={(event) => setEditingNoteText(event.target.value)}
                      className="admin-input min-h-24"
                    />
                    <div className="mt-2 flex gap-2">
                      <Button
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
                      <Button variant="ghost" onClick={() => setEditingNoteId(null)}>
                        Ακύρωση
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap text-sm text-white">{note.content}</p>
                    <p className="mt-2 text-[11px] text-text-dim">
                      Δημιουργία {formatDate(note.createdAt)} · Ενημέρωση {formatDate(note.updatedAt)}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingNoteId(note.id);
                          setEditingNoteText(note.content);
                        }}
                      >
                        Επεξεργασία
                      </Button>
                      <Button
                        variant="ghost"
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
      </section>

      <AdminSubscriptionHistory subscriptions={customer.subscriptions} />
    </AdminModal>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/10 bg-black/30 p-3">
      <p className="text-[11px] font-semibold tracking-[0.12em] text-text-dim uppercase">{label}</p>
      <p className={cn("mt-1 break-words text-sm font-semibold text-white", mono && "font-mono text-xs")}>
        {value}
      </p>
    </div>
  );
}
