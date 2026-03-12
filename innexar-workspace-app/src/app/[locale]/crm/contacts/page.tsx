'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2, AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { workspaceFetch, getStaffToken } from '@/lib/workspace-api';

interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  customer_id: number | null;
  created_at: string;
}

export default function WorkspaceCrmContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = () => {
    const token = getStaffToken();
    if (!token) return;
    setLoading(true);
    workspaceFetch('/api/workspace/crm/contacts', { token })
      .then((r) => (r.ok ? r.json() : []))
      .then(setContacts)
      .catch(() => setError('Failed to load contacts'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormCustomerId('');
    setModalOpen(true);
  };

  const openEdit = (c: Contact) => {
    setEditingId(c.id);
    setFormName(c.name);
    setFormEmail(c.email ?? '');
    setFormPhone(c.phone ?? '');
    setFormCustomerId(c.customer_id != null ? String(c.customer_id) : '');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getStaffToken();
    if (!token) return;
    setSaving(true);
    setError('');
    const body = {
      name: formName,
      email: formEmail || null,
      phone: formPhone || null,
      customer_id: formCustomerId ? parseInt(formCustomerId, 10) : null,
    };
    const url = editingId
      ? `/api/workspace/crm/contacts/${editingId}`
      : '/api/workspace/crm/contacts';
    const method = editingId ? 'PATCH' : 'POST';
    const res = await workspaceFetch(url, {
      token,
      method,
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) {
      setModalOpen(false);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(Array.isArray(data.detail) ? String(data.detail[0]) : (data.detail ?? 'Failed to save'));
    }
  };

  const handleDelete = async (id: number) => {
    const token = getStaffToken();
    if (!token) return;
    setDeletingId(id);
    const res = await workspaceFetch(`/api/workspace/crm/contacts/${id}`, {
      token,
      method: 'DELETE',
    });
    setDeletingId(null);
    if (res.ok) load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Contatos</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo contato
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
        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Nome</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Email</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Telefone</th>
                  <th className="text-left py-4 px-4 text-slate-400 font-medium">Customer ID</th>
                  <th className="text-right py-4 px-4 text-slate-400 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white font-medium">{c.name}</td>
                    <td className="py-3 px-4 text-slate-300">{c.email ?? '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{c.phone ?? '-'}</td>
                    <td className="py-3 px-4 text-slate-300">{c.customer_id ?? '-'}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/5 mr-2"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {deletingId === c.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {contacts.length === 0 && (
            <p className="py-12 text-center text-slate-400">Nenhum contato.</p>
          )}
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
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingId ? 'Editar contato' : 'Novo contato'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-sm text-slate-400 mb-1">Email</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Telefone</label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Customer ID</label>
                <input
                  type="number"
                  value={formCustomerId}
                  onChange={(e) => setFormCustomerId(e.target.value)}
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
