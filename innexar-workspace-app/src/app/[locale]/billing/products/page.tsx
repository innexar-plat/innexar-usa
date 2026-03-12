'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2, AlertCircle, Package, Pencil, Server, CreditCard } from 'lucide-react';
import { workspaceFetch, getStaffToken } from '@/lib/workspace-api';

const PROVISIONING_TYPES = [
  { value: '', label: 'Nenhum (produto simples)' },
  { value: 'hestia_hosting', label: 'Hestia – Hospedagem' },
] as const;

const INTERVAL_OPTIONS = [
  { value: 'month', label: 'Mensal' },
  { value: 'year', label: 'Anual' },
] as const;

interface HestiaPackageItem {
  name: string;
  [key: string]: unknown;
}

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
  description: string | null;
  is_active: boolean;
  provisioning_type: string | null;
  hestia_package: string | null;
  created_at: string;
  price_plans?: PricePlan[];
}

export default function WorkspaceBillingProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formProvisioningType, setFormProvisioningType] = useState('');
  const [formHestiaPackage, setFormHestiaPackage] = useState('');
  const [saving, setSaving] = useState(false);
  const [hestiaPackages, setHestiaPackages] = useState<HestiaPackageItem[]>([]);
  const [hestiaPackagesLoading, setHestiaPackagesLoading] = useState(false);
  // Plano de preço ao criar produto
  const [formPlanName, setFormPlanName] = useState('');
  const [formPlanAmount, setFormPlanAmount] = useState('');
  const [formPlanInterval, setFormPlanInterval] = useState<'month' | 'year'>('month');
  // Ao editar: planos do produto e adicionar novo
  const [productPlans, setProductPlans] = useState<PricePlan[]>([]);
  const [addPlanName, setAddPlanName] = useState('');
  const [addPlanAmount, setAddPlanAmount] = useState('');
  const [addPlanInterval, setAddPlanInterval] = useState<'month' | 'year'>('month');
  const [addingPlan, setAddingPlan] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);
  const [editPlanName, setEditPlanName] = useState('');
  const [editPlanAmount, setEditPlanAmount] = useState('');
  const [editPlanInterval, setEditPlanInterval] = useState<'month' | 'year'>('month');
  const [savingPlan, setSavingPlan] = useState(false);

  const [pricePlansByProduct, setPricePlansByProduct] = useState<Record<number, PricePlan[]>>({});

  const load = () => {
    const token = getStaffToken();
    if (!token) return;
    setLoading(true);
    workspaceFetch('/api/workspace/billing/products?with_plans=true', { token })
      .then((r) => (r.ok ? r.json() : []))
      .then((prods: Product[]) => {
        setProducts(prods);
        const byProduct: Record<number, PricePlan[]> = {};
        for (const p of prods) {
          if (p.price_plans?.length) byProduct[p.id] = p.price_plans;
        }
        setPricePlansByProduct(byProduct);
      })
      .catch(() => setError('Falha ao carregar produtos'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const loadHestiaPackages = () => {
    const token = getStaffToken();
    if (!token) return;
    setHestiaPackagesLoading(true);
    workspaceFetch('/api/workspace/hestia/packages', { token })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: HestiaPackageItem[]) => Array.isArray(list) ? list : [])
      .then(setHestiaPackages)
      .catch(() => setHestiaPackages([]))
      .finally(() => setHestiaPackagesLoading(false));
  };

  useEffect(() => {
    if (modalOpen && formProvisioningType === 'hestia_hosting' && hestiaPackages.length === 0 && !hestiaPackagesLoading) {
      loadHestiaPackages();
    }
  }, [modalOpen, formProvisioningType, hestiaPackages.length, hestiaPackagesLoading]);

  const openCreate = () => {
    setEditingId(null);
    cancelEditPlan();
    setFormName('');
    setFormDescription('');
    setFormIsActive(true);
    setFormProvisioningType('');
    setFormHestiaPackage('');
    setFormPlanName('');
    setFormPlanAmount('');
    setFormPlanInterval('month');
    setProductPlans([]);
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setEditingPlanId(null);
    setFormName(p.name);
    setFormDescription(p.description ?? '');
    setFormIsActive(p.is_active);
    setFormProvisioningType(p.provisioning_type ?? '');
    setFormHestiaPackage(p.hestia_package ?? '');
    setFormPlanName('');
    setFormPlanAmount('');
    setAddPlanName('');
    setAddPlanAmount('');
    setAddPlanInterval('month');
    setProductPlans([]);
    setModalOpen(true);
  };

  useEffect(() => {
    if (!modalOpen || !editingId) return;
    const token = getStaffToken();
    if (!token) return;
    workspaceFetch(`/api/workspace/billing/price-plans?product_id=${editingId}`, { token })
      .then((r) => (r.ok ? r.json() : []))
      .then(setProductPlans)
      .catch(() => setProductPlans([]));
  }, [modalOpen, editingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getStaffToken();
    if (!token) return;
    setSaving(true);
    setError('');
    const body = {
      name: formName,
      description: formDescription || null,
      is_active: formIsActive,
      provisioning_type: formProvisioningType || null,
      hestia_package: formHestiaPackage || null,
    };
    if (editingId) {
      const res = await workspaceFetch(`/api/workspace/billing/products/${editingId}`, {
        token,
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      setSaving(false);
      if (res.ok) {
        setModalOpen(false);
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.detail === 'string' ? data.detail : 'Falha ao salvar');
      }
      return;
    }
    const res = await workspaceFetch('/api/workspace/billing/products', {
      token,
      method: 'POST',
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSaving(false);
      setError(typeof data.detail === 'string' ? data.detail : 'Falha ao criar');
      return;
    }
    const productId = data?.id;
    const amount = formPlanAmount.trim() ? parseFloat(formPlanAmount.replace(',', '.')) : NaN;
    if (productId != null && !Number.isNaN(amount) && amount > 0) {
      await workspaceFetch('/api/workspace/billing/price-plans', {
        token,
        method: 'POST',
        body: JSON.stringify({
          product_id: productId,
          name: formPlanName.trim() || (formPlanInterval === 'year' ? 'Anual' : 'Mensal'),
          interval: formPlanInterval,
          amount,
          currency: 'BRL',
        }),
      });
    }
    setSaving(false);
    setModalOpen(false);
    load();
  };

  const handleAddPlan = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!editingId) return;
    const token = getStaffToken();
    if (!token) return;
    const amount = parseFloat(addPlanAmount.replace(',', '.'));
    if (Number.isNaN(amount) || amount <= 0) {
      setError('Informe um preço válido.');
      return;
    }
    setAddingPlan(true);
    setError('');
    const res = await workspaceFetch('/api/workspace/billing/price-plans', {
      token,
      method: 'POST',
      body: JSON.stringify({
        product_id: editingId,
        name: addPlanName.trim() || (addPlanInterval === 'year' ? 'Anual' : 'Mensal'),
        interval: addPlanInterval,
        amount,
        currency: 'BRL',
      }),
    });
    setAddingPlan(false);
    if (res.ok) {
      setAddPlanName('');
      setAddPlanAmount('');
      setAddPlanInterval('month');
      const list = await workspaceFetch(`/api/workspace/billing/price-plans?product_id=${editingId}`, { token }).then((r) => r.ok ? r.json() : []);
      setProductPlans(list);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.detail === 'string' ? data.detail : 'Falha ao adicionar plano');
    }
  };

  const startEditPlan = (pl: PricePlan) => {
    setEditingPlanId(pl.id);
    setEditPlanName(pl.name);
    setEditPlanAmount(Number(pl.amount).toFixed(2).replace('.', ','));
    setEditPlanInterval((pl.interval === 'year' ? 'year' : 'month') as 'month' | 'year');
    setError('');
  };

  const cancelEditPlan = () => {
    setEditingPlanId(null);
    setEditPlanName('');
    setEditPlanAmount('');
    setEditPlanInterval('month');
  };

  const handleSavePlan = async () => {
    if (editingPlanId == null) return;
    const token = getStaffToken();
    if (!token) return;
    const amount = parseFloat(editPlanAmount.replace(',', '.'));
    if (Number.isNaN(amount) || amount < 0) {
      setError('Preço inválido.');
      return;
    }
    setSavingPlan(true);
    setError('');
    const res = await workspaceFetch(`/api/workspace/billing/price-plans/${editingPlanId}`, {
      token,
      method: 'PATCH',
      body: JSON.stringify({
        name: editPlanName.trim() || (editPlanInterval === 'year' ? 'Anual' : 'Mensal'),
        interval: editPlanInterval,
        amount,
      }),
    });
    setSavingPlan(false);
    if (res.ok) {
      cancelEditPlan();
      if (editingId) {
        const list = await workspaceFetch(`/api/workspace/billing/price-plans?product_id=${editingId}`, { token }).then((r) => r.ok ? r.json() : []);
        setProductPlans(list);
      }
    } else {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.detail === 'string' ? data.detail : 'Falha ao salvar plano');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Billing – Produtos</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo produto
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
          {products.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Package className="w-8 h-8 text-blue-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{p.name}</p>
                    <p className="text-sm text-slate-400 truncate">
                      {p.provisioning_type === 'hestia_hosting'
                        ? `Hestia · ${p.hestia_package || 'pacote padrão'}`
                        : p.provisioning_type || 'Produto simples'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => openEdit(p)}
                  className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/5"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              {p.description && (
                <p className="mt-2 text-slate-400 text-sm line-clamp-2">{p.description}</p>
              )}
              {pricePlansByProduct[p.id]?.length > 0 && (
                <p className="mt-2 text-sm text-emerald-400 font-medium">
                  {pricePlansByProduct[p.id].length === 1
                    ? `R$ ${Number(pricePlansByProduct[p.id][0].amount).toFixed(2).replace('.', ',')} / ${pricePlansByProduct[p.id][0].interval === 'year' ? 'ano' : 'mês'}`
                    : `A partir de R$ ${Math.min(...pricePlansByProduct[p.id].map((pl) => pl.amount)).toFixed(2).replace('.', ',')}`}
                </p>
              )}
              <span
                className={`mt-2 inline-block px-3 py-1 rounded-lg text-sm ${
                  p.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'
                }`}
              >
                {p.is_active ? 'Ativo' : 'Inativo'}
              </span>
            </motion.div>
          ))}
        </div>
      )}
      {!loading && products.length === 0 && (
        <p className="text-center text-slate-400 py-12">Nenhum produto.</p>
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
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingId ? 'Editar produto' : 'Novo produto'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Nome do produto</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  required
                  placeholder="Ex.: Hospedagem Básica, Licença SaaS, Consultoria"
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Descrição</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={4}
                  placeholder="Descreva o produto para o catálogo e para o cliente (ex.: recursos, limites, o que está incluso)."
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="rounded bg-white/5 border-white/10 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-slate-300">Ativo (visível no catálogo e disponível para assinatura)</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tipo de provisionamento</label>
                <select
                  value={formProvisioningType}
                  onChange={(e) => {
                    setFormProvisioningType(e.target.value);
                    if (e.target.value !== 'hestia_hosting') setFormHestiaPackage('');
                  }}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PROVISIONING_TYPES.map(({ value, label }) => (
                    <option key={value || 'none'} value={value} className="bg-slate-800 text-white">
                      {label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-slate-500 mt-1">Produto simples = sem provisionamento automático. Hestia = cria conta e domínio no painel ao assinar.</p>
              </div>
              {formProvisioningType === 'hestia_hosting' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center gap-2">
                    <Server className="w-4 h-4 text-blue-400" />
                    Pacote Hestia
                  </label>
                  <select
                    value={formHestiaPackage}
                    onChange={(e) => setFormHestiaPackage(e.target.value)}
                    disabled={hestiaPackagesLoading}
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  >
                    <option value="" className="bg-slate-800">Selecione o pacote</option>
                    {hestiaPackages.map((pkg) => (
                      <option key={pkg.name} value={pkg.name} className="bg-slate-800">
                        {pkg.name}
                      </option>
                    ))}
                  </select>
                  {hestiaPackagesLoading && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Carregando pacotes do Hestia…
                    </p>
                  )}
                  {!hestiaPackagesLoading && hestiaPackages.length === 0 && (
                    <p className="text-xs text-amber-500 mt-1">Nenhum pacote encontrado. Verifique a integração Hestia em Config → Integrações.</p>
                  )}
                  {!hestiaPackagesLoading && hestiaPackages.length > 0 && !formHestiaPackage && (
                    <p className="text-xs text-slate-500 mt-1">Se não escolher, será usado o pacote padrão das configurações Hestia.</p>
                  )}
                </div>
              )}
              {!editingId && (
                <>
                  <div className="border-t border-white/10 pt-4 mt-2">
                    <p className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-blue-400" />
                      Plano de preço (opcional)
                    </p>
                    <p className="text-xs text-slate-500 mb-3">Preencha para criar um plano junto com o produto. Depois você pode adicionar mais planos ao editar.</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs text-slate-400 mb-1">Nome do plano</label>
                        <input
                          type="text"
                          value={formPlanName}
                          onChange={(e) => setFormPlanName(e.target.value)}
                          placeholder="Ex.: Mensal"
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Período</label>
                        <select
                          value={formPlanInterval}
                          onChange={(e) => setFormPlanInterval(e.target.value as 'month' | 'year')}
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                        >
                          {INTERVAL_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value} className="bg-slate-800">{label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Preço (R$)</label>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={formPlanAmount}
                          onChange={(e) => setFormPlanAmount(e.target.value.replace(/[^0-9,.]/g, ''))}
                          placeholder="0,00"
                          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
              {editingId && productPlans.length > 0 && (
                <div className="border-t border-white/10 pt-4 mt-2">
                  <p className="text-sm font-medium text-slate-300 mb-2 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-400" />
                    Planos de preço
                  </p>
                  <ul className="space-y-2 mb-3">
                    {productPlans.map((pl) => (
                      <li key={pl.id} className="text-sm text-slate-400">
                        {editingPlanId === pl.id ? (
                          <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
                            <input
                              type="text"
                              value={editPlanName}
                              onChange={(e) => setEditPlanName(e.target.value)}
                              placeholder="Nome"
                              className="flex-1 min-w-[80px] px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-sm"
                            />
                            <select
                              value={editPlanInterval}
                              onChange={(e) => setEditPlanInterval(e.target.value as 'month' | 'year')}
                              className="px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-sm"
                            >
                              {INTERVAL_OPTIONS.map(({ value, label }) => (
                                <option key={value} value={value} className="bg-slate-800">{label}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={editPlanAmount}
                              onChange={(e) => setEditPlanAmount(e.target.value.replace(/[^0-9,.]/g, ''))}
                              placeholder="R$"
                              className="w-20 px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-sm"
                            />
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleSavePlan()}
                                disabled={savingPlan}
                                className="px-2 py-1 rounded bg-blue-500/80 text-white text-xs hover:bg-blue-500 disabled:opacity-50 flex items-center gap-1"
                              >
                                {savingPlan && <Loader2 className="w-3 h-3 animate-spin" />}
                                Salvar
                              </button>
                              <button
                                type="button"
                                onClick={() => cancelEditPlan()}
                                className="px-2 py-1 rounded bg-white/10 text-slate-300 text-xs hover:bg-white/15"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center gap-2">
                            <span>{pl.name}</span>
                            <span className="flex items-center gap-2">
                              <span className="text-white">R$ {Number(pl.amount).toFixed(2).replace('.', ',')} / {pl.interval === 'year' ? 'ano' : 'mês'}</span>
                              <button
                                type="button"
                                onClick={() => startEditPlan(pl)}
                                className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-white/10"
                                title="Editar plano"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                            </span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {editingId && (
                <div className="border-t border-white/10 pt-4 mt-2 space-y-3">
                  <p className="text-sm font-medium text-slate-300">Adicionar plano</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2 sm:col-span-1">
                      <input
                        type="text"
                        value={addPlanName}
                        onChange={(e) => setAddPlanName(e.target.value)}
                        placeholder="Nome (ex.: Anual)"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <select
                        value={addPlanInterval}
                        onChange={(e) => setAddPlanInterval(e.target.value as 'month' | 'year')}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                      >
                        {INTERVAL_OPTIONS.map(({ value, label }) => (
                          <option key={value} value={value} className="bg-slate-800">{label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={addPlanAmount}
                        onChange={(e) => setAddPlanAmount(e.target.value.replace(/[^0-9,.]/g, ''))}
                        placeholder="Preço R$"
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-slate-500"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddPlan()}
                    disabled={addingPlan || !addPlanAmount.trim()}
                    className="text-sm px-3 py-1.5 rounded-lg bg-white/10 text-slate-300 hover:bg-white/15 disabled:opacity-50 flex items-center gap-1"
                  >
                    {addingPlan && <Loader2 className="w-3 h-3 animate-spin" />}
                    Adicionar plano
                  </button>
                </div>
              )}
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
                  {editingId ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
