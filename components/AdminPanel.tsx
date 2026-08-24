"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  ExternalLink,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Shield,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { adminStatusFromDays, addMonthsToYmd, daysRemainingFromExpiry, getPackageLabel, getPackageMonths } from "@/lib/customers/status";
import { CUSTOMER_PACKAGES, DEFAULT_SETUP_GUIDE_PATH, type Customer, type CustomerInput } from "@/lib/customers/types";
import { cn } from "@/lib/cn";

type StoreInfo = {
  backend: "upstash" | "file";
  persistent: boolean;
  warning: string | null;
};

type FormState = CustomerInput;

const emptyForm = (): FormState => ({
  name: "",
  packageId: "1-month",
  activatedAt: new Date().toISOString().slice(0, 10),
  expiresAt: addMonthsToYmd(new Date().toISOString().slice(0, 10), 1),
  setupGuideUrl: DEFAULT_SETUP_GUIDE_PATH,
});

function accountPath(token: string) {
  return `/account/${token}`;
}

function statusDot(tone: "green" | "orange" | "expired") {
  if (tone === "green") return "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]";
  if (tone === "orange") return "bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]";
  return "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]";
}

export function AdminPanel() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [autoExpiry, setAutoExpiry] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [createdLink, setCreatedLink] = useState("");
  const [loginError, setLoginError] = useState("");

  const loadCustomers = async () => {
    const response = await fetch("/api/admin/customers", { cache: "no-store" });
    if (response.status === 401) {
      setAuthed(false);
      setChecking(false);
      return;
    }

    if (!response.ok) {
      setError("Αποτυχία φόρτωσης πελατών.");
      setChecking(false);
      return;
    }

    const payload = (await response.json()) as { customers: Customer[]; store: StoreInfo };
    setCustomers(payload.customers);
    setStore(payload.store);
    setAuthed(true);
    setChecking(false);
  };

  useEffect(() => {
    void loadCustomers();
  }, []);

  useEffect(() => {
    if (!autoExpiry) return;
    setForm((current) => ({
      ...current,
      expiresAt: addMonthsToYmd(current.activatedAt, getPackageMonths(current.packageId)),
    }));
  }, [autoExpiry, form.activatedAt, form.packageId]);

  const stats = useMemo(() => {
    const views = customers.map((customer) => daysRemainingFromExpiry(customer.expiresAt));
    return {
      total: customers.length,
      active: views.filter((days) => days > 30).length,
      soon: views.filter((days) => days > 0 && days <= 30).length,
      expired: views.filter((days) => days <= 0).length,
    };
  }, [customers]);

  const login = async () => {
    setLoginError("");
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      setLoginError(payload.error ?? "Αποτυχία σύνδεσης.");
      return;
    }

    setPassword("");
    await loadCustomers();
  };

  const logout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
    setCustomers([]);
  };

  const copyText = async (value: string, okMessage: string) => {
    await navigator.clipboard.writeText(value);
    setNotice(okMessage);
  };

  const submit = async () => {
    setSaving(true);
    setError("");
    setNotice("");

    const response = await fetch(
      editingId ? `/api/admin/customers/${editingId}` : "/api/admin/customers",
      {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      },
    );

    const payload = (await response.json()) as { customer?: Customer; error?: string };
    setSaving(false);

    if (!response.ok || !payload.customer) {
      setError(payload.error ?? "Αποτυχία αποθήκευσης.");
      return;
    }

    const origin = window.location.origin;
    const link = `${origin}${accountPath(payload.customer.token)}`;
    setCreatedLink(link);
    setNotice(editingId ? "Ο πελάτης ενημερώθηκε." : "Ο πελάτης δημιουργήθηκε.");
    setEditingId(null);
    setAutoExpiry(true);
    setForm(emptyForm());
    await loadCustomers();
  };

  const startEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setAutoExpiry(false);
    setForm({
      name: customer.name,
      packageId: customer.packageId,
      activatedAt: customer.activatedAt,
      expiresAt: customer.expiresAt,
      setupGuideUrl: customer.setupGuideUrl,
    });
    setCreatedLink(`${window.location.origin}${accountPath(customer.token)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const remove = async (customer: Customer) => {
    if (!window.confirm(`Διαγραφή του πελάτη «${customer.name}»;`)) return;

    const response = await fetch(`/api/admin/customers/${customer.id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Αποτυχία διαγραφής.");
      return;
    }

    if (editingId === customer.id) {
      setEditingId(null);
      setForm(emptyForm());
    }
    await loadCustomers();
  };

  const regenerate = async (customer: Customer) => {
    if (!window.confirm("Το παλιό Magic Link θα σταματήσει να δουλεύει. Συνέχεια;")) return;

    const response = await fetch(`/api/admin/customers/${customer.id}?action=regenerate`, {
      method: "POST",
    });
    const payload = (await response.json()) as { customer?: Customer; error?: string };
    if (!response.ok || !payload.customer) {
      setError(payload.error ?? "Αποτυχία νέου link.");
      return;
    }

    const link = `${window.location.origin}${accountPath(payload.customer.token)}`;
    setCreatedLink(link);
    setNotice("Δημιουργήθηκε νέο Magic Link.");
    await loadCustomers();
  };

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-text-muted">
        Φόρτωση admin…
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4">
        <div className="rounded-3xl border border-gold/25 bg-[#0B0B0B] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/25 bg-gold/10 px-3 py-1 text-[11px] font-bold tracking-[0.16em] text-gold uppercase">
            <Shield className="h-3.5 w-3.5" />
            Admin Access
          </div>
          <h1 className="font-display text-3xl font-black text-white">GRVIP Admin</h1>
          <p className="mt-2 text-sm text-text-muted">
            Κρυφό panel διαχείρισης πελατών και Magic Links.
          </p>
          <label className="mt-6 block text-xs font-semibold tracking-[0.14em] text-text-dim uppercase">
            Κωδικός
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") void login();
            }}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none ring-gold/40 focus:border-gold/40 focus:ring-2"
          />
          {loginError ? <p className="mt-3 text-sm text-rose-400">{loginError}</p> : null}
          <Button fullWidth className="mt-5 font-extrabold" onClick={() => void login()}>
            Είσοδος
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-premium py-8 md:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-gold uppercase">Customer Control</p>
          <h1 className="mt-1 font-display text-3xl font-black text-white md:text-4xl">
            Admin Πελατών
          </h1>
          <p className="mt-2 max-w-xl text-sm text-text-muted">
            Δημιούργησε Magic Links, δες ημέρες που απομένουν και άνοιξε την προσωπική σελίδα κάθε πελάτη.
          </p>
        </div>
        <Button variant="outline" onClick={() => void logout()}>
          <LogOut className="h-4 w-4" />
          Έξοδος
        </Button>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        {[
          { label: "Σύνολο", value: stats.total },
          { label: "Ενεργές", value: stats.active },
          { label: "Λήγουν σύντομα", value: stats.soon },
          { label: "Έληξαν", value: stats.expired },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-[#0B0B0B] p-4">
            <p className="text-[11px] font-bold tracking-[0.14em] text-text-dim uppercase">{item.label}</p>
            <p className="mt-1 font-display text-2xl font-black text-white">{item.value}</p>
          </div>
        ))}
      </div>

      {store?.warning ? (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          {store.warning}
        </div>
      ) : (
        <p className="mb-6 text-xs text-text-dim">
          Αποθήκευση: {store?.backend === "upstash" ? "Upstash Redis (persistent)" : "τοπικό αρχείο"}
        </p>
      )}

      <section className="mb-8 rounded-3xl border border-gold/20 bg-[#0B0B0B] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-6">
        <h2 className="font-display text-xl font-bold text-white">
          {editingId ? "Επεξεργασία πελάτη" : "Δημιουργία νέου πελάτη"}
        </h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Ονοματεπώνυμο πελάτη">
            <input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              className="admin-input"
              placeholder="π.χ. Γιάννης Παπαδόπουλος"
            />
          </Field>
          <Field label="Πακέτο">
            <select
              value={form.packageId}
              onChange={(event) => {
                setAutoExpiry(true);
                setForm((current) => ({
                  ...current,
                  packageId: event.target.value as FormState["packageId"],
                }));
              }}
              className="admin-input"
            >
              {CUSTOMER_PACKAGES.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Ημερομηνία ενεργοποίησης">
            <input
              type="date"
              value={form.activatedAt}
              onChange={(event) => setForm((current) => ({ ...current, activatedAt: event.target.value }))}
              className="admin-input"
            />
          </Field>
          <Field label="Ημερομηνία λήξης">
            <input
              type="date"
              value={form.expiresAt}
              onChange={(event) => {
                setAutoExpiry(false);
                setForm((current) => ({ ...current, expiresAt: event.target.value }));
              }}
              className="admin-input"
            />
          </Field>
          <Field label="Link για οδηγό εγκατάστασης" className="md:col-span-2">
            <input
              value={form.setupGuideUrl}
              onChange={(event) => setForm((current) => ({ ...current, setupGuideUrl: event.target.value }))}
              className="admin-input"
              placeholder="/odigos-egkatastasis"
            />
          </Field>
        </div>

        {error ? <p className="mt-4 text-sm text-rose-400">{error}</p> : null}
        {notice ? <p className="mt-4 text-sm text-emerald-400">{notice}</p> : null}

        {createdLink ? (
          <div className="mt-4 rounded-2xl border border-gold/25 bg-gold/8 p-4">
            <p className="text-xs font-bold tracking-[0.14em] text-gold uppercase">Magic Link</p>
            <p className="mt-2 break-all text-sm text-white">{createdLink}</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button
                variant="outline"
                className="sm:flex-1"
                onClick={() => void copyText(createdLink, "Το Magic Link αντιγράφηκε.")}
              >
                <Copy className="h-4 w-4" />
                Αντιγραφή link
              </Button>
              <Button href={createdLink.replace(window.location.origin, "")} className="sm:flex-1">
                <ExternalLink className="h-4 w-4" />
                Άνοιγμα σελίδας πελάτη
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button onClick={() => void submit()} disabled={saving} className="font-extrabold sm:min-w-56">
            <Plus className="h-4 w-4" />
            {editingId ? "Αποθήκευση αλλαγών" : "Δημιουργία Πελάτη"}
          </Button>
          {editingId ? (
            <Button
              variant="ghost"
              onClick={() => {
                setEditingId(null);
                setAutoExpiry(true);
                setForm(emptyForm());
              }}
            >
              Ακύρωση
            </Button>
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="mb-4 font-display text-xl font-bold text-white">Λίστα πελατών</h2>
        {customers.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0B0B0B] p-8 text-center text-text-muted">
            Δεν υπάρχουν πελάτες ακόμα.
          </div>
        ) : (
          <div className="grid gap-4">
            {customers.map((customer) => {
              const days = daysRemainingFromExpiry(customer.expiresAt);
              const status = adminStatusFromDays(days);
              const link = accountPath(customer.token);

              return (
                <article
                  key={customer.id}
                  className="rounded-2xl border border-white/10 bg-[#0B0B0B] p-4 sm:p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg font-bold text-white">{customer.name}</h3>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold text-text-muted">
                          <span className={cn("h-2 w-2 rounded-full", statusDot(status.tone))} />
                          {status.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gold">{getPackageLabel(customer.packageId)}</p>
                      <div className="mt-3 grid gap-1 text-sm text-text-muted sm:grid-cols-3">
                        <p>Ενεργοποίηση: {customer.activatedAt}</p>
                        <p>Λήξη: {customer.expiresAt}</p>
                        <p>
                          Απομένουν:{" "}
                          <span className="font-semibold text-white">
                            {days > 0 ? `${days} ημέρες` : "0 ημέρες"}
                          </span>
                        </p>
                      </div>
                      <p className="mt-2 break-all text-xs text-text-dim">{link}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                      <Button variant="outline" onClick={() => startEdit(customer)}>
                        <Pencil className="h-4 w-4" />
                        Επεξεργασία
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          void copyText(`${window.location.origin}${link}`, "Το Magic Link αντιγράφηκε.")
                        }
                      >
                        <Copy className="h-4 w-4" />
                        Αντιγραφή
                      </Button>
                      <Button href={link} variant="outline">
                        <ExternalLink className="h-4 w-4" />
                        Άνοιγμα
                      </Button>
                      <Button variant="outline" onClick={() => void regenerate(customer)}>
                        <RefreshCw className="h-4 w-4" />
                        Νέο link
                      </Button>
                      <Button variant="ghost" onClick={() => void remove(customer)}>
                        <Trash2 className="h-4 w-4" />
                        Διαγραφή
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-xs font-semibold tracking-[0.12em] text-text-dim uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
