"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, RefreshCw, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/admin-header";
import { Registration, RegistrationStatus, formatDate, formatPrice, statusClass, statusLabel } from "@/components/admin/registrations/types";

export default function RegistrationsPage() {
  const router = useRouter();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<RegistrationStatus>("pending");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError(null);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Your admin session has expired. Please log in again.");
      const params = new URLSearchParams({ page: String(page), page_size: "10", status });
      if (search.trim()) params.set("search", search.trim());
      const response = await fetch(`/api/admin/registrations?${params}`, { headers: { Authorization: `Bearer ${session.access_token}` }, cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Failed to load registrations.");
      setRegistrations(data.registrations ?? []); setTotal(data.total ?? 0); setTotalPages(data.total_pages ?? 1);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load registrations."); }
    finally { setLoading(false); setRefreshing(false); }
  }, [page, search, status]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, status]);

  return <main className="min-h-screen bg-[#0b0d10] text-white"><div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"><AdminHeader /><div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs uppercase tracking-[0.2em] text-sky-300/50">Admin workspace</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Registrations</h1><p className="mt-1 text-sm text-white/35">Review and manage student registrations.</p></div><button onClick={() => void load(true)} disabled={refreshing} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-xs text-white/60 hover:bg-white/[0.06] disabled:opacity-40"><RefreshCw className={refreshing ? "animate-spin" : ""} size={14} /> Refresh</button></div><div className="mt-6 flex flex-col gap-3 md:flex-row"><div className="relative flex-1"><Search size={16} className="absolute left-3 top-3.5 text-white/25" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search registrations..." className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] py-3 pl-10 pr-4 text-sm outline-none placeholder:text-white/25 focus:border-sky-300/40" /></div><div className="flex rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">{(["pending", "confirmed", "cancelled"] as RegistrationStatus[]).map((item) => <button key={item} onClick={() => setStatus(item)} className={`rounded-lg px-4 py-2 text-xs ${status === item ? "bg-white/[0.1] text-white" : "text-white/35 hover:text-white/70"}`}>{statusLabel(item)}</button>)}</div></div>{error && <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200">{error}</div>}<div className="mt-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">{loading ? <div className="flex items-center justify-center gap-2 p-16 text-sm text-white/35"><Loader2 className="animate-spin" size={16} /> Loading registrations...</div> : registrations.length === 0 ? <div className="p-16 text-center text-sm text-white/35">No registrations found.</div> : <div className="divide-y divide-white/[0.06]">{registrations.map((registration) => <button key={registration.id} onClick={() => router.push(`/admin/registrations/${registration.id}`)} className="flex w-full flex-col gap-3 p-5 text-left transition hover:bg-white/[0.04] md:flex-row md:items-center md:justify-between"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><span className="font-medium text-white">{registration.full_name}</span><span className={`rounded-full px-2 py-1 text-[10px] ${statusClass(registration.status)}`}>{statusLabel(registration.status)}</span></div><div className="mt-1 text-xs text-white/35">{registration.registration_code} · {registration.university || "No university"}</div></div><div className="flex shrink-0 items-center gap-6 text-xs text-white/40"><span>{registration.plan}</span><span>{formatPrice(registration.final_price)}</span><span>{formatDate(registration.created_at)}</span><ChevronRight size={15} className="text-white/25" /></div></button>)}</div>}<div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-4 text-xs text-white/35"><span>{total} total</span><div className="flex items-center gap-3"><button disabled={page <= 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border border-white/[0.08] p-2 disabled:opacity-25"><ChevronLeft size={14} /></button><span>{page} / {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border border-white/[0.08] p-2 disabled:opacity-25"><ChevronRight size={14} /></button></div></div></div></div></main>;
}
