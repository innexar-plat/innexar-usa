'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Server, Package } from 'lucide-react';
import { workspaceFetch, getStaffToken } from '@/lib/workspace-api';

interface PackageItem {
  name: string;
  [key: string]: unknown;
}

export default function WorkspaceHestiaPackagesPage() {
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getStaffToken();
    if (!token) return;
    setLoading(true);
    setError('');
    workspaceFetch('/api/workspace/hestia/packages', { token })
      .then((r) => {
        if (!r.ok) throw new Error('Falha ao carregar');
        return r.json();
      })
      .then(setPackages)
      .catch(() => setError('Erro ao carregar pacotes. Verifique se o Hestia está configurado.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <Server className="w-8 h-8 text-blue-400" />
        Hestia – Pacotes
      </h2>
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
          {packages.map((p) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 flex items-center gap-3"
            >
              <Package className="w-8 h-8 text-blue-400 flex-shrink-0" />
              <p className="font-mono font-semibold text-white">{p.name}</p>
            </motion.div>
          ))}
        </div>
      )}
      {!loading && packages.length === 0 && !error && (
        <p className="text-center text-slate-400 py-12">Nenhum pacote listado.</p>
      )}
    </div>
  );
}
