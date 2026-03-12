"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Receipt,
  CreditCard,
  MessageSquare,
  FolderOpen,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { workspaceFetchStaff } from "@/lib/workspace-api";
import { WORKSPACE_API_PATHS } from "@/lib/workspace-api-paths";
import { TableSkeleton } from "@/components/table-skeleton";

type PeriodType = "day" | "week" | "month";

interface Summary {
  customers?: { active: number };
  invoices?: {
    total: number;
    pending: number;
    paid: number;
    total_paid_amount: number;
  };
  subscriptions?: { active: number; canceled: number; total: number };
  tickets?: { open: number; closed: number };
  projects?: { by_status: Record<string, number>; total: number };
}

interface RevenuePoint {
  period: string;
  revenue: number;
}

interface RevenueResponse {
  period_type: string;
  series: RevenuePoint[];
}

export default function WorkspaceDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [revenue, setRevenue] = useState<RevenueResponse | null>(null);
  const [period, setPeriod] = useState<PeriodType>("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback((signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    Promise.all([
      workspaceFetchStaff(WORKSPACE_API_PATHS.DASHBOARD.SUMMARY, { signal }).then((r) =>
        r.ok ? r.json() : null
      ),
      workspaceFetchStaff(WORKSPACE_API_PATHS.DASHBOARD.REVENUE(period), { signal }).then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([sum, rev]) => {
        if (!signal?.aborted) {
          setSummary(sum ?? null);
          setRevenue(rev ?? null);
        }
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setError("Falha ao carregar dashboard");
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false);
      });
  }, [period]);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  if (loading && !summary) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 rounded-lg bg-white/5 animate-pulse" />
        <TableSkeleton rows={4} cols={4} className="min-h-[40vh]" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <div className="flex gap-2">
          {(["day", "week", "month"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                period === p
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
              }`}
            >
              {p === "day" ? "Dia" : p === "week" ? "Semana" : "Mês"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary?.customers && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-blue-400" />
              <span className="text-slate-400 text-sm">Clientes ativos</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {summary.customers.active}
            </p>
          </motion.div>
        )}
        {summary?.invoices && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Receipt className="w-8 h-8 text-purple-400" />
              <span className="text-slate-400 text-sm">Faturas</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {summary.invoices.paid} / {summary.invoices.total} pagas
            </p>
            <p className="text-slate-400 text-sm mt-1">
              Total pago: R$ {summary.invoices.total_paid_amount.toFixed(2)}
            </p>
          </motion.div>
        )}
        {summary?.subscriptions && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-8 h-8 text-emerald-400" />
              <span className="text-slate-400 text-sm">Assinaturas</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {summary.subscriptions.active} ativas
            </p>
            <p className="text-slate-400 text-sm mt-1">
              {summary.subscriptions.total} total
            </p>
          </motion.div>
        )}
        {summary?.tickets && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-8 h-8 text-amber-400" />
              <span className="text-slate-400 text-sm">Tickets</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {summary.tickets.open} abertos / {summary.tickets.closed} fechados
            </p>
          </motion.div>
        )}
      </div>

      {summary?.projects && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <FolderOpen className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Projetos</h3>
          </div>
          <p className="text-white font-medium">Total: {summary.projects.total}</p>
          {Object.keys(summary.projects.by_status).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(summary.projects.by_status).map(([status, count]) => (
                <span
                  key={status}
                  className="px-3 py-1 rounded-lg bg-white/5 text-slate-300 text-sm"
                >
                  {status}: {count}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {revenue && revenue.series.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">
              Receita (período)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-2">
              {revenue.series.slice(-12).map((point) => (
                <div
                  key={point.period}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-white/5 min-w-[80px]"
                >
                  <span className="text-xs text-slate-400 truncate max-w-full">
                    {point.period}
                  </span>
                  <span className="text-sm font-semibold text-white">
                    R$ {point.revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
