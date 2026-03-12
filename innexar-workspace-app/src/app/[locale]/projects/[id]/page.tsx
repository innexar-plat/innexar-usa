'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  Download,
  ExternalLink,
  MessageSquare,
  ClipboardList,
} from 'lucide-react';
import { workspaceFetchStaff, getStaffToken } from "@/lib/workspace-api";
import { WORKSPACE_API_PATHS } from "@/lib/workspace-api-paths";

const PIPELINE_STATUSES = [
  'aguardando_briefing',
  'briefing_recebido',
  'design',
  'desenvolvimento',
  'revisao',
  'entrega',
  'projeto_concluido',
  'active',
  'delivered',
  'cancelled',
] as const;

function pipelineLabel(s: string): string {
  const labels: Record<string, string> = {
    aguardando_briefing: 'Aguardando briefing',
    briefing_recebido: 'Briefing recebido',
    design: 'Design',
    desenvolvimento: 'Desenvolvimento',
    revisao: 'Revisão',
    entrega: 'Entrega',
    projeto_concluido: 'Concluído',
    active: 'Ativo',
    delivered: 'Entregue',
    cancelled: 'Cancelado',
  };
  return labels[s] || s;
}

interface Project {
  id: number;
  customer_id: number;
  name: string;
  status: string;
  subscription_id?: number | null;
  expected_delivery_at?: string | null;
  delivery_info?: { panel_url?: string; login?: string; notes?: string } | null;
  created_at: string;
  updated_at: string;
}

interface ProjectFileItem {
  id: number;
  filename: string;
  content_type: string | null;
  size: number;
  created_at: string;
}

interface BriefingItem {
  id: number;
  customer_id: number;
  customer_name: string;
  project_id: number | null;
  project_name: string;
  project_type: string;
  description: string | null;
  status: string;
  created_at: string;
}

interface ProjectMessage {
  id: number;
  sender_type: string;
  sender_name: string;
  body: string;
  attachment_key: string | null;
  attachment_name: string | null;
  created_at: string | null;
}

interface ModificationRequest {
  id: number;
  title: string;
  description: string;
  status: string;
  staff_notes: string | null;
  attachment_name: string | null;
  created_at: string | null;
}

export default function WorkspaceProjectDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const id = typeof params.id === 'string' ? params.id : '';
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<ProjectFileItem[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [briefings, setBriefings] = useState<BriefingItem[]>([]);
  const [briefingsLoading, setBriefingsLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<{ panel_url: string; login: string; notes: string }>({
    panel_url: '',
    login: '',
    notes: '',
  });
  const [deliveryInfoSaving, setDeliveryInfoSaving] = useState(false);
  const [messages, setMessages] = useState<ProjectMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [newMessageBody, setNewMessageBody] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [modRequests, setModRequests] = useState<ModificationRequest[]>([]);
  const [modRequestsLoading, setModRequestsLoading] = useState(false);
  const [updatingModReqId, setUpdatingModReqId] = useState<number | null>(null);

  useEffect(() => {
    if (!getStaffToken() || !id) return;
    setLoading(true);
    workspaceFetchStaff(WORKSPACE_API_PATHS.PROJECTS.DETAIL(id))
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setProject)
      .catch(() => setError("Projeto não encontrado"))
      .finally(() => setLoading(false));
  }, [id]);

  const fetchFiles = useCallback(() => {
    if (!getStaffToken() || !id) return;
    setFilesLoading(true);
    workspaceFetchStaff(WORKSPACE_API_PATHS.PROJECTS.FILES(id))
      .then((r) => (r.ok ? r.json() : []))
      .then(setFiles)
      .finally(() => setFilesLoading(false));
  }, [id]);

  useEffect(() => {
    if (project) fetchFiles();
  }, [project, fetchFiles]);

  useEffect(() => {
    if (project?.delivery_info && typeof project.delivery_info === 'object') {
      const d = project.delivery_info as Record<string, string>;
      setDeliveryInfo({
        panel_url: d.panel_url ?? '',
        login: d.login ?? '',
        notes: d.notes ?? '',
      });
    } else {
      setDeliveryInfo({ panel_url: '', login: '', notes: '' });
    }
  }, [project?.id, project?.delivery_info]);

  const saveDeliveryInfo = useCallback(async () => {
    if (!getStaffToken() || !id) return;
    setDeliveryInfoSaving(true);
    try {
      const res = await workspaceFetchStaff(
        WORKSPACE_API_PATHS.PROJECTS.DETAIL(id),
        {
          method: "PATCH",
          body: JSON.stringify({
            delivery_info: {
              panel_url: deliveryInfo.panel_url.trim() || undefined,
              login: deliveryInfo.login.trim() || undefined,
              notes: deliveryInfo.notes.trim() || undefined,
            },
          }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setProject((prev) =>
          prev ? { ...prev, delivery_info: data.delivery_info ?? null } : null
        );
      }
    } finally {
      setDeliveryInfoSaving(false);
    }
  }, [id, deliveryInfo]);

  useEffect(() => {
    if (!getStaffToken() || !id) return;
    setBriefingsLoading(true);
    workspaceFetchStaff(WORKSPACE_API_PATHS.BRIEFINGS.LIST(id))
      .then((r) => (r.ok ? r.json() : []))
      .then(setBriefings)
      .finally(() => setBriefingsLoading(false));
  }, [id]);

  const fetchMessages = useCallback(() => {
    if (!getStaffToken() || !id) return;
    setMessagesLoading(true);
    workspaceFetchStaff(WORKSPACE_API_PATHS.PROJECTS.MESSAGES(id))
      .then((r) => (r.ok ? r.json() : []))
      .then(setMessages)
      .finally(() => setMessagesLoading(false));
  }, [id]);

  const fetchModRequests = useCallback(() => {
    if (!getStaffToken() || !id) return;
    setModRequestsLoading(true);
    workspaceFetchStaff(
      WORKSPACE_API_PATHS.PROJECTS.MODIFICATION_REQUESTS(id)
    )
      .then((r) => (r.ok ? r.json() : []))
      .then(setModRequests)
      .finally(() => setModRequestsLoading(false));
  }, [id]);

  useEffect(() => {
    if (project) {
      fetchMessages();
      fetchModRequests();
    }
  }, [project?.id, fetchMessages, fetchModRequests]);

  const sendMessage = useCallback(async () => {
    if (!getStaffToken() || !id || !newMessageBody.trim()) return;
    setSendingMessage(true);
    try {
      const res = await workspaceFetchStaff(
        WORKSPACE_API_PATHS.PROJECTS.MESSAGES(id),
        {
          method: "POST",
          body: JSON.stringify({ body: newMessageBody.trim() }),
        }
      );
      if (res.ok) {
        setNewMessageBody("");
        fetchMessages();
      }
    } finally {
      setSendingMessage(false);
    }
  }, [id, newMessageBody, fetchMessages]);

  const updateModRequest = useCallback(
    async (requestId: number, status: string, staffNotes: string) => {
      if (!getStaffToken()) return;
      setUpdatingModReqId(requestId);
      try {
        const res = await workspaceFetchStaff(
          WORKSPACE_API_PATHS.MODIFICATION_REQUESTS.UPDATE(requestId),
          {
            method: "PATCH",
            body: JSON.stringify({
              status: status || undefined,
              staff_notes: staffNotes || undefined,
            }),
          }
        );
        if (res.ok) fetchModRequests();
      } finally {
        setUpdatingModReqId(null);
      }
    },
    [fetchModRequests]
  );

  const updateStatus = useCallback(
    async (newStatus: string) => {
      if (!getStaffToken() || !id || !project) return;
      setStatusUpdating(true);
      try {
        const res = await workspaceFetchStaff(
          WORKSPACE_API_PATHS.PROJECTS.DETAIL(id),
          {
            method: "PATCH",
            body: JSON.stringify({ status: newStatus }),
          }
        );
        if (res.ok) {
          const data = await res.json();
          setProject((prev) =>
            prev ? { ...prev, status: data.status } : null
          );
        }
      } finally {
        setStatusUpdating(false);
      }
    },
    [id, project]
  );

  const handleBriefingDownload = useCallback(
    async (briefingId: number) => {
      if (!getStaffToken()) return;
      const res = await workspaceFetchStaff(
        WORKSPACE_API_PATHS.BRIEFINGS.DOWNLOAD(briefingId)
      );
      if (!res.ok) return;
      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="?([^";]+)"?/);
      const filename = match ? match[1].trim() : `briefing-${briefingId}.txt`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    []
  );

  const handleDownload = async (fileId: number, filename: string) => {
    if (!getStaffToken() || !id) return;
    const res = await workspaceFetchStaff(
      WORKSPACE_API_PATHS.PROJECTS.FILE_DOWNLOAD(id, fileId)
    );
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error || 'Projeto não encontrado'}</p>
        </div>
        <Link
          href={`/${locale}/projects`}
          className="inline-flex items-center gap-2 text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos projetos
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/${locale}/projects`}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar aos projetos
      </Link>

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">{project.name}</h2>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-400 mb-2">Pipeline de etapas</h3>
          <div className="flex flex-wrap gap-2">
            {PIPELINE_STATUSES.map((s) => (
              <span
                key={s}
                className={`px-3 py-1.5 rounded-lg text-sm ${
                  project.status === s
                    ? 'bg-blue-500/30 text-white ring-1 ring-blue-400/50'
                    : 'bg-white/5 text-slate-400'
                }`}
              >
                {pipelineLabel(s)}
              </span>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="project-status" className="block text-sm font-medium text-slate-400 mb-2">
            Alterar status
          </label>
          <select
            id="project-status"
            value={project.status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={statusUpdating}
            className="rounded-lg bg-white/10 text-slate-200 border border-white/10 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {PIPELINE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {pipelineLabel(s)}
              </option>
            ))}
          </select>
          {statusUpdating && (
            <span className="ml-2 text-slate-500 text-sm">Salvando...</span>
          )}
        </div>

        <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Dados de acesso / Entrega</h3>
          <p className="text-slate-500 text-xs mb-3">Preencha após o provisionamento manual (painel, login, observações).</p>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">URL do painel</label>
              <input
                type="url"
                value={deliveryInfo.panel_url}
                onChange={(e) => setDeliveryInfo((d) => ({ ...d, panel_url: e.target.value }))}
                placeholder="https://..."
                className="w-full rounded-lg bg-white/10 text-slate-200 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Login</label>
              <input
                type="text"
                value={deliveryInfo.login}
                onChange={(e) => setDeliveryInfo((d) => ({ ...d, login: e.target.value }))}
                placeholder="usuário ou e-mail"
                className="w-full rounded-lg bg-white/10 text-slate-200 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Observações</label>
              <textarea
                value={deliveryInfo.notes}
                onChange={(e) => setDeliveryInfo((d) => ({ ...d, notes: e.target.value }))}
                rows={2}
                placeholder="Links, senha (enviada por e-mail), etc."
                className="w-full rounded-lg bg-white/10 text-slate-200 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <button
              type="button"
              onClick={saveDeliveryInfo}
              disabled={deliveryInfoSaving}
              className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 text-sm font-medium hover:bg-blue-500/30 disabled:opacity-50"
            >
              {deliveryInfoSaving ? 'Salvando...' : 'Salvar dados de acesso'}
            </button>
          </div>
        </div>

        <dl className="grid gap-2 sm:grid-cols-2">
          <dt className="text-slate-400">ID</dt>
          <dd className="text-white">{project.id}</dd>
          <dt className="text-slate-400">Customer ID</dt>
          <dd className="text-white">{project.customer_id}</dd>
          <dt className="text-slate-400">Criado em</dt>
          <dd className="text-white">
            {new Date(project.created_at).toLocaleString(locale)}
          </dd>
          <dt className="text-slate-400">Atualizado em</dt>
          <dd className="text-white">
            {new Date(project.updated_at).toLocaleString(locale)}
          </dd>
        </dl>
      </div>

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-amber-400" />
          Briefing
        </h3>
        {briefingsLoading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        ) : briefings.length === 0 ? (
          <p className="text-slate-500 text-sm">Nenhum briefing vinculado a este projeto.</p>
        ) : (
          <ul className="space-y-3">
            {briefings.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-2 py-2 border-b border-white/5 last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-slate-200 font-medium">{b.project_name}</p>
                  {b.description && (
                    <p className="text-slate-500 text-sm line-clamp-1 mt-0.5">
                      {b.description}
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(b.created_at).toLocaleString(locale)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleBriefingDownload(b.id)}
                    className="inline-flex items-center gap-1 text-sm text-blue-400 hover:underline"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <Link
                    href={`/${locale}/briefings/${b.id}`}
                    className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver detalhe
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-400" />
          Arquivos do projeto
        </h3>
        {filesLoading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        ) : files.length === 0 ? (
          <p className="text-slate-500 text-sm">Nenhum arquivo enviado pelo cliente.</p>
        ) : (
          <ul className="space-y-2">
            {files.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between gap-2 py-2 border-b border-white/5 last:border-0"
              >
                <span className="text-slate-300 text-sm truncate">{f.filename}</span>
                <button
                  type="button"
                  onClick={() => handleDownload(f.id, f.filename)}
                  className="flex items-center gap-1 text-blue-400 hover:underline text-sm"
                >
                  <Download className="w-4 h-4" />
                  Baixar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          Mensagens do projeto
        </h3>
        {messagesLoading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        ) : (
          <>
            <ul className="space-y-3 mb-4">
              {messages.length === 0 ? (
                <p className="text-slate-500 text-sm">Nenhuma mensagem ainda.</p>
              ) : (
                messages.map((m) => (
                  <li
                    key={m.id}
                    className={`py-2 px-3 rounded-lg text-sm ${
                      m.sender_type === 'staff'
                        ? 'bg-blue-500/10 border border-blue-400/20 ml-4'
                        : 'bg-white/5 border border-white/10 mr-4'
                    }`}
                  >
                    <span className="text-slate-400 text-xs">
                      {m.sender_name} · {m.created_at ? new Date(m.created_at).toLocaleString(locale) : ''}
                    </span>
                    <p className="text-slate-200 mt-1 whitespace-pre-wrap">{m.body}</p>
                    {m.attachment_name && (
                      <p className="text-xs text-slate-500 mt-1">Anexo: {m.attachment_name}</p>
                    )}
                  </li>
                ))
              )}
            </ul>
            <div className="flex gap-2">
              <textarea
                value={newMessageBody}
                onChange={(e) => setNewMessageBody(e.target.value)}
                placeholder="Responder ao cliente..."
                rows={2}
                className="flex-1 rounded-lg bg-white/10 text-slate-200 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <button
                type="button"
                onClick={sendMessage}
                disabled={sendingMessage || !newMessageBody.trim()}
                className="self-end px-4 py-2 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-400/30 text-sm font-medium hover:bg-blue-500/30 disabled:opacity-50"
              >
                {sendingMessage ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-amber-400" />
          Solicitações de modificação
        </h3>
        {modRequestsLoading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Carregando...</span>
          </div>
        ) : modRequests.length === 0 ? (
          <p className="text-slate-500 text-sm">Nenhuma solicitação de modificação.</p>
        ) : (
          <ul className="space-y-4">
            {modRequests.map((req) => (
              <li
                key={req.id}
                className="py-3 px-4 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h4 className="text-slate-200 font-medium">{req.title}</h4>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      req.status === 'concluido'
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : req.status === 'rejeitado'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
                {req.description && (
                  <p className="text-slate-400 text-sm mb-2">{req.description}</p>
                )}
                {req.attachment_name && (
                  <p className="text-xs text-slate-500 mb-2">Anexo: {req.attachment_name}</p>
                )}
                <p className="text-xs text-slate-500 mb-3">
                  {req.created_at ? new Date(req.created_at).toLocaleString(locale) : ''}
                </p>
                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    value={req.status}
                    onChange={(e) => updateModRequest(req.id, e.target.value, req.staff_notes ?? '')}
                    disabled={updatingModReqId === req.id}
                    className="rounded-lg bg-white/10 text-slate-200 border border-white/10 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="em_andamento">Em andamento</option>
                    <option value="concluido">Concluído</option>
                    <option value="rejeitado">Rejeitado</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Notas internas"
                    defaultValue={req.staff_notes ?? ''}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v !== (req.staff_notes ?? '')) {
                        updateModRequest(req.id, req.status, v);
                      }
                    }}
                    className="flex-1 min-w-[120px] rounded-lg bg-white/10 text-slate-200 border border-white/10 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {updatingModReqId === req.id && (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
