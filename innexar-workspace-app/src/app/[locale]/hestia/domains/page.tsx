'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Loader2, AlertCircle, Server, Trash2 } from 'lucide-react';
import { workspaceFetch, getStaffToken } from '@/lib/workspace-api';

interface DomainItem {
  name: string;
  [key: string]: unknown;
}

export default function WorkspaceHestiaDomainsPage() {
  const searchParams = useSearchParams();
  const userParam = searchParams.get('user') ?? '';
  const [users, setUsers] = useState<{ name: string }[]>([]);
  const [selectedUser, setSelectedUser] = useState(userParam);
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDomains, setLoadingDomains] = useState(false);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [formDomain, setFormDomain] = useState('');
  const [formIp, setFormIp] = useState('');
  const [formAliases, setFormAliases] = useState('www');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteConfirmDomain, setDeleteConfirmDomain] = useState<string | null>(null);

  useEffect(() => {
    const token = getStaffToken();
    if (!token) return;
    setLoading(true);
    workspaceFetch('/api/workspace/hestia/users', { token })
      .then((r) => (r.ok ? r.json() : []))
      .then((list: { name: string }[]) => setUsers(list.map((u) => ({ name: u.name }))))
      .catch(() => setError('Erro ao carregar usuários'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (userParam) setSelectedUser(userParam);
  }, [userParam]);

  useEffect(() => {
    if (!selectedUser) {
      setDomains([]);
      return;
    }
    const token = getStaffToken();
    if (!token) return;
    setLoadingDomains(true);
    workspaceFetch(`/api/workspace/hestia/users/${encodeURIComponent(selectedUser)}/domains`, { token })
      .then((r) => (r.ok ? r.json() : []))
      .then(setDomains)
      .catch(() => setDomains([]))
      .finally(() => setLoadingDomains(false));
  }, [selectedUser]);

  const loadDomains = () => {
    if (!selectedUser) return;
    const token = getStaffToken();
    if (!token) return;
    setLoadingDomains(true);
    workspaceFetch(`/api/workspace/hestia/users/${encodeURIComponent(selectedUser)}/domains`, { token })
      .then((r) => (r.ok ? r.json() : []))
      .then(setDomains)
      .finally(() => setLoadingDomains(false));
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    const token = getStaffToken();
    if (!token) return;
    setSaving(true);
    setError('');
    const res = await workspaceFetch(`/api/workspace/hestia/users/${encodeURIComponent(selectedUser)}/domains`, {
      token,
      method: 'POST',
      body: JSON.stringify({ domain: formDomain, ip: formIp, aliases: formAliases }),
    });
    setSaving(false);
    if (res.ok) {
      setModalOpen(false);
      setFormDomain('');
      setFormIp('');
      setFormAliases('www');
      loadDomains();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.detail ?? 'Erro ao adicionar domínio');
    }
  };

  const handleDeleteClick = (domain: string) => setDeleteConfirmDomain(domain);

  const handleDeleteConfirm = async () => {
    const domain = deleteConfirmDomain;
    if (!domain || !selectedUser) return;
    const token = getStaffToken();
    if (!token) return;
    setDeleting(domain);
    setDeleteConfirmDomain(null);
    const res = await workspaceFetch(
      `/api/workspace/hestia/users/${encodeURIComponent(selectedUser)}/domains/${encodeURIComponent(domain)}`,
      { token, method: 'DELETE' }
    );
    setDeleting(null);
    if (res.ok) loadDomains();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white flex items-center gap-3">
        <Server className="w-8 h-8 text-blue-400" />
        Hestia – Domínios
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
        <>
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-slate-400 font-medium">Usuário</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione</option>
              {users.map((u) => (
                <option key={u.name} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
            {selectedUser && (
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium"
              >
                <Plus className="w-5 h-5" />
                Adicionar domínio
              </button>
            )}
          </div>
          {selectedUser && (
            loadingDomains ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {domains.map((d) => (
                  <motion.div
                    key={d.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 flex items-center justify-between"
                  >
                    <p className="font-mono text-white">{d.name}</p>
                    <button
                      onClick={() => handleDeleteClick(d.name)}
                      disabled={!!deleting}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 disabled:opacity-50"
                      title="Excluir"
                    >
                      {deleting === d.name ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  </motion.div>
                ))}
              </div>
            )
          )}
          {selectedUser && !loadingDomains && domains.length === 0 && (
            <p className="text-slate-400">Nenhum domínio para este usuário.</p>
          )}
        </>
      )}

      {deleteConfirmDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-2">Remover domínio</h3>
            <p className="text-slate-400 text-sm mb-6">
              Remover domínio &quot;{deleteConfirmDomain}&quot;? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirmDomain(null)}
                className="px-4 py-2 rounded-xl bg-slate-600 hover:bg-slate-500 text-white font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {modalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} onClick={(e) => e.stopPropagation()} className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-white mb-4">Adicionar domínio – {selectedUser}</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Domínio</label>
                <input type="text" value={formDomain} onChange={(e) => setFormDomain(e.target.value)} required className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">IP (opcional)</label>
                <input type="text" value={formIp} onChange={(e) => setFormIp(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Aliases</label>
                <input type="text" value={formAliases} onChange={(e) => setFormAliases(e.target.value)} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 font-medium">Cancelar</button>
                <button type="submit" disabled={saving} className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2 font-medium">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Adicionar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
