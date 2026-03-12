'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2, AlertCircle, CreditCard } from 'lucide-react';
import { workspaceFetch, getStaffToken } from '@/lib/workspace-api';

interface PricePlan {
  id: number;
  product_id: number;
  name: string;
  interval: string;
  amount: number;
  currency: string;
  created_at: string;
}

interface Product {
  id: number;
  name: string;
}

export default function WorkspaceBillingPricePlansPage() {
  const [plans, setPlans] = useState<PricePlan[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formProductId, setFormProductId] = useState('');
  const [formName, setFormName] = useState('');
  const [formInterval, setFormInterval] = useState('month');
  const [formAmount, setFormAmount] = useState('');
  const [formCurrency, setFormCurrency] = useState('BRL');
  const [saving, setSaving] = useState(false);

  const load = () => {
    const token = getStaffToken();
    if (!token) return;
    setLoading(true);
    Promise.all([
      workspaceFetch('/api/workspace/billing/price-plans', { token }).then((r) =>
        r.ok ? r.json() : []
      ),
      workspaceFetch('/api/workspace/billing/products', { token }).then((r) =>
        r.ok ? r.json() : []
      ),
    ])
      .then(([pl, pr]) => {
        setPlans(pl);
        setProducts(pr);
      })
      .catch(() => setError('Erro ao carregar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setFormProductId(products[0]?.id ? String(products[0].id) : '');
    setFormName('');
    setFormInterval('month');
    setFormAmount('');
    setFormCurrency('BRL');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getStaffToken();
    if (!token) return;
    const productId = parseInt(formProductId, 10);
    const amount = parseFloat(formAmount);
    if (Number.isNaN(productId) || Number.isNaN(amount)) {
      setError('Produto e valor sao obrigatorios');
      return;
    }
    setSaving(true);
    setError('');
    const res = await workspaceFetch('/api/workspace/billing/price-plans', {
      token,
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        name: formName,
        interval: formInterval,
        amount,
        currency: formCurrency,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setModalOpen(false);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.detail === 'string' ? data.detail : 'Erro ao criar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Billing – Planos de preco</h2>
        <button
          onClick={openCreate}
          disabled={products.length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
          Novo plano
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-blue-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-white">{p.name}</p>
                  <p className="text-sm text-slate-400">
                    Produto ID: {p.product_id} · {p.interval}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-lg font-bold text-white">
                {p.currency} {p.amount.toFixed(2)} / {p.interval}
              </p>
            </motion.div>
          ))}
        </div>
      )}
      {!loading && plans.length === 0 && (
        <p className="text-center text-slate-400 py-12">Nenhum plano. Crie produtos primeiro.</p>
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
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Novo plano de preco</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Produto</label>
                <select
                  value={formProductId}
                  onChange={(e) => setFormProductId(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  {products.map((pr) => (
                    <option key={pr.id} value={pr.id}>
                      {pr.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Nome</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Intervalo</label>
                <select
                  value={formInterval}
                  onChange={(e) => setFormInterval(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  <option value="month">month</option>
                  <option value="year">year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Moeda</label>
                <input
                  type="text"
                  value={formCurrency}
                  onChange={(e) => setFormCurrency(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
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
