'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, ShoppingCart, ExternalLink, Plus, FolderOpen } from 'lucide-react';
import {
  workspaceFetchStaff,
  getStaffToken,
  parseWorkspaceError,
} from "@/lib/workspace-api";
import { WORKSPACE_API_PATHS } from "@/lib/workspace-api-paths";
import { TableSkeleton } from "@/components/table-skeleton";

interface OrderItem {
  invoice_id: number;
  customer_id: number;
  customer_name: string;
  product_name: string;
  subscription_id: number;
  project_id: number | null;
  project_status: string | null;
  status: string;
  total: number;
  currency: string;
  paid_at: string | null;
  created_at: string;
}

export default function WorkspaceOrdersPage() {
  const locale = useLocale();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatingForInvoiceId, setCreatingForInvoiceId] = useState<number | null>(null);

  const loadOrders = useCallback((signal?: AbortSignal) => {
    if (!getStaffToken()) return;
    setLoading(true);
    workspaceFetchStaff(WORKSPACE_API_PATHS.ORDERS.LIST, { signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!signal?.aborted) setOrders(data);
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setError("Falha ao carregar pedidos");
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false);
      });
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    loadOrders(ac.signal);
    return () => ac.abort();
  }, [loadOrders]);

  const handleCreateProject = async (order: OrderItem) => {
    const token = getStaffToken();
    if (!token || order.project_id != null) return;
    setCreatingForInvoiceId(order.invoice_id);
    setError('');
    try {
      const name = `${order.product_name} – ${order.customer_name}`.slice(0, 255);
      const res = await workspaceFetchStaff(WORKSPACE_API_PATHS.PROJECTS.LIST, {
        method: "POST",
        body: JSON.stringify({
          customer_id: order.customer_id,
          name,
          status: "aguardando_briefing",
          subscription_id: order.subscription_id,
        }),
      });
      if (res.ok) {
        loadOrders();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(parseWorkspaceError(data) || "Erro ao criar projeto");
      }
    } catch {
      setError('Erro de conexão');
    } finally {
      setCreatingForInvoiceId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Pedidos</h2>
      <p className="text-slate-400">
        Faturas pagas de produtos site (assinatura). Projetos criados automaticamente após o pagamento.
      </p>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={8} cols={5} className="mt-2" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-left text-slate-400 text-sm">
                <th className="pb-3 pr-4">Fatura</th>
                <th className="pb-3 pr-4">Cliente</th>
                <th className="pb-3 pr-4">Produto</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Projeto</th>
                <th className="pb-3 pr-4">Total</th>
                <th className="pb-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <motion.tr
                  key={o.invoice_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-b border-white/5 hover:bg-white/5"
                >
                  <td className="py-4 pr-4 text-white">#{o.invoice_id}</td>
                  <td className="py-4 pr-4">
                    <Link
                      href={`/${locale}/customers/${o.customer_id}`}
                      className="text-blue-400 hover:underline"
                    >
                      {o.customer_name}
                    </Link>
                  </td>
                  <td className="py-4 pr-4 text-slate-300">{o.product_name}</td>
                  <td className="py-4 pr-4">
                    <span className="inline-block px-2 py-1 rounded-lg bg-white/10 text-slate-300 text-sm">
                      {o.status}
                    </span>
                  </td>
                  <td className="py-4 pr-4">
                    {o.project_id ? (
                      <Link
                        href={`/${locale}/projects/${o.project_id}`}
                        className="text-blue-400 hover:underline flex items-center gap-1"
                      >
                        #{o.project_id}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  <td className="py-4 pr-4 text-slate-300">
                    {o.currency} {o.total.toFixed(2)}
                  </td>
                  <td className="py-4">
                    {o.project_id ? (
                      <Link
                        href={`/${locale}/projects/${o.project_id}`}
                        className="text-sm text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Ver projeto
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCreateProject(o)}
                        disabled={creatingForInvoiceId === o.invoice_id}
                        className="text-sm text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        {creatingForInvoiceId === o.invoice_id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                        Criar projeto
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!loading && orders.length === 0 && !error && (
        <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-2">
          <ShoppingCart className="w-12 h-12 text-slate-600" />
          <p>Nenhum pedido encontrado.</p>
        </div>
      )}
    </div>
  );
}
