'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Plus, Loader2, AlertCircle, FolderOpen, Pencil } from 'lucide-react';
import {
  workspaceFetchStaff,
  getStaffToken,
  parseWorkspaceError,
} from "@/lib/workspace-api";
import { WORKSPACE_API_PATHS } from "@/lib/workspace-api-paths";
import { TableSkeleton } from "@/components/table-skeleton";

interface Project {
  id: number;
  customer_id: number;
  name: string;
  status: string;
  created_at: string;
}

export default function WorkspaceProjectsPage() {
  const locale = useLocale();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formName, setFormName] = useState('');
  const [formStatus, setFormStatus] = useState('active');
  const [formCustomerId, setFormCustomerId] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback((signal?: AbortSignal) => {
    if (!getStaffToken()) return;
    setLoading(true);
    workspaceFetchStaff(WORKSPACE_API_PATHS.PROJECTS.LIST, { signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!signal?.aborted) setProjects(data);
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return;
        setError("Falha ao carregar projetos");
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false);
      });
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  const openCreate = () => {
    setEditingId(null);
    setFormName('');
    setFormStatus('active');
    setFormCustomerId('');
    setModalOpen(true);
  };

  const openEdit = (p: Project) => {
    setEditingId(p.id);
    setFormName(p.name);
    setFormStatus(p.status);
    setFormCustomerId(String(p.customer_id));
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!getStaffToken()) return;
    setSaving(true);
    setError("");
    if (editingId) {
      const res = await workspaceFetchStaff(
        WORKSPACE_API_PATHS.PROJECTS.DETAIL(editingId),
        {
          method: "PATCH",
          body: JSON.stringify({ name: formName, status: formStatus }),
        }
      );
      setSaving(false);
      if (res.ok) {
        setModalOpen(false);
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(parseWorkspaceError(data) || "Falha ao atualizar projeto");
      }
    } else {
      const customerId = parseInt(formCustomerId, 10);
      if (Number.isNaN(customerId)) {
        setError("ID do cliente inválido");
        setSaving(false);
        return;
      }
      const res = await workspaceFetchStaff(WORKSPACE_API_PATHS.PROJECTS.LIST, {
        method: "POST",
        body: JSON.stringify({
          customer_id: customerId,
          name: formName,
          status: formStatus,
        }),
      });
      setSaving(false);
      if (res.ok) {
        setModalOpen(false);
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(parseWorkspaceError(data) || "Falha ao criar projeto");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">Projetos</h2>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium"
        >
          <Plus className="w-5 h-5" />
          Novo projeto
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={6} cols={3} className="mt-2" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 flex flex-col"
            >
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/${locale}/projects/${p.id}`}
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <FolderOpen className="w-8 h-8 text-blue-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-white truncate">{p.name}</p>
                    <p className="text-sm text-slate-400">ID: {p.id} · Cliente: {p.customer_id}</p>
                  </div>
                </Link>
                <button
                  onClick={() => openEdit(p)}
                  className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-white/5"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
              <span className="mt-2 inline-block px-3 py-1 rounded-lg bg-white/5 text-slate-300 text-sm w-fit">
                {p.status}
              </span>
            </motion.div>
          ))}
        </div>
      )}
      {!loading && projects.length === 0 && (
        <p className="text-center text-slate-400 py-12">Nenhum projeto.</p>
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
              {editingId ? 'Editar projeto' : 'Novo projeto'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingId && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Customer ID</label>
                  <input
                    type="number"
                    value={formCustomerId}
                    onChange={(e) => setFormCustomerId(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                  />
                </div>
              )}
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
                <label className="block text-sm text-slate-400 mb-1">Status</label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white"
                >
                  <option value="active">active</option>
                  <option value="delivered">delivered</option>
                  <option value="cancelled">cancelled</option>
                </select>
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
