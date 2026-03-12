'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Plus, Loader2, AlertCircle, Server, Globe, Trash2, Pause, Play } from 'lucide-react';
import { workspaceFetch, getStaffToken } from '@/lib/workspace-api';

interface UserItem {
  name: string;
  [key: string]: unknown;
}

export default function WorkspaceHestiaUsersPage() {
  const locale = useLocale();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<string | null>(null);
  const [formUser, setFormUser] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPackage, setFormPackage] = useState('default');
  const [saving, setSaving] = useState(false);
  const [actioning, setActioning] = useState<string | null>(null);

  const load = () => {
    const token = getStaffToken();
    if (!token) return;
    setLoading(true);
    workspaceFetch('/api/workspace/hestia/users', { token })
      .then((r) => {
        if (!r.ok) throw new Error('Falha ao carregar');
        return r.json();
      })
      .then(setUsers)
      .catch(() => setError('Erro ao carregar usuários'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setFormUser('');
    setFormPassword('');
    setFormEmail('');
    setFormPackage('default');
    setModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getStaffToken();
    if (!token) return;
    setSaving(true);
    setError('');
    const res = await workspaceFetch('/api/workspace/hestia/users', {
      token,
      method: 'POST',
      body: JSON.stringify({
        user: formUser,
        password: formPassword,
        email: formEmail,
        package: formPackage,
      }),
    });
    setSaving(false);
    if (res.ok) {
      setModalOpen(false);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.detail ?? 'Erro ao criar usuário');
    }
  };

  const handleDeleteClick = (user: string) => setDeleteConfirmUser(user);

  const handleDeleteConfirm = async () => {
    const user = deleteConfirmUser;
    if (!user) return;
    const token = getStaffToken();
    if (!token) return;
    setActioning(user);
    setDeleteConfirmUser(null);
    const res = await workspaceFetch(`/api/workspace/hestia/users/${encodeURIComponent(user)}`, {
      token,
      method: 'DELETE',
    });
    setActioning(null);
    if (res.ok) load();
    else setError('Erro ao remover usuário');
  };

  const handleSuspend = async (user: string) => {
    const token = getStaffToken();
    if (!token) return;
    setActioning(user);
    const res = await workspaceFetch(`/api/workspace/hestia/users/${encodeURIComponent(user)}/suspend`, {
      token,
      method: 'POST',
    });
    setActioning(null);
    if (res.ok) load();
  };

  const handleUnsuspend = async (user: string) => {
    const token = getStaffToken();
    if (!token) return;
    setActioning(user);
    const res = await workspaceFetch(`/api/workspace/hestia/users/${encodeURIComponent(user)}/unsuspend`, {
      token,
      method: 'POST',
    });
    setActioning(null);
    if (res.ok) load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Server className="w-8 h-8 text-blue-400" />
          Hestia – Usuários
        </h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo usuário
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
          {users.map((u) => (
            <motion.div
              key={u.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-white font-mono">{u.name}</p>
                <div className="flex items-center gap-1">
                  <Link
                    href={`/${locale}/hestia/domains?user=${encodeURIComponent(u.name)}`}
                    className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/5"
                    title="Ver domínios"
                  >
                    <Globe className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleSuspend(u.name)}
                    disabled={!!actioning}
                    className="p-2 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-white/5 disabled:opacity-50"
                    title="Suspender"
                  >
                    <Pause className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleUnsuspend(u.name)}
                    disabled={!!actioning}
                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-white/5 disabled:opacity-50"
                    title="Reativar"
                  >
                    <Play className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(u.name)}
                    disabled={!!actioning}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 disabled:opacity-50"
                    title="Excluir"
                  >
                    {actioning === u.name ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Trash2 className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {!loading && users.length === 0 && (
        <p className="text-center text-slate-400 py-12">Nenhum usuário no Hestia.</p>
      )}

      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-2">Remover usuário</h3>
            <p className="text-slate-400 text-sm mb-6">
              Remover usuário &quot;{deleteConfirmUser}&quot; e dados associados? Esta ação não pode ser desfeita.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setDeleteConfirmUser(null)}
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

      {modalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Novo usuário Hestia</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Usuário</label>
                <input
                  type="text"
                  value={formUser}
                  onChange={(e) => setFormUser(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Senha</label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">E-mail</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Pacote</label>
                <input
                  type="text"
                  value={formPackage}
                  onChange={(e) => setFormPackage(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/20 font-medium"
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
