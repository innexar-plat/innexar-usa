'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Server, Save } from 'lucide-react';
import { workspaceFetch, getStaffToken } from '@/lib/workspace-api';

interface HestiaSettings {
  grace_period_days: number;
  default_hestia_package: string | null;
  auto_suspend_enabled: boolean;
}

export default function WorkspaceConfigHestiaPage() {
  const [settings, setSettings] = useState<HestiaSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formGraceDays, setFormGraceDays] = useState('7');
  const [formDefaultPackage, setFormDefaultPackage] = useState('');
  const [formAutoSuspend, setFormAutoSuspend] = useState(true);

  const load = () => {
    const token = getStaffToken();
    if (!token) return;
    setLoading(true);
    workspaceFetch('/api/workspace/config/hestia/settings', { token })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: HestiaSettings | null) => {
        setSettings(data ?? null);
        if (data) {
          setFormGraceDays(String(data.grace_period_days));
          setFormDefaultPackage(data.default_hestia_package ?? '');
          setFormAutoSuspend(data.auto_suspend_enabled);
        }
      })
      .catch(() => setError('Erro ao carregar'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getStaffToken();
    if (!token) return;
    const graceDays = parseInt(formGraceDays, 10);
    if (Number.isNaN(graceDays) || graceDays < 0) {
      setError('Prazo de carencia deve ser um numero >= 0');
      return;
    }
    setSaving(true);
    setError('');
    const res = await workspaceFetch('/api/workspace/config/hestia/settings', {
      token,
      method: 'PUT',
      body: JSON.stringify({
        grace_period_days: graceDays,
        default_hestia_package: formDefaultPackage || null,
        auto_suspend_enabled: formAutoSuspend,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const data = await res.json();
      setSettings(data);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(typeof data.detail === 'string' ? data.detail : 'Erro ao salvar');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Server className="w-8 h-8 text-blue-400" />
        <h2 className="text-2xl font-bold text-white">Config – Hestia</h2>
      </div>
      <p className="text-slate-400 text-sm">
        Configuracoes de provisionamento e inadimplencia (suspensao automatica apos prazo de carencia).
      </p>

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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 max-w-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Prazo de carencia (dias)
              </label>
              <input
                type="number"
                min={0}
                value={formGraceDays}
                onChange={(e) => setFormGraceDays(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              />
              <p className="mt-1 text-xs text-slate-500">
                Apos quantos dias apos o vencimento a assinatura e suspensa (Hestia + status).
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Pacote Hestia padrao
              </label>
              <input
                type="text"
                value={formDefaultPackage}
                onChange={(e) => setFormDefaultPackage(e.target.value)}
                placeholder="ex: default"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white"
              />
              <p className="mt-1 text-xs text-slate-500">
                Nome do pacote usado ao provisionar novos clientes (se aplicavel).
              </p>
            </div>
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formAutoSuspend}
                  onChange={(e) => setFormAutoSuspend(e.target.checked)}
                  className="rounded bg-white/5 border-white/10"
                />
                <span className="text-sm text-slate-300">Suspensao automatica habilitada</span>
              </label>
              <p className="mt-1 text-xs text-slate-500 ml-6">
                Ao rodar process-overdue, usuarios inadimplentes sao suspensos no Hestia.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50"
              >
                {saving && <Loader2 className="w-5 h-5 animate-spin" />}
                <Save className="w-5 h-5" />
                Salvar
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  );
}
