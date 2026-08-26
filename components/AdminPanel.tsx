"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Copy,
  ExternalLink,
  History,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
} from "lucide-react";
import { AdminPricingManager } from "@/components/admin/AdminPricingManager";
import {
  AdminMessagesModal,
  AdminRenewModal,
  AdminSpecialOfferModal,
} from "@/components/admin/AdminCrmModals";
import { AdminCustomerProfile } from "@/components/admin/AdminCustomerProfile";
import { AdminNotificationCenter } from "@/components/admin/AdminNotificationCenter";
import { AdminProspectsManager } from "@/components/admin/AdminProspectsManager";
import { AdminSubscriptionHistory } from "@/components/admin/AdminSubscriptionHistory";
import { Button } from "@/components/ui/Button";
import { formatEuro } from "@/lib/customers/pricing";
import { expiringSoonMessage } from "@/lib/customers/messages";
import { addMonthsToYmd, adminStatusFromDays, getPackageMonths } from "@/lib/customers/status";
import {
  CUSTOMER_PACKAGES,
  DEFAULT_SETUP_GUIDE_PATH,
  type AdminNotification,
  type CustomerInput,
  type CustomerStatus,
  type CustomerTag,
  type CustomerView,
  type DashboardStats,
  type PackageId,
  type PackagePricing,
  type Prospect,
  type ProspectInput,
} from "@/lib/customers/types";
import { cn } from "@/lib/cn";

type StoreInfo = {
  backend: "upstash" | "file";
  persistent: boolean;
  warning: string | null;
};

type FormState = CustomerInput;
type ListFilter = "all" | CustomerStatus;

const emptyDashboard: DashboardStats = {
  totalCustomers: 0,
  activeSubscriptions: 0,
  expiringSoon: 0,
  expiredSubscriptions: 0,
  totalRevenue: 0,
  totalCost: 0,
  totalProfit: 0,
  monthRevenue: 0,
  monthProfit: 0,
  topProfitPackageId: null,
  topProfitPackageName: null,
  topProfitPackageAmount: 0,
};

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

function formatDate(iso: string) {
  const [year, month, day] = iso.slice(0, 10).split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}

const actionBtnClass =
  "h-auto min-h-10 w-full min-w-0 px-2 py-2 text-[11px] leading-tight whitespace-normal sm:min-h-0 sm:w-auto sm:px-6 sm:py-3 sm:text-base";

export function AdminPanel() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [customers, setCustomers] = useState<CustomerView[]>([]);
  const [pricing, setPricing] = useState<PackagePricing[]>([]);
  const [dashboard, setDashboard] = useState<DashboardStats>(emptyDashboard);
  const [store, setStore] = useState<StoreInfo | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [autoExpiry, setAutoExpiry] = useState(true);
  const [saving, setSaving] = useState(false);
  const [renewing, setRenewing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [createdLink, setCreatedLink] = useState("");
  const [loginError, setLoginError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<ListFilter>("all");
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);
  const [messagesFor, setMessagesFor] = useState<CustomerView | null>(null);
  const [renewFor, setRenewFor] = useState<CustomerView | null>(null);
  const [specialFor, setSpecialFor] = useState<CustomerView | null>(null);
  const [profileFor, setProfileFor] = useState<CustomerView | null>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [tags, setTags] = useState<CustomerTag[]>([]);
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [prospects, setProspects] = useState<Prospect[]>([]);

  const refreshProfile = (list: CustomerView[], id?: string | null) => {
    if (!id) return;
    const next = list.find((item) => item.id === id) ?? null;
    setProfileFor(next);
  };

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

    const payload = (await response.json()) as {
      customers: CustomerView[];
      dashboard: DashboardStats;
      pricing: PackagePricing[];
      notifications?: AdminNotification[];
      tags?: CustomerTag[];
      prospects?: Prospect[];
      store: StoreInfo;
    };
    setCustomers(payload.customers);
    setDashboard(payload.dashboard ?? emptyDashboard);
    setPricing(payload.pricing ?? []);
    setNotifications(payload.notifications ?? []);
    setTags(payload.tags ?? []);
    setProspects(payload.prospects ?? []);
    setStore(payload.store);
    setAuthed(true);
    setChecking(false);
    refreshProfile(payload.customers, profileFor?.id ?? null);
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

  const expiringSoon = useMemo(
    () => customers.filter((customer) => customer.status === "expiring"),
    [customers],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("el");
    return customers.filter((customer) => {
      if (filter !== "all" && customer.status !== filter) return false;
      if (tagFilter !== "all" && !(customer.tagIds ?? []).includes(tagFilter)) return false;
      if (!needle) return true;
      return customer.name.toLocaleLowerCase("el").includes(needle);
    });
  }, [customers, filter, query, tagFilter]);

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

    const payload = (await response.json()) as { customer?: CustomerView; error?: string };
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

  const startEdit = (customer: CustomerView) => {
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

  const remove = async (customer: CustomerView) => {
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

  const regenerate = async (customer: CustomerView) => {
    if (!window.confirm("Το παλιό Magic Link θα σταματήσει να δουλεύει. Συνέχεια;")) return;

    const response = await fetch(`/api/admin/customers/${customer.id}?action=regenerate`, {
      method: "POST",
    });
    const payload = (await response.json()) as { customer?: CustomerView; error?: string };
    if (!response.ok || !payload.customer) {
      setError(payload.error ?? "Αποτυχία νέου link.");
      return;
    }

    const link = `${window.location.origin}${accountPath(payload.customer.token)}`;
    setCreatedLink(link);
    setNotice("Δημιουργήθηκε νέο Magic Link.");
    await loadCustomers();
  };

  const savePricing = async (next: PackagePricing[]) => {
    const response = await fetch("/api/admin/pricing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pricing: next }),
    });
    const payload = (await response.json()) as { pricing?: PackagePricing[]; error?: string };
    if (!response.ok) return payload.error ?? "Αποτυχία αποθήκευσης τιμών.";
    if (payload.pricing) setPricing(payload.pricing);
    return null;
  };

  const confirmRenew = async (packageId: PackageId) => {
    if (!renewFor) return;
    setRenewing(true);
    setError("");
    const response = await fetch(`/api/admin/customers/${renewFor.id}/renew`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId }),
    });
    const payload = (await response.json()) as { customer?: CustomerView; error?: string };
    setRenewing(false);
    if (!response.ok || !payload.customer) {
      setError(payload.error ?? "Αποτυχία ανανέωσης.");
      return;
    }
    setRenewFor(null);
    setNotice(`Η ανανέωση του «${payload.customer.name}» καταγράφηκε. Το Magic Link έμεινε το ίδιο.`);
    await loadCustomers();
  };

  const confirmSpecial = async (packageId: PackageId, amountPaid: number) => {
    if (!specialFor) return;
    setRenewing(true);
    setError("");
    const response = await fetch(`/api/admin/customers/${specialFor.id}/renew`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        packageId,
        amountPaid,
        priceType: "CUSTOMER_SPECIAL_OFFER",
      }),
    });
    const payload = (await response.json()) as { customer?: CustomerView; error?: string };
    setRenewing(false);
    if (!response.ok || !payload.customer) {
      setError(payload.error ?? "Αποτυχία ειδικής προσφοράς.");
      return;
    }
    setSpecialFor(null);
    setNotice(`Ειδική προσφορά εφαρμόστηκε στον «${payload.customer.name}».`);
    await loadCustomers();
  };

  const syncCustomerTags = async (customerId: string, tagIds: string[]) => {
    const response = await fetch(`/api/admin/customers/${customerId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagIds }),
    });
    if (!response.ok) {
      setError("Αποτυχία ενημέρωσης tags.");
      return;
    }
    await loadCustomers();
  };

  const createTag = async (name: string, emoji: string) => {
    const response = await fetch("/api/admin/tags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, emoji }),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      setError(payload.error ?? "Αποτυχία δημιουργίας tag.");
      return;
    }
    await loadCustomers();
  };

  const addNote = async (customerId: string, content: string) => {
    const response = await fetch(`/api/admin/customers/${customerId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    if (!response.ok) {
      setError("Αποτυχία σημείωσης.");
      return;
    }
    await loadCustomers();
  };

  const updateNote = async (noteId: string, content: string) => {
    const response = await fetch(`/api/admin/customers/${noteId}/notes`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId, content }),
    });
    if (!response.ok) {
      setError("Αποτυχία ενημέρωσης σημείωσης.");
      return;
    }
    await loadCustomers();
  };

  const deleteNote = async (noteId: string) => {
    const response = await fetch(`/api/admin/customers/${noteId}/notes?noteId=${noteId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setError("Αποτυχία διαγραφής σημείωσης.");
      return;
    }
    await loadCustomers();
  };

  const createProspect = async (input: ProspectInput) => {
    const response = await fetch("/api/admin/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(payload.error || "Αποτυχία δημιουργίας πιθανού πελάτη.");
    }
    await loadCustomers();
  };

  const updateProspect = async (id: string, input: ProspectInput) => {
    const response = await fetch(`/api/admin/prospects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(payload.error || "Αποτυχία ενημέρωσης πιθανού πελάτη.");
    }
    await loadCustomers();
  };

  const deleteProspect = async (id: string) => {
    const response = await fetch(`/api/admin/prospects/${id}`, { method: "DELETE" });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) {
      throw new Error(payload.error || "Αποτυχία διαγραφής πιθανού πελάτη.");
    }
    await loadCustomers();
  };

  const openNotification = (notification: AdminNotification) => {
    setNotificationsOpen(false);
    if (notification.kind === "expiring_soon") setFilter("expiring");
    else if (notification.kind === "expired" || notification.kind === "expired_today") setFilter("expired");
    else setFilter("all");
    const customer = customers.find((item) => item.id === notification.customerId);
    if (customer) setProfileFor(customer);
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
            Κρυφό panel διαχείρισης συνδρομών, τιμών και Magic Links.
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
    <div className="container-premium min-w-0 overflow-x-hidden py-8 md:py-12">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.18em] text-gold uppercase">Subscription CRM</p>
          <h1 className="mt-1 font-display text-3xl font-black text-white md:text-4xl">
            Admin Πελατών
          </h1>
          <p className="mt-2 max-w-xl text-sm text-text-muted">
            Live στατιστικά, ανανεώσεις, ιστορικό πληρωμών και κεντρικές τιμές — χωρίς αλλαγή στα Magic Links.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <AdminNotificationCenter
            notifications={notifications}
            open={notificationsOpen}
            onToggle={() => setNotificationsOpen((current) => !current)}
            onSelect={openNotification}
          />
          <Button variant="outline" onClick={() => void logout()}>
            <LogOut className="h-4 w-4" />
            Έξοδος
          </Button>
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Σύνολο Πελατών", value: String(dashboard.totalCustomers), icon: "👥" },
          { label: "Ενεργές Συνδρομές", value: String(dashboard.activeSubscriptions), icon: "🟢" },
          { label: "Λήγουν Σύντομα", value: String(dashboard.expiringSoon), icon: "🟠" },
          { label: "Ληγμένες Συνδρομές", value: String(dashboard.expiredSubscriptions), icon: "🔴" },
          { label: "Συνολικά Έσοδα", value: formatEuro(dashboard.totalRevenue), icon: "💰" },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 bg-[#0B0B0B] p-4">
            <p className="text-[11px] font-bold tracking-[0.14em] text-text-dim uppercase">
              {item.icon} {item.label}
            </p>
            <p className="mt-1 font-display text-2xl font-black text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[
          { label: "Συνολικό κόστος", value: formatEuro(dashboard.totalCost), icon: "📦" },
          { label: "Καθαρό κέρδος", value: formatEuro(dashboard.totalProfit), icon: "📈" },
          { label: "Έσοδα μήνα", value: formatEuro(dashboard.monthRevenue), icon: "📅" },
          { label: "Κέρδος μήνα", value: formatEuro(dashboard.monthProfit), icon: "📈" },
          {
            label: "Top πακέτο κέρδους",
            value: dashboard.topProfitPackageName
              ? `${dashboard.topProfitPackageName} · ${formatEuro(dashboard.topProfitPackageAmount)}`
              : "—",
            icon: "👑",
          },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-gold/15 bg-[#0B0B0B] p-4">
            <p className="text-[11px] font-bold tracking-[0.14em] text-text-dim uppercase">
              {item.icon} {item.label}
            </p>
            <p className="mt-1 font-display text-xl font-black text-white">{item.value}</p>
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

      <AdminPricingManager pricing={pricing} onChange={setPricing} onSave={savePricing} />

      <AdminProspectsManager
        prospects={prospects}
        onCreate={createProspect}
        onUpdate={updateProspect}
        onDelete={deleteProspect}
      />

      <section className="mb-8 rounded-3xl border border-amber-500/25 bg-[#0B0B0B] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-6">
        <h2 className="font-display text-xl font-bold text-white">⚠️ Λήγουν Σύντομα</h2>
        <p className="mt-1 text-sm text-text-muted">
          Πελάτες με 1 έως 7 ημέρες μέχρι τη λήξη, βάσει της σημερινής ημερομηνίας.
        </p>
        {expiringSoon.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-text-muted">
            Κανένας πελάτης δεν λήγει τις επόμενες 7 ημέρες.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {expiringSoon.map((customer) => (
              <article key={customer.id} className="rounded-2xl border border-amber-500/20 bg-black/30 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">{customer.name}</h3>
                    <p className="text-sm text-gold">{customer.packageLabel}</p>
                    <p className="mt-1 text-sm text-text-muted">
                      Λήξη {formatDate(customer.expiresAt)} · {customer.daysRemaining}{" "}
                      {customer.daysRemaining === 1 ? "ημέρα" : "ημέρες"} · 💰 {formatEuro(customer.totalPaid)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button onClick={() => setRenewFor(customer)}>
                      <RefreshCw className="h-4 w-4" />
                      Ανανέωση
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void copyText(expiringSoonMessage(customer), "Το μήνυμα αντιγράφηκε.")}
                    >
                      <Copy className="h-4 w-4" />
                      Αντιγραφή μηνύματος
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8 overflow-hidden rounded-3xl border border-gold/20 bg-[#0B0B0B] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] sm:p-6">
        <h2 className="font-display text-xl font-bold text-white">
          {editingId ? "Επεξεργασία πελάτη" : "Δημιουργία νέου πελάτη"}
        </h2>
        <div className="mt-5 grid min-w-0 gap-4 md:grid-cols-2">
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
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <h2 className="font-display text-xl font-bold text-white">Λίστα πελατών</h2>
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-text-dim" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="admin-input pl-10"
              placeholder="Αναζήτηση με όνομα"
            />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {(
            [
              ["all", "Όλοι"],
              ["active", "Ενεργοί"],
              ["expiring", "Λήγουν σύντομα"],
              ["expired", "Ληγμένοι"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-bold tracking-[0.12em] uppercase",
                filter === id
                  ? "border-gold/40 bg-gold/15 text-gold"
                  : "border-white/10 bg-black/30 text-text-muted hover:border-gold/20",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="self-center text-xs font-bold tracking-[0.12em] text-text-dim uppercase">
            🏷️ Tag
          </span>
          <button
            type="button"
            onClick={() => setTagFilter("all")}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold",
              tagFilter === "all"
                ? "border-gold/40 bg-gold/15 text-gold"
                : "border-white/10 bg-black/30 text-text-muted",
            )}
          >
            Όλα
          </button>
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setTagFilter(tag.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                tagFilter === tag.id
                  ? "border-gold/40 bg-gold/15 text-gold"
                  : "border-white/10 bg-black/30 text-text-muted",
              )}
            >
              {tag.emoji} {tag.name}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0B0B0B] p-8 text-center text-text-muted">
            Δεν υπάρχουν πελάτες σε αυτή την κατηγορία.
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((customer) => {
              const status = adminStatusFromDays(customer.daysRemaining);
              const link = accountPath(customer.token);
              const open = historyOpen === customer.id;

              return (
                <article
                  key={customer.id}
                  className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0B] p-4 sm:p-5"
                >
                  <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-display text-lg font-bold text-white">{customer.name}</h3>
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold text-text-muted">
                          <span className={cn("h-2 w-2 rounded-full", statusDot(status.tone))} />
                          {status.label}
                        </span>
                      </div>
                      {(customer.tags ?? []).length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {customer.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="rounded-full border border-gold/20 bg-gold/10 px-2 py-0.5 text-[11px] font-semibold text-gold"
                            >
                              {tag.emoji} {tag.name}
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <p className="mt-1 text-sm text-gold">{customer.packageLabel}</p>
                      <div className="mt-3 grid gap-1 text-sm text-text-muted sm:grid-cols-3">
                        <p>Ενεργοποίηση: {formatDate(customer.activatedAt)}</p>
                        <p>Λήξη: {formatDate(customer.expiresAt)}</p>
                        <p>
                          Απομένουν:{" "}
                          <span className="font-semibold text-white">
                            {customer.daysRemaining > 0 ? `${customer.daysRemaining} ημέρες` : "0 ημέρες"}
                          </span>
                        </p>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-white">
                        💰 Σύνολο πληρωμών: {formatEuro(customer.totalPaid)} · 📈 Κέρδος:{" "}
                        {formatEuro(customer.totalProfit)}
                      </p>
                      <p className="mt-2 break-all text-xs text-text-dim">{link}</p>
                    </div>
                    <div className="grid w-full min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                      <Button
                        variant="outline"
                        className={actionBtnClass}
                        onClick={() => setProfileFor(customer)}
                      >
                        Προφίλ
                      </Button>
                      <Button className={actionBtnClass} onClick={() => setRenewFor(customer)}>
                        <RefreshCw className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                        Ανανέωση
                      </Button>
                      <Button
                        variant="outline"
                        className={actionBtnClass}
                        onClick={() => setSpecialFor(customer)}
                      >
                        🎁 Ειδική
                      </Button>
                      <Button
                        variant="outline"
                        className={actionBtnClass}
                        onClick={() => setMessagesFor(customer)}
                      >
                        💬 Μηνύματα
                      </Button>
                      <Button
                        variant="outline"
                        className={actionBtnClass}
                        onClick={() => startEdit(customer)}
                      >
                        <Pencil className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                        Επεξεργασία
                      </Button>
                      <Button
                        variant="outline"
                        className={actionBtnClass}
                        onClick={() =>
                          void copyText(`${window.location.origin}${link}`, "Το Magic Link αντιγράφηκε.")
                        }
                      >
                        <Copy className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                        Αντιγραφή
                      </Button>
                      <Button href={link} variant="outline" className={actionBtnClass}>
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                        Άνοιγμα
                      </Button>
                      <Button
                        variant="outline"
                        className={cn(actionBtnClass, open && "border-gold/50 bg-gold/10 text-gold")}
                        onClick={() => setHistoryOpen(open ? null : customer.id)}
                      >
                        <History className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                        Ιστορικό
                      </Button>
                      <Button
                        variant="outline"
                        className={actionBtnClass}
                        onClick={() => void regenerate(customer)}
                      >
                        <RefreshCw className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                        Νέο link
                      </Button>
                      <Button
                        variant="ghost"
                        className={actionBtnClass}
                        onClick={() => void remove(customer)}
                      >
                        <Trash2 className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                        Διαγραφή
                      </Button>
                    </div>
                  </div>

                  {open ? (
                    <AdminSubscriptionHistory subscriptions={customer.subscriptions} />
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {messagesFor ? (
        <AdminMessagesModal
          customer={messagesFor}
          origin={window.location.origin}
          onClose={() => setMessagesFor(null)}
          onCopied={setNotice}
        />
      ) : null}

      {renewFor ? (
        <AdminRenewModal
          customer={renewFor}
          pricing={pricing}
          saving={renewing}
          onClose={() => setRenewFor(null)}
          onConfirm={(packageId) => void confirmRenew(packageId)}
        />
      ) : null}

      {specialFor ? (
        <AdminSpecialOfferModal
          customer={specialFor}
          pricing={pricing}
          saving={renewing}
          onClose={() => setSpecialFor(null)}
          onConfirm={(packageId, amountPaid) => void confirmSpecial(packageId, amountPaid)}
        />
      ) : null}

      {profileFor ? (
        <AdminCustomerProfile
          customer={profileFor}
          allTags={tags}
          onClose={() => setProfileFor(null)}
          onRenew={() => {
            setRenewFor(profileFor);
          }}
          onSpecial={() => {
            setSpecialFor(profileFor);
          }}
          onMessages={() => {
            setMessagesFor(profileFor);
          }}
          onEdit={() => {
            startEdit(profileFor);
            setProfileFor(null);
          }}
          onDelete={() => {
            void remove(profileFor);
            setProfileFor(null);
          }}
          onCopyLink={() =>
            void copyText(
              `${window.location.origin}${accountPath(profileFor.token)}`,
              "Το Magic Link αντιγράφηκε.",
            )
          }
          onTagsChange={(tagIds) => syncCustomerTags(profileFor.id, tagIds)}
          onCreateTag={createTag}
          onAddNote={(content) => addNote(profileFor.id, content)}
          onUpdateNote={updateNote}
          onDeleteNote={deleteNote}
        />
      ) : null}
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
    <label className={cn("block min-w-0", className)}>
      <span className="mb-2 block text-xs font-semibold tracking-[0.12em] text-text-dim uppercase">
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </label>
  );
}
