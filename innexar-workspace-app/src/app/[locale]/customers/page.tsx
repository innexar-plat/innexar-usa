'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Plus, Loader2, AlertCircle, Mail, Pencil, Trash2 } from 'lucide-react';
import {
  workspaceFetchStaff,
  getStaffToken,
  parseWorkspaceError,
} from "@/lib/workspace-api";
import { WORKSPACE_API_PATHS } from "@/lib/workspace-api-paths";
import { TableSkeleton } from "@/components/table-skeleton";

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

function formatAddress(addr: Record<string, string>): string {
  const parts = [
    addr.street,
    [addr.number, addr.complement].filter(Boolean).join(', '),
    [addr.postal_code, addr.city, addr.state].filter(Boolean).join(' - '),
  ].filter(Boolean);
  return parts.join(', ');
}

export default function WorkspaceCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formStreet, setFormStreet] = useState('');
  const [formNumber, setFormNumber] = useState('');
  const [formComplement, setFormComplement] = useState('');
  const [formPostalCode, setFormPostalCode] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<number | null>(null);
  const [cleanupLoading, setCleanupLoading] = useState(false);
  const locale = useLocale();

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!getStaffToken()) {
      setError('Faça login para acessar.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const r = await workspaceFetchStaff(WORKSPACE_API_PATHS.CUSTOMERS.LIST, {
        signal,
      });
      if (signal?.aborted) return;
      if (r.ok) {
        const data = await r.json();
        setCustomers(Array.isArray(data) ? data : []);
        setError("");
      } else {
        const data = await r.json().catch(() => ({}));
        setError(parseWorkspaceError(data) || "Erro ao carregar clientes");
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError('Erro ao carregar clientes');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  const openCreate = () => {
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormStreet('');
    setFormNumber('');
    setFormComplement('');
    setFormPostalCode('');
    setFormCity('');
    setFormState('');
    setModalOpen(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getStaffToken();
    if (!token) return;
    setSaving(true);
    setError('');
    const address: Record<string, string> = {};
    if (formStreet) address.street = formStreet;
    if (formNumber) address.number = formNumber;
    if (formComplement) address.complement = formComplement;
    if (formPostalCode) address.postal_code = formPostalCode;
    if (formCity) address.city = formCity;
    if (formState) address.state = formState;
    const body = {
      name: formName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone: formPhone.trim() || null,
      address: Object.keys(address).length ? address : null,
    };
    const res = await workspaceFetchStaff(WORKSPACE_API_PATHS.CUSTOMERS.LIST, {
      method: "POST",
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      setModalOpen(false);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(parseWorkspaceError(data) || "Erro ao criar cliente");
    }
  };

  const handleCleanupTest = async () => {
    const token = getStaffToken();
    if (!token) return;
    if (!confirm('Remover todos os clientes de teste (e-mail @test.innexar.com, Test Customer, Acme Corp)? O cliente INSTITUTO LASER OCULAR TOUFIC SLEIMAN será mantido.')) return;
    setCleanupLoading(true);
    setError('');
    const res = await workspaceFetchStaff(
      WORKSPACE_API_PATHS.CUSTOMERS.CLEANUP_TEST,
      { method: "POST" }
    );
    setCleanupLoading(false);
    if (res.ok) {
      const data = await res.json();
      alert(data.message ?? `Removidos ${data.deleted ?? 0} cliente(s) de teste.`);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(
        parseWorkspaceError(data) || "Erro ao remover usuários de teste"
      );
    }
  };

  const handleSendCredentials = async (customerId: number) => {
    if (!getStaffToken()) return;
    setSendingId(customerId);
    setError("");
    const res = await workspaceFetchStaff(
      WORKSPACE_API_PATHS.CUSTOMERS.SEND_CREDENTIALS(customerId),
      { method: "POST" }
    );
    setSendingId(null);
    if (res.ok) {
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(
        parseWorkspaceError(data) || "Erro ao enviar credenciais"
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Clientes</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCleanupTest}
            disabled={cleanupLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-medium disabled:opacity-50"
          >
            {cleanupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            Remover usuários de teste
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium"
          >
            <Plus className="w-5 h-5" />
            Novo cliente
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={6} cols={1} className="mt-2" />
      ) : (
        <div className="grid gap-3">
          {customers.map((c) => (
            <motion.div
              key={c.id}
              layout
              className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-wrap items-center justify-between gap-4"
            >
              <div>
                <p className="font-medium text-white">{c.name}</p>
                <p className="text-sm text-slate-400">{c.email}</p>
                {c.phone && <p className="text-sm text-slate-500">{c.phone}</p>}
                {c.address && Object.keys(c.address).length > 0 && (
                  <p className="text-sm text-slate-500">{formatAddress(c.address)}</p>
                )}
                {c.has_portal_access && (
                  <span className="inline-block mt-1 text-xs text-green-400">Acesso ao portal ativo</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/${locale}/customers/${c.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-200 text-sm"
                >
                  <Pencil className="w-4 h-4" />
                  Ver / Editar
                </Link>
                <button
                  type="button"
                  onClick={() => handleSendCredentials(c.id)}
                  disabled={sendingId === c.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm disabled:opacity-50"
                >
                  {sendingId === c.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4" />
                  )}
                  Enviar convite
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && customers.length === 0 && (
        <p className="text-center text-slate-400 py-12">Nenhum cliente cadastrado.</p>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Novo cliente</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">E-mail *</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Telefone</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Endereço</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Rua"
                    value={formStreet}
                    onChange={(e) => setFormStreet(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Número"
                      value={formNumber}
                      onChange={(e) => setFormNumber(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                    />
                    <input
                      type="text"
                      placeholder="CEP"
                      value={formPostalCode}
                      onChange={(e) => setFormPostalCode(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Complemento"
                    value={formComplement}
                    onChange={(e) => setFormComplement(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                    />
                    <input
                      type="text"
                      placeholder="Estado"
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 font-medium"
                >
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Criar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
