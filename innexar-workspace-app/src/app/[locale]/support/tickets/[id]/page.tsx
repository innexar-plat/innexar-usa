'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle, Send, FolderOpen, FileText } from 'lucide-react';
import { workspaceFetch, getStaffToken } from '@/lib/workspace-api';

interface Ticket {
  id: number;
  customer_id: number;
  subject: string;
  status: string;
  category?: string;
  project_id?: number | null;
  created_at: string;
}

interface Message {
  id: number;
  ticket_id: number;
  author_type: string;
  body: string;
  created_at: string;
}

export default function WorkspaceTicketDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const id = typeof params.id === 'string' ? params.id : '';
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newBody, setNewBody] = useState('');
  const [sending, setSending] = useState(false);

  const loadTicket = () => {
    const token = getStaffToken();
    if (!token || !id) return;
    workspaceFetch(`/api/workspace/support/tickets/${id}`, { token })
      .then((r) => (r.ok ? r.json() : null))
      .then(setTicket)
      .catch(() => setTicket(null));
  };

  useEffect(() => {
    const token = getStaffToken();
    if (!token || !id) return;
    setLoading(true);
    workspaceFetch(`/api/workspace/support/tickets/${id}`, { token })
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((t: Ticket) => {
        setTicket(t);
      })
      .catch(() => setError('Ticket nao encontrado'))
      .finally(() => setLoading(false));
  }, [id]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getStaffToken();
    if (!token || !id || !newBody.trim()) return;
    setSending(true);
    const res = await workspaceFetch(
      `/api/workspace/support/tickets/${id}/messages`,
      {
        token,
        method: 'POST',
        body: JSON.stringify({ body: newBody.trim() }),
      }
    );
    setSending(false);
    if (res.ok) {
      setNewBody('');
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error || 'Ticket nao encontrado'}</p>
        </div>
        <Link
          href={`/${locale}/support/tickets`}
          className="inline-flex items-center gap-2 text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar aos tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        href={`/${locale}/support/tickets`}
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar aos tickets
      </Link>

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">{ticket.subject}</h2>
        <p className="text-slate-400 text-sm mb-3">
          ID: {ticket.id} · Cliente: {ticket.customer_id} · Status: {ticket.status}
          {ticket.category && ` · Categoria: ${ticket.category}`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {ticket.project_id != null && (
            <Link
              href={`/${locale}/projects/${ticket.project_id}`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 hover:bg-cyan-500/30 text-sm font-medium"
            >
              <FolderOpen className="w-4 h-4" />
              Ver projeto #{ticket.project_id}
            </Link>
          )}
          {ticket.project_id != null && (
            <Link
              href={`/${locale}/briefings?project_id=${ticket.project_id}`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 text-slate-300 border border-white/10 hover:bg-white/15 text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              Abrir briefing
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Mensagens</h3>
        <p className="text-slate-400 text-sm mb-4">
          Para ver e enviar mensagens, use a API GET/POST tickets/{id}/messages. Lista de mensagens pode ser expandida aqui.
        </p>
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            placeholder="Nova mensagem (staff)"
            className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500"
          />
          <button
            type="submit"
            disabled={sending || !newBody.trim()}
            className="px-4 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Enviar
          </button>
        </form>
        {messages.length > 0 && (
          <ul className="mt-4 space-y-2">
            {messages.map((m) => (
              <li
                key={m.id}
                className="py-2 px-3 rounded-lg bg-white/5 text-slate-300 text-sm"
              >
                <span className="text-slate-500">{m.author_type}</span>: {m.body}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
