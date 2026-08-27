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
import { AdminServersManager } from "@/components/admin/AdminServersManager";
import { AdminSubscriptionHistory } from "@/components/admin/AdminSubscriptionHistory";
import { Button } from "@/components/ui/Button";
import { formatEuro } from "@/lib/customers/pricing";
import { expiringSoonMessage } from "@/lib/customers/messages";
import {
  adminStatusFromDays,
  computePackageExpiry,
  isTrialPackage,
} from "@/lib/customers/status";
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
  type Server,
  type ServerInput,
} from "@/lib/customers/types";
import { cn } from "@/lib/cn";

type StoreInfo = {
  backend: "upstash" | "file";
  persistent: boolean;
  warning: string | null;
};

type FormState = CustomerInput;
type ListFilter = "all" | CustomerStatus;
type AdminTab = "overview" | "customers" | "pricing" | "prospects" | "servers";

const ADMIN_TABS: { id: AdminTab; label: string }[] = [
  { id: "overview", label: "Επισκόπηση" },
  { id: "customers", label: "Πελάτες" },
  { id: "servers", label: "Servers" },
  { id: "pricing", label: "Τιμές" },
  { id: "prospects", label: "Πιθανοί" },
];

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

const emptyForm = (serverId = ""): FormState => {
  const activatedAt = new Date().toISOString().slice(0, 10);
  return {
    name: "",
    packageId: "1-month",
    activatedAt,
    expiresAt: computePackageExpiry("1-month", activatedAt),
    setupGuideUrl: DEFAULT_SETUP_GUIDE_PATH,
    serverId,
  };
};

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
  "h-9 min-h-9 w-full min-w-0 justify-center px-2.5 py-1.5 text-[11px] leading-tight whitespace-nowrap sm:h-9 sm:px-3 sm:py-2 sm:text-xs";

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
  const [servers, setServers] = useState<Server[]>([]);
  const [tab, setTab] = useState<AdminTab>("overview");
  const [showCreateForm, setShowCreateForm] = useState(false);

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
      servers?: Server[];
      store: StoreInfo;
    };
    setCustomers(payload.customers);
    setDashboard(payload.dashboard ?? emptyDashboard);
    setPricing(payload.pricing ?? []);
    setNotifications(payload.notifications ?? []);
    setTags(payload.tags ?? []);
    setProspects(payload.prospects ?? []);
    setServers(payload.servers ?? []);
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
      expiresAt: computePackageExpiry(current.packageId, current.activatedAt),
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
    setTab("customers");
    setShowCreateForm(true);
    setEditingId(customer.id);
    setAutoExpiry(false);
    setForm({
      name: customer.name,
      packageId: customer.packageId,
      activatedAt: customer.activatedAt.slice(0, 10),
      expiresAt: customer.expiresAt,
      setupGuideUrl: customer.setupGuideUrl,
      serverId: customer.serverId ?? "",
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

  const confirmRenew = async (packageId: PackageId, serverId?: string) => {
    if (!renewFor) return;
    setRenewing(true);
    setError("");
    const response = await fetch(`/api/admin/customers/${renewFor.id}/renew`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ packageId, serverId }),
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

  const confirmSpecial = async (packageId: PackageId, amountPaid: number, serverId?: string) => {
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
        serverId,
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

  const createServerRecord = async (input: ServerInput) => {
    const response = await fetch("/api/admin/servers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) throw new Error(payload.error || "Αποτυχία δημιουργίας server.");
    await loadCustomers();
  };

  const updateServerRecord = async (id: string, input: ServerInput) => {
    const response = await fetch(`/api/admin/servers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) throw new Error(payload.error || "Αποτυχία ενημέρωσης server.");
    await loadCustomers();
  };

  const deleteServerRecord = async (id: string) => {
    const response = await fetch(`/api/admin/servers/${id}`, { method: "DELETE" });
    const payload = (await response.json()) as { error?: string };
    if (!response.ok) throw new Error(payload.error || "Αποτυχία διαγραφής server.");
    await loadCustomers();
  };

  const openNotification = (notification: AdminNotification) => {
    setNotificationsOpen(false);
    if (notification.kind === "expiring_soon") {
      setFilter("expiring");
      setTab("overview");
    } else if (notification.kind === "expired" || notification.kind === "expired_today") {
      setFilter("expired");
      setTab("customers");
    } else {
      setFilter("all");
      setTab("customers");
    }
    const customer = customers.find((item) => item.id === notification.customerId);
    if (customer) setProfileFor(customer);
  };

  const prospectsDue = useMemo(() => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const local = new Date(today.getTime() - offset * 60_000);
    const todayYmd = local.toISOString().slice(0, 10);
    return prospects.filter((item) => item.contactAt <= todayYmd).length;
  }, [prospects]);

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
    <div className="mx-auto w-full max-w-5xl min-w-0 overflow-x-hidden px-4 py-4 sm:px-6 sm:py-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h1 className="font-display text-xl font-black text-white sm:text-2xl">GRVIP Admin</h1>
        <div className="flex items-center gap-2">
          <AdminNotificationCenter
            notifications={notifications}
            open={notificationsOpen}
            onToggle={() => setNotificationsOpen((current) => !current)}
            onSelect={openNotification}
          />
          <Button
            variant="outline"
            className="h-9 px-2.5 py-2 text-xs sm:px-3 sm:py-2 sm:text-xs"
            onClick={() => void logout()}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Έξοδος</span>
          </Button>
        </div>
      </div>

      <nav className="mb-4 flex gap-1 overflow-x-auto border-b border-white/10 pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {ADMIN_TABS.map((item) => {
          const badge =
            item.id === "customers"
              ? dashboard.totalCustomers
              : item.id === "overview"
                ? dashboard.expiringSoon
                : item.id === "prospects"
                  ? prospectsDue
                  : null;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-2 text-sm font-semibold transition-colors",
                tab === item.id
                  ? "border-gold text-gold"
                  : "border-transparent text-text-muted hover:text-white",
              )}
            >
              {item.label}
              {badge != null && badge > 0 ? (
                <span
                  className={cn(
                    "ml-1.5 rounded px-1.5 py-0.5 text-[10px] font-bold",
                    item.id === "overview" || item.id === "prospects"
                      ? "bg-amber-500/20 text-amber-200"
                      : "bg-white/10 text-text-dim",
                  )}
                >
                  {badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {tab === "overview" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-3 md:grid-cols-3">
            {[
              { label: "Πελάτες", value: String(dashboard.totalCustomers) },
              { label: "Ενεργοί", value: String(dashboard.activeSubscriptions) },
              { label: "Λήγουν", value: String(dashboard.expiringSoon) },
              { label: "Ληγμένοι", value: String(dashboard.expiredSubscriptions) },
              { label: "Έσοδα", value: formatEuro(dashboard.totalRevenue) },
              { label: "Κέρδος", value: formatEuro(dashboard.totalProfit) },
              { label: "Κόστος", value: formatEuro(dashboard.totalCost) },
              { label: "Κέρδος μήνα", value: formatEuro(dashboard.monthProfit) },
              {
                label: "Top πακέτο",
                value: dashboard.topProfitPackageName
                  ? `${dashboard.topProfitPackageName}`
                  : "—",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-white/10 bg-[#0B0B0B] px-3 py-2.5"
              >
                <p className="text-[10px] font-semibold tracking-wide text-text-dim uppercase">
                  {item.label}
                </p>
                <p className="mt-1 truncate text-base font-bold text-white sm:text-lg">{item.value}</p>
              </div>
            ))}
          </div>

          {store?.warning ? (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
              {store.warning}
            </div>
          ) : (
            <p className="text-[11px] text-text-dim">
              Store: {store?.backend === "upstash" ? "Upstash Redis" : "τοπικό αρχείο"}
            </p>
          )}

          <section className="rounded-xl border border-white/10 bg-[#0B0B0B] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-sm font-bold text-white">Λήγουν σύντομα</h2>
              <button
                type="button"
                className="text-xs font-semibold text-gold hover:underline"
                onClick={() => {
                  setFilter("expiring");
                  setTab("customers");
                }}
              >
                Πελάτες →
              </button>
            </div>
            {expiringSoon.length === 0 ? (
              <p className="text-xs text-text-muted">Κανένας στις επόμενες 7 ημέρες.</p>
            ) : (
              <ul className="space-y-2">
                {expiringSoon.map((customer) => (
                  <li
                    key={customer.id}
                    className="flex flex-col gap-2 rounded-lg border border-amber-500/20 bg-black/30 p-2.5 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">{customer.name}</p>
                      <p className="text-[11px] text-text-muted">
                        {customer.packageLabel} · {formatDate(customer.expiresAt)} ·{" "}
                        {customer.daysRemaining}η
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 sm:flex">
                      <Button className={actionBtnClass} onClick={() => setRenewFor(customer)}>
                        <RefreshCw className="h-3.5 w-3.5" />
                        Ανανέωση
                      </Button>
                      <Button
                        variant="outline"
                        className={actionBtnClass}
                        onClick={() =>
                          void copyText(expiringSoonMessage(customer), "Το μήνυμα αντιγράφηκε.")
                        }
                      >
                        <Copy className="h-3.5 w-3.5" />
                        Μήνυμα
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : null}

      {tab === "pricing" ? (
        <AdminPricingManager pricing={pricing} onChange={setPricing} onSave={savePricing} />
      ) : null}

      {tab === "servers" ? (
        <AdminServersManager
          servers={servers}
          onCreate={createServerRecord}
          onUpdate={updateServerRecord}
          onDelete={deleteServerRecord}
        />
      ) : null}

      {tab === "prospects" ? (
        <AdminProspectsManager
          prospects={prospects}
          onCreate={createProspect}
          onUpdate={updateProspect}
          onDelete={deleteProspect}
        />
      ) : null}

      {tab === "customers" ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-bold text-white">
                Πελάτες <span className="font-normal text-text-dim">({filtered.length})</span>
              </h2>
              <Button
                className="h-9 shrink-0 px-3 py-2 text-xs sm:px-3 sm:py-2 sm:text-xs"
                onClick={() => {
                  setShowCreateForm((current) => !current);
                  if (editingId) {
                    setEditingId(null);
                    setAutoExpiry(true);
                    setForm(emptyForm(servers[0]?.id ?? ""));
                    setCreatedLink("");
                  } else if (!showCreateForm) {
                    setAutoExpiry(true);
                    setForm(emptyForm(servers[0]?.id ?? ""));
                  }
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                {showCreateForm || editingId ? "Κλείσιμο" : "Νέος"}
              </Button>
            </div>
            <div className="relative w-full">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-text-dim" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="admin-input pl-8"
                placeholder="Αναζήτηση ονόματος"
                autoComplete="off"
              />
            </div>
          </div>

          {showCreateForm || editingId ? (
            <section className="rounded-xl border border-gold/20 bg-[#0B0B0B] p-3">
              <h3 className="text-sm font-bold text-white">
                {editingId ? "Επεξεργασία" : "Νέος πελάτης"}
              </h3>
              <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2">
                <Field label="Ονοματεπώνυμο">
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
                <Field label="Server">
                  <select
                    value={form.serverId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, serverId: event.target.value }))
                    }
                    className="admin-input"
                  >
                    <option value="">Επίλεξε server…</option>
                    {servers.map((server) => (
                      <option key={server.id} value={server.id}>
                        {server.name} · {server.creditsRemaining} cr
                      </option>
                    ))}
                  </select>
                  {(() => {
                    const selected = servers.find((server) => server.id === form.serverId);
                    if (!selected) {
                      return servers.length === 0 ? (
                        <p className="mt-1 text-[11px] text-rose-300">
                          Πρώτα πρόσθεσε server στο tab Servers.
                        </p>
                      ) : null;
                    }
                    const cost = Number(selected.creditRates[form.packageId] ?? 0);
                    return (
                      <p className="mt-1 text-[11px] text-text-muted">
                        Θα αφαιρεθούν {cost} credits · Υπόλοιπο μετά:{" "}
                        {(selected.creditsRemaining - cost).toFixed(2)}
                      </p>
                    );
                  })()}
                </Field>
                <Field label="Ενεργοποίηση">
                  <input
                    type="date"
                    value={form.activatedAt}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, activatedAt: event.target.value }))
                    }
                    className="admin-input"
                  />
                </Field>
                <Field label="Λήξη">
                  {isTrialPackage(form.packageId) ? (
                    <input
                      readOnly
                      value={form.expiresAt}
                      className="admin-input opacity-80"
                      title="Υπολογίζεται αυτόματα για Trial"
                    />
                  ) : (
                    <input
                      type="date"
                      value={form.expiresAt.slice(0, 10)}
                      onChange={(event) => {
                        setAutoExpiry(false);
                        setForm((current) => ({ ...current, expiresAt: event.target.value }));
                      }}
                      className="admin-input"
                    />
                  )}
                </Field>
                <Field label="Οδηγός εγκατάστασης" className="sm:col-span-2">
                  <input
                    value={form.setupGuideUrl}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, setupGuideUrl: event.target.value }))
                    }
                    className="admin-input"
                    placeholder="/odigos-egkatastasis"
                  />
                </Field>
              </div>

              {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}
              {notice ? <p className="mt-2 text-sm text-emerald-400">{notice}</p> : null}

              {createdLink ? (
                <div className="mt-3 rounded-lg border border-gold/25 bg-gold/8 p-3">
                  <p className="text-[10px] font-bold tracking-[0.14em] text-gold uppercase">Magic Link</p>
                  <p className="mt-1 break-all text-xs text-white">{createdLink}</p>
                  <div className="mt-2 grid grid-cols-2 gap-1.5">
                    <Button
                      variant="outline"
                      className={actionBtnClass}
                      onClick={() => void copyText(createdLink, "Το Magic Link αντιγράφηκε.")}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Αντιγραφή
                    </Button>
                    <Button
                      href={createdLink.replace(window.location.origin, "")}
                      className={actionBtnClass}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Άνοιγμα
                    </Button>
                  </div>
                </div>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  onClick={() => void submit()}
                  disabled={saving}
                  className={cn(actionBtnClass, "font-extrabold")}
                >
                  <Plus className="h-3.5 w-3.5" />
                  {editingId ? "Αποθήκευση" : "Δημιουργία"}
                </Button>
                <Button
                  variant="ghost"
                  className={actionBtnClass}
                  onClick={() => {
                    setEditingId(null);
                    setShowCreateForm(false);
                    setAutoExpiry(true);
                    setForm(emptyForm());
                    setCreatedLink("");
                  }}
                >
                  Ακύρωση
                </Button>
              </div>
            </section>
          ) : null}

          <div className="flex flex-wrap gap-1.5">
            {(
              [
                ["all", "Όλοι"],
                ["active", "Ενεργοί"],
                ["expiring", "Λήγουν"],
                ["expired", "Ληγμένοι"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-[11px] font-bold uppercase",
                  filter === id
                    ? "border-gold/40 bg-gold/15 text-gold"
                    : "border-white/10 bg-black/30 text-text-muted",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => setTagFilter("all")}
                className={cn(
                  "rounded-md border px-2 py-1 text-[11px] font-semibold",
                  tagFilter === "all"
                    ? "border-gold/40 bg-gold/15 text-gold"
                    : "border-white/10 bg-black/30 text-text-muted",
                )}
              >
                Tags · όλα
              </button>
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setTagFilter(tag.id)}
                  className={cn(
                    "rounded-md border px-2 py-1 text-[11px] font-semibold",
                    tagFilter === tag.id
                      ? "border-gold/40 bg-gold/15 text-gold"
                      : "border-white/10 bg-black/30 text-text-muted",
                  )}
                >
                  {tag.emoji} {tag.name}
                </button>
              ))}
            </div>
          ) : null}

          {filtered.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#0B0B0B] p-6 text-center text-sm text-text-muted">
              Δεν υπάρχουν πελάτες σε αυτή την κατηγορία.
            </div>
          ) : (
            <div className="grid gap-2">
              {filtered.map((customer) => {
                const status = adminStatusFromDays(customer.daysRemaining);
                const link = accountPath(customer.token);
                const open = historyOpen === customer.id;

                return (
                  <article
                    key={customer.id}
                    className="rounded-xl border border-white/10 bg-[#0B0B0B] p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-bold text-white sm:text-base">{customer.name}</h3>
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-0.5 text-[11px] text-text-muted">
                        <span className={cn("h-1.5 w-1.5 rounded-full", statusDot(status.tone))} />
                        {status.label}
                      </span>
                    </div>
                    {(customer.tags ?? []).length > 0 ? (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {customer.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="rounded-md border border-gold/20 bg-gold/10 px-1.5 py-0.5 text-[10px] font-semibold text-gold"
                          >
                            {tag.emoji} {tag.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <p className="mt-1 text-xs text-gold">{customer.packageLabel}</p>
                    {customer.serverName ? (
                      <p className="mt-0.5 text-[11px] text-sky-300/90">Server: {customer.serverName}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-text-muted">
                      {formatDate(customer.activatedAt)} → {formatDate(customer.expiresAt)} ·{" "}
                      {customer.daysRemaining > 0 ? `${customer.daysRemaining}η` : "0η"} ·{" "}
                      {formatEuro(customer.totalPaid)} / κέρδος {formatEuro(customer.totalProfit)}
                    </p>

                    <div className="mt-3 grid grid-cols-3 gap-1.5">
                      <Button
                        variant="outline"
                        className={actionBtnClass}
                        onClick={() => setProfileFor(customer)}
                      >
                        Προφίλ
                      </Button>
                      <Button className={actionBtnClass} onClick={() => setRenewFor(customer)}>
                        <RefreshCw className="h-3.5 w-3.5 shrink-0" />
                        Ανανέωση
                      </Button>
                      <Button
                        variant="outline"
                        className={actionBtnClass}
                        onClick={() =>
                          void copyText(
                            `${window.location.origin}${link}`,
                            "Το Magic Link αντιγράφηκε.",
                          )
                        }
                      >
                        <Copy className="h-3.5 w-3.5 shrink-0" />
                        Link
                      </Button>
                    </div>
                    <div className="mt-1.5 grid grid-cols-3 gap-1.5">
                      <Button
                        variant="outline"
                        className={cn(actionBtnClass, open && "border-gold/50 bg-gold/10 text-gold")}
                        onClick={() => setHistoryOpen(open ? null : customer.id)}
                      >
                        <History className="h-3.5 w-3.5 shrink-0" />
                        Ιστορικό
                      </Button>
                      <Button
                        variant="outline"
                        className={actionBtnClass}
                        onClick={() => startEdit(customer)}
                      >
                        <Pencil className="h-3.5 w-3.5 shrink-0" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        className={actionBtnClass}
                        onClick={() => void remove(customer)}
                      >
                        <Trash2 className="h-3.5 w-3.5 shrink-0" />
                        Διαγραφή
                      </Button>
                    </div>

                    {open ? (
                      <AdminSubscriptionHistory subscriptions={customer.subscriptions} />
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </div>
      ) : null}

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
          servers={servers}
          saving={renewing}
          onClose={() => setRenewFor(null)}
          onConfirm={(packageId, serverId) => void confirmRenew(packageId, serverId)}
        />
      ) : null}

      {specialFor ? (
        <AdminSpecialOfferModal
          customer={specialFor}
          pricing={pricing}
          servers={servers}
          saving={renewing}
          onClose={() => setSpecialFor(null)}
          onConfirm={(packageId, amountPaid, serverId) =>
            void confirmSpecial(packageId, amountPaid, serverId)
          }
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
          onRegenerateLink={() => void regenerate(profileFor)}
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
      <span className="mb-1 block text-[10px] font-semibold tracking-[0.12em] text-text-dim uppercase">
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </label>
  );
}
