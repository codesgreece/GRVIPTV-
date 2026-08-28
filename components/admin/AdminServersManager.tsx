"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { type Server, type ServerInput } from "@/lib/customers/types";

type Props = {
  servers: Server[];
  onCreate: (input: ServerInput) => Promise<void>;
  onUpdate: (id: string, input: ServerInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function AdminServersManager({ servers, onCreate, onUpdate, onDelete }: Props) {
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setEditingId(null);
  };

  const submit = async () => {
    setError("");
    setBusy(true);
    try {
      const input: ServerInput = { name: name.trim() };
      if (editingId) await onUpdate(editingId, input);
      else await onCreate(input);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Αποτυχία αποθήκευσης.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-bold text-white">Servers</h2>
        <p className="mt-0.5 text-xs text-text-muted">
          Δήλωσε τους servers σου για να τους αντιστοιχίζεις σε πελάτες.
        </p>
      </div>

      <section className="rounded-xl border border-white/10 bg-[#0B0B0B] p-3">
        <h3 className="text-sm font-bold text-white">
          {editingId ? "Επεξεργασία server" : "Νέος server"}
        </h3>
        <label className="mt-3 block min-w-0">
          <span className="mb-1 block text-[10px] font-semibold tracking-wide text-text-dim uppercase">
            Όνομα
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="admin-input"
            placeholder="π.χ. Server A"
          />
        </label>

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
              onClick={reset}
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
              className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-[#0B0B0B] p-3"
            >
              <h3 className="text-sm font-bold text-white">{server.name}</h3>
              <div className="flex gap-1">
                <button
                  type="button"
                  className="rounded p-1.5 text-text-muted hover:bg-white/5 hover:text-gold"
                  onClick={() => {
                    setEditingId(server.id);
                    setName(server.name);
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
            </article>
          ))
        )}
      </div>
    </div>
  );
}
