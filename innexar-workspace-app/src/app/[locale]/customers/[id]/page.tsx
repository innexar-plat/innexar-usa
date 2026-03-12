'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Mail,
  KeyRound,
  Save,
  Pencil,
  Plus,
  Receipt,
  CheckCircle,
  X,
  Copy,
  Trash2,
} from 'lucide-react';
import {
  workspaceFetchStaff,
  getStaffToken,
  parseWorkspaceError,
} from "@/lib/workspace-api";
import { WORKSPACE_API_PATHS } from "@/lib/workspace-api-paths";

interface Customer {
  id: number;
  org_id: string;
  name: string;
  email: string;
  phone: string | null;
  address: Record<string, string> | null;
  created_at: string;
  has_portal_access: boolean;
}

interface Subscription {
  id: number;
  customer_id: number;
  product_id: number;
  price_plan_id: number;
  status: string;
  start_date: string | null;
  end_date: string | null;
  next_due_date: string | null;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
  price_plans?: { id: number; name: string; interval: string; amount: number; currency: string }[];
}

interface Invoice {
  id: number;
  customer_id: number;
  subscription_id: number | null;
  status: string;
  due_date: string;
  paid_at: string | null;
  total: number;
  currency: string;
  created_at: string;
}

function formatAddress(addr: Record<string, string>): string {
  const parts = [
    addr.street,
    [addr.number, addr.complement].filter(Boolean).join(', '),
    [addr.postal_code, addr.city, addr.state].filter(Boolean).join(' - '),
  ].filter(Boolean);
  return parts.join(', ');
}

export default function WorkspaceCustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const id = typeof params.id === 'string' ? params.id : '';
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [genPassword, setGenPassword] = useState<string | null>(null);
  const [genLoading, setGenLoading] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showInvModal, setShowInvModal] = useState(false);
  const [subSaving, setSubSaving] = useState(false);
  const [invSaving, setInvSaving] = useState(false);
  const [markingPaidId, setMarkingPaidId] = useState<number | null>(null);
  const [paymentLinkId, setPaymentLinkId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formComplement, setFormComplement] = useState('');
  const [formPostalCode, setFormPostalCode] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');

  const [subProductId, setSubProductId] = useState<number | ''>('');
  const [subPlanId, setSubPlanId] = useState<number | ''>('');
  const [subStatus, setSubStatus] = useState('inactive');
  const [subStartDate, setSubStartDate] = useState('');
  const [subNextDueDate, setSubNextDueDate] = useState('');
  const [invSubscriptionId, setInvSubscriptionId] = useState<number | ''>('');
  const [invDueDate, setInvDueDate] = useState('');
  const [invTotal, setInvTotal] = useState('');
  const [invCurrency, setInvCurrency] = useState('BRL');

  const load = useCallback(async () => {
    if (!getStaffToken() || !id) return;
    setLoading(true);
    setError("");
    try {
      const [custRes, subsRes, prodsRes, invRes] = await Promise.all([
        workspaceFetchStaff(WORKSPACE_API_PATHS.CUSTOMERS.DETAIL(id)),
        workspaceFetchStaff(WORKSPACE_API_PATHS.BILLING.SUBSCRIPTIONS(id)),
        workspaceFetchStaff(WORKSPACE_API_PATHS.BILLING.PRODUCTS(true)),
        workspaceFetchStaff(WORKSPACE_API_PATHS.BILLING.INVOICES(id)),
      ]);
      if (!custRes.ok) {
        const data = await custRes.json().catch(() => ({}));
        setError(parseWorkspaceError(data) || "Cliente não encontrado");
        setCustomer(null);
        setLoading(false);
        return;
      }
      const cust = (await custRes.json()) as Customer;
      setCustomer(cust);
      setFormName(cust.name);
      setFormEmail(cust.email);
      setFormPhone(cust.phone ?? '');
      const addr = cust.address ?? {};
      setFormStreet(addr.street ?? '');
      setFormNumber(addr.number ?? '');
      setFormComplement(addr.complement ?? '');
      setFormPostalCode(addr.postal_code ?? '');
      setFormCity(addr.city ?? '');
      setFormState(addr.state ?? '');

      setSubscriptions(subsRes.ok ? ((await subsRes.json()) as Subscription[]) : []);
      setProducts(prodsRes.ok ? ((await prodsRes.json()) as Product[]) : []);
      setInvoices(invRes.ok ? ((await invRes.json()) as Invoice[]) : []);
    } catch {
      setError('Erro ao carregar dados do cliente');
      setCustomer(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getStaffToken() || !id) return;
    setSaving(true);
    setError("");
    const address: Record<string, string> = {};
    if (formStreet) address.street = formStreet;
    if (formNumber) address.number = formNumber;
    if (formComplement) address.complement = formComplement;
    if (formPostalCode) address.postal_code = formPostalCode;
    if (formCity) address.city = formCity;
    if (formState) address.state = formState;
    const res = await workspaceFetchStaff(
      WORKSPACE_API_PATHS.CUSTOMERS.DETAIL(id),
      {
        method: "PATCH",
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          phone: formPhone.trim() || null,
          address: Object.keys(address).length ? address : null,
        }),
      }
    );
    setSaving(false);
    if (res.ok) {
      setEditing(false);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(parseWorkspaceError(data) || "Erro ao salvar");
    }
  };

  const handleSendCredentials = async () => {
    if (!getStaffToken() || !id) return;
    setSendingInvite(true);
    setError("");
    const res = await workspaceFetchStaff(
      WORKSPACE_API_PATHS.CUSTOMERS.SEND_CREDENTIALS(id),
      { method: "POST" }
    );
    setSendingInvite(false);
    if (res.ok) load();
    else {
      const data = await res.json().catch(() => ({}));
      setError(parseWorkspaceError(data) || "Erro ao enviar convite");
    }
  };

  const handleGeneratePassword = async () => {
    if (!getStaffToken() || !id) return;
    setGenLoading(true);
    setGenPassword(null);
    setError("");
    const res = await workspaceFetchStaff(
      WORKSPACE_API_PATHS.CUSTOMERS.GENERATE_PASSWORD(id),
      { method: "POST" }
    );
    setGenLoading(false);
    if (res.ok) {
      const data = (await res.json()) as { password: string };
      setGenPassword(data.password);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(parseWorkspaceError(data) || "Erro ao gerar senha");
    }
  };

  const handleDeleteCustomer = async () => {
    if (!getStaffToken() || !id) return;
    setDeleting(true);
    setError("");
    const res = await workspaceFetchStaff(
      WORKSPACE_API_PATHS.CUSTOMERS.DETAIL(id),
      { method: "DELETE" }
    );
    setDeleting(false);
    setShowDeleteConfirm(false);
    if (res.ok) {
      router.push(`/${locale}/customers`);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(parseWorkspaceError(data) || "Erro ao excluir cliente");
    }
  };

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getStaffToken() || !id || subProductId === "" || subPlanId === "")
      return;
    setSubSaving(true);
    setError("");
    try {
      const body: {
        customer_id: number;
        product_id: number;
        price_plan_id: number;
        status: string;
        start_date?: string;
        next_due_date?: string;
      } = {
        customer_id: Number(id),
        product_id: Number(subProductId),
        price_plan_id: Number(subPlanId),
        status: subStatus,
      };
      if (subStartDate) body.start_date = subStartDate;
      if (subNextDueDate) body.next_due_date = subNextDueDate;
      const res = await workspaceFetchStaff(
        WORKSPACE_API_PATHS.BILLING.SUBSCRIPTIONS(),
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );
      if (res.ok) {
        setShowSubModal(false);
        setSubProductId("");
        setSubPlanId("");
        setSubStatus("inactive");
        setSubStartDate("");
        setSubNextDueDate("");
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(
          parseWorkspaceError(data) || "Erro ao criar assinatura"
        );
      }
    } finally {
      setSubSaving(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getStaffToken() || !id || !invDueDate || !invTotal.trim()) return;
    setInvSaving(true);
    setError("");
    try {
      const body: {
        customer_id: number;
        due_date: string;
        total: number;
        currency: string;
        subscription_id?: number;
      } = {
        customer_id: Number(id),
        due_date: invDueDate,
        total: Number(invTotal.replace(",", ".")),
        currency: invCurrency,
      };
      if (invSubscriptionId !== "")
        body.subscription_id = Number(invSubscriptionId);
      const res = await workspaceFetchStaff(
        WORKSPACE_API_PATHS.BILLING.INVOICES(),
        {
          method: "POST",
          body: JSON.stringify(body),
        }
      );
      if (res.ok) {
        setShowInvModal(false);
        setInvSubscriptionId("");
        setInvDueDate("");
        setInvTotal("");
        setInvCurrency("BRL");
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(
          parseWorkspaceError(data) || "Erro ao criar fatura"
        );
      }
    } finally {
      setInvSaving(false);
    }
  };

  const handleMarkPaid = async (invoiceId: number) => {
    if (!getStaffToken()) return;
    setMarkingPaidId(invoiceId);
    setError("");
    try {
      const res = await workspaceFetchStaff(
        WORKSPACE_API_PATHS.BILLING.INVOICE_MARK_PAID(invoiceId),
        { method: "POST" }
      );
      if (res.ok) load();
      else {
        const data = await res.json().catch(() => ({}));
        setError(
          parseWorkspaceError(data) || "Erro ao marcar como paga"
        );
      }
    } finally {
      setMarkingPaidId(null);
    }
  };

  const portalBase =
    (typeof window !== 'undefined' && (window as unknown as { __PORTAL_URL?: string }).__PORTAL_URL) ||
    process.env.NEXT_PUBLIC_PORTAL_URL ||
    (typeof window !== 'undefined' ? window.location.origin : '');

  const getPaymentLink = async (invoiceId: number) => {
    if (!getStaffToken() || !portalBase) return;
    setPaymentLinkId(invoiceId);
    setError("");
    const successUrl = `${portalBase}/payment/success`;
    const cancelUrl = `${portalBase}/payment/cancel`;
    const path = WORKSPACE_API_PATHS.BILLING.INVOICE_PAYMENT_LINK(
      invoiceId,
      successUrl,
      cancelUrl
    );
    try {
      const res = await workspaceFetchStaff(path, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      setPaymentLinkId(null);
      if (res.ok && data.payment_url) {
        await navigator.clipboard.writeText(data.payment_url);
        alert("Link copiado para a área de transferência.");
      } else {
        setError(parseWorkspaceError(data) || "Erro ao gerar link");
      }
    } catch {
      setPaymentLinkId(null);
      setError("Erro ao gerar link de pagamento");
    }
  };

  const productName = (productId: number) =>
    products.find((p) => p.id === productId)?.name ?? `Produto #${productId}`;
  const planName = (productId: number, planId: number) => {
    const p = products.find((pr) => pr.id === productId);
    const plan = p?.price_plans?.find((pp) => pp.id === planId);
    return plan ? `${plan.name} (${plan.interval}, ${plan.currency} ${plan.amount})` : `Plano #${planId}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
        <Link
          href={`/${locale}/customers`}
          className="inline-flex items-center gap-2 text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos clientes
        </Link>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="space-y-6">
      <Link
        href={`/${locale}/customers`}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar aos clientes
      </Link>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-white">Dados do cliente</h2>
          <div className="flex flex-wrap items-center gap-2">
            {!editing ? (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-medium"
              >
                <Pencil className="w-4 h-4" />
                Editar
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="customer-form"
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar
                </button>
              </>
            )}
            <button
              type="button"
              onClick={handleGeneratePassword}
              disabled={genLoading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 disabled:opacity-50 font-medium"
            >
              {genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
              Gerar senha
            </button>
            <button
              type="button"
              onClick={handleSendCredentials}
              disabled={sendingInvite}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-medium disabled:opacity-50"
            >
              {sendingInvite ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              Enviar convite
            </button>
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Excluir cliente
            </button>
          </div>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-xl">
              <h3 className="text-lg font-semibold text-white mb-2">Excluir cliente</h3>
              <p className="text-slate-400 text-sm mb-6">
                Tem certeza? Esta ação não pode ser desfeita. O cliente e dados associados serão removidos.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                  className="px-4 py-2 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-medium disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteCustomer}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {genPassword && (
          <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <p className="text-amber-400 font-medium mb-1">Senha temporária gerada (copie e informe o cliente ou use Enviar convite):</p>
            <code className="block p-2 bg-black/20 rounded text-white font-mono break-all">{genPassword}</code>
          </div>
        )}

        {editing ? (
          <form id="customer-form" onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Nome</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                className="w-full max-w-md px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">E-mail</label>
              <input
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                required
                className="w-full max-w-md px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Telefone</label>
              <input
                type="text"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                className="w-full max-w-md px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Endereço</label>
              <div className="grid gap-2 max-w-2xl">
                <input
                  type="text"
                  placeholder="Rua"
                  value={formStreet}
                  onChange={(e) => setFormStreet(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Número"
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                  <input
                    type="text"
                    placeholder="CEP"
                    value={formPostalCode}
                    onChange={(e) => setFormPostalCode(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Complemento"
                  value={formComplement}
                  onChange={(e) => setFormComplement(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Cidade"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                  <input
                    type="text"
                    placeholder="Estado"
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>
              </div>
            </div>
          </form>
        ) : (
          <dl className="grid gap-2 sm:grid-cols-2">
            <dt className="text-slate-400">Nome</dt>
            <dd className="text-white">{customer.name}</dd>
            <dt className="text-slate-400">E-mail</dt>
            <dd className="text-white">{customer.email}</dd>
            <dt className="text-slate-400">Telefone</dt>
            <dd className="text-white">{customer.phone ?? '-'}</dd>
            <dt className="text-slate-400">Endereço</dt>
            <dd className="text-white">
              {customer.address && Object.keys(customer.address).length > 0
                ? formatAddress(customer.address)
                : '-'}
            </dd>
            <dt className="text-slate-400">Acesso ao portal</dt>
            <dd className="text-white">
              {customer.has_portal_access ? (
                <span className="text-green-400">Ativo</span>
              ) : (
                <span className="text-slate-500">
                  Sem acesso
                  <span className="ml-2 text-slate-500 text-sm font-normal" title="Use Enviar convite para ativar o login">
                    (use Enviar convite para ativar o login)
                  </span>
                </span>
              )}
            </dd>
            <dt className="text-slate-400">Cadastrado em</dt>
            <dd className="text-white">{new Date(customer.created_at).toLocaleString(locale)}</dd>
          </dl>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-white">Produtos assinados</h3>
          <button
            type="button"
            onClick={() => setShowSubModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium"
          >
            <Plus className="w-4 h-4" />
            Adicionar assinatura
          </button>
        </div>
        {subscriptions.length === 0 ? (
          <p className="text-slate-400">Nenhuma assinatura.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Produto</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Plano</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Início</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Próximo venc.</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} className="border-b border-white/5">
                    <td className="py-3 px-4 text-white">{productName(sub.product_id)}</td>
                    <td className="py-3 px-4 text-slate-300">
                      {planName(sub.product_id, sub.price_plan_id)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded bg-white/5 text-slate-300 text-sm">
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {sub.start_date ? new Date(sub.start_date).toLocaleDateString(locale) : '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {sub.next_due_date ? new Date(sub.next_due_date).toLocaleDateString(locale) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-lg font-semibold text-white">Faturas</h3>
          <button
            type="button"
            onClick={() => setShowInvModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium"
          >
            <Receipt className="w-4 h-4" />
            Criar fatura
          </button>
        </div>
        {invoices.length === 0 ? (
          <p className="text-slate-400">Nenhuma fatura.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">ID</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Vencimento</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Total</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Pago em</th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-white/5">
                    <td className="py-3 px-4 text-white font-medium">{inv.id}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded bg-white/5 text-slate-300 text-sm">
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {new Date(inv.due_date).toLocaleDateString(locale)}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {inv.currency} {inv.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-sm">
                      {inv.paid_at ? new Date(inv.paid_at).toLocaleDateString(locale) : '-'}
                    </td>
                    <td className="py-3 px-4 flex flex-wrap gap-2">
                      {inv.status !== 'paid' && (
                        <>
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
                          <button
                            type="button"
                            onClick={() => handleMarkPaid(inv.id)}
                            disabled={markingPaidId !== null}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm font-medium disabled:opacity-50"
                          >
                            {markingPaidId === inv.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Marcar como paga
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Adicionar assinatura */}
      {showSubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Adicionar assinatura</h3>
              <button type="button" onClick={() => setShowSubModal(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubscription} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Produto</label>
                <select
                  value={subProductId}
                  onChange={(e) => {
                    setSubProductId(e.target.value ? Number(e.target.value) : '');
                    setSubPlanId('');
                  }}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  <option value="">Selecione</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Plano</label>
                <select
                  value={subPlanId}
                  onChange={(e) => setSubPlanId(e.target.value ? Number(e.target.value) : '')}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  <option value="">Selecione</option>
                  {typeof subProductId === 'number' && products.find((p) => p.id === subProductId)?.price_plans?.map((pp) => (
                    <option key={pp.id} value={pp.id}>{pp.name} ({pp.interval}, {pp.currency} {pp.amount})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                <select
                  value={subStatus}
                  onChange={(e) => setSubStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  <option value="inactive">Inativo</option>
                  <option value="active">Ativo</option>
                  <option value="suspended">Suspenso</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Data início (opcional)</label>
                <input
                  type="date"
                  value={subStartDate}
                  onChange={(e) => setSubStartDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Próximo vencimento (opcional)</label>
                <input
                  type="date"
                  value={subNextDueDate}
                  onChange={(e) => setSubNextDueDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowSubModal(false)} className="flex-1 px-4 py-2 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={subSaving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium disabled:opacity-50">
                  {subSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Criar fatura */}
      {showInvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Criar fatura</h3>
              <button type="button" onClick={() => setShowInvModal(false)} className="p-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Assinatura (opcional)</label>
                <select
                  value={invSubscriptionId === '' ? '' : invSubscriptionId}
                  onChange={(e) => setInvSubscriptionId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  <option value="">Nenhuma</option>
                  {subscriptions.map((s) => (
                    <option key={s.id} value={s.id}>{productName(s.product_id)} - #{s.id}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Vencimento</label>
                <input
                  type="date"
                  value={invDueDate}
                  onChange={(e) => setInvDueDate(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Total</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={invTotal}
                  onChange={(e) => setInvTotal(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Moeda</label>
                <select
                  value={invCurrency}
                  onChange={(e) => setInvCurrency(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  <option value="BRL">BRL</option>
                  <option value="USD">USD</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setShowInvModal(false)} className="flex-1 px-4 py-2 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-medium">
                  Cancelar
                </button>
                <button type="submit" disabled={invSaving} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium disabled:opacity-50">
                  {invSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
