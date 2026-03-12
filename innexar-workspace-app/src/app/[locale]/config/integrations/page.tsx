'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2, AlertCircle, Settings, PlayCircle, Pencil } from 'lucide-react';
import { workspaceFetch, getStaffToken } from '@/lib/workspace-api';

interface Integration {
  id: number;
  provider: string;
  key: string;
  value_masked: string;
  mode: string;
  enabled: boolean;
  last_tested_at: string | null;
  created_at: string;
}

export default function WorkspaceConfigIntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [testingId, setTestingId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formProvider, setFormProvider] = useState('stripe');
  const [formKey, setFormKey] = useState('secret_key');
  const [formValue, setFormValue] = useState('');
  const [formMode, setFormMode] = useState('test');
  const [formEnabled, setFormEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingValueMasked, setEditingValueMasked] = useState<string | null>(null);
  const [formHestiaBaseUrl, setFormHestiaBaseUrl] = useState('');
  const [formHestiaAccessKey, setFormHestiaAccessKey] = useState('');
  const [formHestiaSecretKey, setFormHestiaSecretKey] = useState('');

  const load = () => {
    const token = getStaffToken();
    if (!token) return;
    setLoading(true);
    workspaceFetch('/api/workspace/config/integrations', { token })
      .then((r) => (r.ok ? r.json() : []))
      .then(setIntegrations)
      .catch(() => setError('Erro ao carregar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setFormProvider('stripe');
    setFormKey('secret_key');
    setFormValue('');
    setEditingValueMasked(null);
    setFormHestiaBaseUrl('');
    setFormHestiaAccessKey('');
    setFormHestiaSecretKey('');
    setFormMode('test');
    setFormEnabled(true);
    setModalOpen(true);
  };

  const openEdit = (i: Integration) => {
    setEditingId(i.id);
    setFormProvider(i.provider);
    setFormKey(i.key);
    setFormValue('');
    setEditingValueMasked(i.value_masked ?? null);
    setFormHestiaBaseUrl('');
    setFormHestiaAccessKey('');
    setFormHestiaSecretKey('');
    setFormMode(i.mode);
    setFormEnabled(i.enabled);
    setModalOpen(true);
  };

  const handleTest = async (id: number) => {
    const token = getStaffToken();
    if (!token) return;
    setTestingId(id);
    setError('');
    const res = await workspaceFetch(
      `/api/workspace/config/integrations/${id}/test`,
      { token, method: 'POST' }
    );
    setTestingId(null);
    const data = await res.json().catch(() => ({}));
    if (data.ok) {
      alert(data.message ?? 'OK');
      load();
    } else {
      setError(data.error ?? 'Falha no teste');
    }
  };

  const isHestia = formProvider === 'hestia';

  const getSubmitValue = (): string | undefined => {
    if (isHestia) {
      const base = formHestiaBaseUrl.trim();
      const access = formHestiaAccessKey.trim();
      const secret = formHestiaSecretKey.trim();
      if (editingId !== null && !base && !access && !secret) return undefined;
      if (!base || !access || !secret) return undefined;
      return JSON.stringify({
        base_url: base.replace(/\/$/, ''),
        access_key: access,
        secret_key: secret,
      });
    }
    return formValue.trim() || undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getStaffToken();
    if (!token) return;
    if (isHestia && editingId === null) {
      if (!formHestiaBaseUrl.trim() || !formHestiaAccessKey.trim() || !formHestiaSecretKey.trim()) {
        setError('Preencha URL base, Access key e Secret key.');
        return;
      }
    }
    if (isHestia && editingId !== null) {
      const v = getSubmitValue();
      if (v === undefined && (formHestiaBaseUrl.trim() || formHestiaAccessKey.trim() || formHestiaSecretKey.trim())) {
        setError('Para atualizar Hestia, preencha os três campos: URL base, Access key e Secret key.');
        return;
      }
    }
    setSaving(true);
    setError('');
    if (editingId !== null) {
      const body: { value?: string; mode: string; enabled: boolean } = {
        mode: formMode,
        enabled: formEnabled,
      };
      const submitValue = getSubmitValue();
      if (submitValue) body.value = submitValue;
      const res = await workspaceFetch(`/api/workspace/config/integrations/${editingId}`, {
        token,
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      setSaving(false);
      if (res.ok) {
        setModalOpen(false);
        setEditingId(null);
        setEditingValueMasked(null);
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.detail === 'string' ? data.detail : 'Erro ao salvar');
      }
      return;
    }
    const submitValue = getSubmitValue();
    const res = await workspaceFetch('/api/workspace/config/integrations', {
      token,
      method: 'POST',
      body: JSON.stringify({
        scope: 'workspace',
        provider: formProvider,
        key: formKey,
        value: isHestia ? submitValue : formValue,
        mode: formMode,
        enabled: formEnabled,
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
        <h2 className="text-2xl font-bold text-white">Config – Integracoes</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium"
        >
          <Plus className="w-5 h-5" />
          Nova integracao
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
          {integrations.map((i) => (
            <motion.div
              key={i.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Settings className="w-8 h-8 text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-white">{i.provider}</p>
                    <p className="text-sm text-slate-400">{i.key}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(i)}
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/5"
                    title="Editar"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleTest(i.id)}
                    disabled={testingId === i.id}
                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/5 disabled:opacity-50"
                    title="Testar"
                  >
                    {testingId === i.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <PlayCircle className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500 font-mono truncate">{i.value_masked}</p>
              <div className="mt-2 flex gap-2">
                <span className={`px-2 py-0.5 rounded text-xs ${i.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                  {i.enabled ? 'Ativo' : 'Inativo'}
                </span>
                <span className="px-2 py-0.5 rounded text-xs bg-white/5 text-slate-400">{i.mode}</span>
              </div>
              {i.last_tested_at && (
                <p className="mt-1 text-xs text-slate-500">Testado: {new Date(i.last_tested_at).toLocaleString()}</p>
              )}
            </motion.div>
          ))}
        </div>
      )}
      {!loading && integrations.length === 0 && (
        <p className="text-center text-slate-400 py-12">Nenhuma integracao.</p>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setModalOpen(false); setEditingId(null); setEditingValueMasked(null); }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">{editingId !== null ? 'Editar integracao' : 'Nova integracao'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Provider</label>
                {editingId !== null ? (
                  <input type="text" value={formProvider} readOnly className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400" />
                ) : (
                  <select value={formProvider} onChange={(e) => { setFormProvider(e.target.value); if (e.target.value === 'stripe') setFormKey('secret_key'); if (e.target.value === 'mercadopago') setFormKey('access_token'); if (e.target.value === 'hestia') setFormKey('api_credentials'); if (e.target.value === 'smtp') setFormKey('config'); }} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="stripe">stripe</option>
                    <option value="mercadopago">mercadopago</option>
                    <option value="hestia">hestia</option>
                    <option value="smtp">smtp</option>
                  </select>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Key</label>
                <input type="text" value={formKey} readOnly={editingId !== null} className={`w-full px-4 py-2 rounded-xl border border-white/10 font-mono text-sm ${editingId !== null ? 'bg-white/5 text-slate-400' : 'bg-white/5 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500'}`} />
              </div>
              {isHestia ? (
                <>
                  <p className="text-xs text-slate-400 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                    No Hestia: <strong>User → API</strong>. Cole o <strong>ID da chave de acesso</strong> e a <strong>Chave Secreta</strong> (copie a Chave Secreta antes de fechar a tela no Hestia — ele não mostra de novo).
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">URL base</label>
                    <input
                      type="url"
                      value={formHestiaBaseUrl}
                      onChange={(e) => setFormHestiaBaseUrl(e.target.value)}
                      placeholder="https://hosting.innexar.com.br:8083"
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      aria-label="URL base do Hestia"
                    />
                    <p className="text-xs text-slate-500 mt-1">URL do painel Hestia (com porta, ex.: 8083).</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">ID da chave de acesso</label>
                    <input
                      type="text"
                      value={formHestiaAccessKey}
                      onChange={(e) => setFormHestiaAccessKey(e.target.value)}
                      placeholder="Ex.: xxxxx (ID que o Hestia exibe)"
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoComplete="off"
                      aria-label="ID da chave de acesso (Hestia)"
                    />
                    <p className="text-xs text-slate-500 mt-1">Valor que o Hestia exibe como &quot;ID da chave de acesso&quot;.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Chave Secreta</label>
                    <input
                      type="password"
                      value={formHestiaSecretKey}
                      onChange={(e) => setFormHestiaSecretKey(e.target.value)}
                      placeholder="Copie no Hestia antes de fechar a tela"
                      className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoComplete="new-password"
                      aria-label="Chave Secreta (Hestia)"
                    />
                    <p className="text-xs text-amber-600 mt-1">Atenção: o Hestia mostra a Chave Secreta só uma vez. Salve antes de fechar.</p>
                  </div>
                  {editingId !== null && (
                    <p className="text-xs text-slate-500">Deixe os três campos em branco para manter as credenciais atuais.</p>
                  )}
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Value</label>
                  {editingId !== null && editingValueMasked && (
                    <p className="text-xs text-slate-500 mb-1 font-mono break-all" title="Valor atual (mascarado)">
                      Atual: {editingValueMasked}
                    </p>
                  )}
                  <textarea
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    required={editingId === null}
                    rows={3}
                    placeholder="JSON ou valor da chave"
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-y"
                    aria-label="Valor da integração"
                  />
                  {editingId !== null && (
                    <p className="text-xs text-slate-500 mt-1">Deixe em branco para manter o valor atual.</p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mode</label>
                <select value={formMode} onChange={(e) => setFormMode(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="test">test</option>
                  <option value="live">live</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={formEnabled} onChange={(e) => setFormEnabled(e.target.checked)} className="rounded border-white/20 text-blue-600 focus:ring-blue-500 bg-white/5" />
                  <span className="text-sm font-medium text-slate-300">Habilitado</span>
                </label>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => { setModalOpen(false); setEditingId(null); setEditingValueMasked(null); }} className="px-4 py-2 rounded-xl bg-white/10 text-slate-300 hover:bg-white/20 font-medium">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 font-medium">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId !== null ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
