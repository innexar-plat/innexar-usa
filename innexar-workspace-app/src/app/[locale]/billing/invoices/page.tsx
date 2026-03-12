'use client';

import { useCallback, useEffect, useState } from 'react';
import { Loader2, AlertCircle, Play, Link2, Copy, CreditCard } from 'lucide-react';
import { workspaceFetch, getStaffToken, getWorkspaceApiBase } from '@/lib/workspace-api';
import { PaymentBrickModal, type InvoiceForPayment } from "@/components/payment-brick-modal";

const PORTAL_BASE =
  (typeof window !== 'undefined' && (window as unknown as { __PORTAL_URL?: string }).__PORTAL_URL) ||
  process.env.NEXT_PUBLIC_PORTAL_URL ||
  (typeof window !== 'undefined' ? window.location.origin : '');

const MP_PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? '';

interface Invoice {
  id: number;
  customer_id: number;
  subscription_id: number | null;
  status: string;
  due_date: string;
  paid_at: string | null;
  total: number;
  currency: string;
}

export default function WorkspaceBillingInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [paymentLinkId, setPaymentLinkId] = useState<number | null>(null);
  const [generateRecurringLoading, setGenerateRecurringLoading] = useState(false);

  const [bricksInvoice, setBricksInvoice] = useState<InvoiceForPayment | null>(null);

  const load = useCallback(() => {
    const token = getStaffToken();
    if (!token) return;
    setLoading(true);
    workspaceFetch('/api/workspace/billing/invoices', { token })
      .then((r) => (r.ok ? r.json() : []))
      .then(setInvoices)
      .catch(() => setError('Erro ao carregar faturas'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const runProcessOverdue = async () => {
    const token = getStaffToken();
    if (!token) return;
    setProcessingId(-1);
    setError('');
    const res = await workspaceFetch('/api/workspace/billing/process-overdue', {
      token,
      method: 'POST',
    });
    setProcessingId(null);
    if (res.ok) {
      const data = await res.json();
      alert(data.processed != null ? `Processados: ${data.processed}` : 'Concluido');
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.detail === 'string' ? data.detail : 'Erro ao executar');
    }
  };

  const runGenerateRecurring = async () => {
    const token = getStaffToken();
    if (!token) return;
    setGenerateRecurringLoading(true);
    setError('');
    const res = await workspaceFetch('/api/workspace/billing/generate-recurring-invoices', {
      token,
      method: 'POST',
    });
    setGenerateRecurringLoading(false);
    if (res.ok) {
      const data = await res.json();
      alert(data.generated != null ? `Faturas geradas: ${data.generated}` : 'Concluído');
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.detail === 'string' ? data.detail : 'Erro ao gerar faturas');
    }
  };

  const getPaymentLink = async (invoiceId: number) => {
    const token = getStaffToken();
    if (!token || !PORTAL_BASE) return;
    setPaymentLinkId(invoiceId);
    setError('');
    const successUrl = `${PORTAL_BASE}/payment/success`;
    const cancelUrl = `${PORTAL_BASE}/payment/cancel`;
    const url = `/api/workspace/billing/invoices/${invoiceId}/payment-link?success_url=${encodeURIComponent(successUrl)}&cancel_url=${encodeURIComponent(cancelUrl)}`;
    try {
      const res = await workspaceFetch(url, { token, method: 'POST' });
      const data = await res.json().catch(() => ({}));
      setPaymentLinkId(null);
      if (res.ok && data.payment_url) {
        await navigator.clipboard.writeText(data.payment_url);
        alert('Link copiado para a área de transferência.');
      } else {
        setError(typeof data.detail === 'string' ? data.detail : 'Erro ao gerar link');
      }
    } catch {
      setPaymentLinkId(null);
      setError('Erro ao gerar link de pagamento');
    }
  };

  const openBricksModal = (inv: Invoice) => {
    setBricksInvoice({ id: inv.id, total: inv.total, currency: inv.currency || 'BRL' });
  };

  const closeBricksModal = useCallback(() => {
    setBricksInvoice(null);
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Billing – Faturas</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={runGenerateRecurring}
            disabled={generateRecurringLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 disabled:opacity-50"
          >
            {generateRecurringLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Link2 className="w-5 h-5" />
            )}
            Gerar faturas recorrentes
          </button>
          <button
            onClick={runProcessOverdue}
            disabled={processingId !== null}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50"
          >
            {processingId !== null ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            Executar inadimplencia
          </button>
        </div>
      </div>
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">ID</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Cliente</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Vencimento</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Total</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Pago em</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-medium">{inv.id}</td>
                    <td className="py-3 px-4 text-slate-300">{inv.customer_id}</td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-lg bg-white/5 text-slate-300 text-sm">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(inv.due_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {inv.currency} {inv.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-sm">
                      {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-3 px-4">
                      {inv.status !== 'paid' && (
                        <div className="flex flex-wrap items-center gap-2">
                          {MP_PUBLIC_KEY && (
                            <button
                              type="button"
                              onClick={() => openBricksModal(inv)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 text-sm font-medium"
                            >
                              <CreditCard className="w-4 h-4" />
                              Bricks (cartão/Pix)
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => getPaymentLink(inv.id)}
                            disabled={paymentLinkId !== null}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm font-medium disabled:opacity-50"
                          >
                            {paymentLinkId === inv.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                            Link de pagamento
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {invoices.length === 0 && (
            <p className="py-12 text-center text-slate-400">Nenhuma fatura.</p>
          )}
        </div>
      )}

      <PaymentBrickModal
        open={!!bricksInvoice}
        onClose={closeBricksModal}
        invoice={bricksInvoice}
        mode="workspace"
        apiBase={getWorkspaceApiBase()}
        getToken={getStaffToken}
        onSuccess={load}
        mpPublicKey={MP_PUBLIC_KEY}
        containerId="mp-brick-container-workspace"
      />
    </div>
  );
}
