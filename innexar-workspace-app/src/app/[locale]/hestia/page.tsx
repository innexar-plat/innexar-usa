'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Server, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { workspaceFetch, getStaffToken } from '@/lib/workspace-api';

interface Overview {
  connected: boolean;
  total_users: number;
  error?: string;
}

export default function WorkspaceHestiaOverviewPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getStaffToken();
    if (!token) return;
    setLoading(true);
    setError('');
    workspaceFetch('/api/workspace/hestia/overview', { token })
      .then((r) => (r.ok ? r.json() : null))
      .then(setOverview)
      .catch(() => setError('Erro ao carregar'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <Server className="w-8 h-8 text-blue-400" />
        Hestia – Visão geral
      </h2>
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : overview ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 sm:grid-cols-2">
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              {overview.connected ? <CheckCircle className="w-10 h-10 text-emerald-400 flex-shrink-0" /> : <XCircle className="w-10 h-10 text-amber-400 flex-shrink-0" />}
              <div>
                <p className="font-semibold text-white">Conexão</p>
                <p className="text-sm text-slate-400">{overview.connected ? 'Conectado ao Hestia' : 'Não conectado'}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
            <p className="font-semibold text-white">Total de usuários</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{overview.total_users}</p>
          </div>
          {overview.error && (
            <div className="sm:col-span-2 flex flex-col gap-2 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{overview.error}</p>
              </div>
              {(overview.error.includes('401') || overview.error.includes('Credenciais')) && (
                <p className="text-sm text-amber-300/90 pl-8">
                  No painel Hestia: acesse com seu usuário → <strong>User</strong> → <strong>API</strong> → confira ou gere novas chaves (Access key / Secret key) e atualize em <strong>Configurações → Integrações → Editar</strong> no card Hestia.
                </p>
              )}
            </div>
          )}
        </motion.div>
      ) : (
        <p className="text-slate-400">Nenhum dado.</p>
      )}
    </div>
  );
}
