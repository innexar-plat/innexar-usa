"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Loader2, AlertCircle, MessageSquare, User } from "lucide-react";
import { useWorkspaceApi, workspaceFetch, getCustomerToken } from "@/lib/workspace-api";
import { API_PATHS } from "@/lib/api-paths";

interface Ticket {
  id: number;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TicketMessage {
  id: number;
  ticket_id: number;
  author_type: string;
  body: string;
  created_at: string;
}

export default function SupportTicketDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const t = useTranslations("supportPage.detail");
  const tStatus = useTranslations("supportPage.ticketStatus");
  const id = typeof params.id === "string" ? params.id : "";
  const isWorkspaceApi = useWorkspaceApi();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    const token = getCustomerToken();
    if (!token || !id || !isWorkspaceApi) {
      setLoading(false);
      return;
    }
    setError("");
    try {
      const [tRes, mRes] = await Promise.all([
        workspaceFetch(API_PATHS.TICKETS.DETAIL(id), { token }),
        workspaceFetch(API_PATHS.TICKETS.MESSAGES(id), { token }),
      ]);
      if (!tRes.ok) {
        if (tRes.status === 404) setError(t("ticketNotFound"));
        else setError(t("errorLoadTicket"));
        setTicket(null);
        setMessages([]);
        setLoading(false);
        return;
      }
      const tData = (await tRes.json()) as Ticket;
      setTicket(tData);
      setMessages(mRes.ok ? ((await mRes.json()) as TicketMessage[]) : []);
    } catch {
      setError(t("errorConnection"));
      setTicket(null);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [id, isWorkspaceApi]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getCustomerToken();
    if (!token || !id || !replyBody.trim() || !isWorkspaceApi) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await workspaceFetch(API_PATHS.TICKETS.MESSAGES(id), {
        method: "POST",
        token,
        body: JSON.stringify({ body: replyBody.trim() }),
      });
      if (res.ok) {
        setReplyBody("");
        load();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(
          typeof (data as { detail?: string }).detail === "string"
            ? (data as { detail: string }).detail
            : t("errorSendMessage")
        );
      }
    } catch {
      setError(t("errorConnection"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!isWorkspaceApi) {
    return (
      <div className="space-y-4">
        <Link
          href={`/${locale}/support`}
          className="inline-flex items-center gap-2 text-theme-secondary hover:text-theme-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToSupport")}
        </Link>
        <p className="text-theme-secondary">{t("unavailable")}</p>
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div className="space-y-4">
        <Link
          href={`/${locale}/support`}
          className="inline-flex items-center gap-2 text-theme-secondary hover:text-theme-primary"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToSupport")}
        </Link>
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  const statusConfig: Record<string, { labelKey: string; bg: string; color: string }> = {
    open: { labelKey: "open", bg: "bg-blue-500/20", color: "text-blue-400" },
    pending: { labelKey: "pending", bg: "bg-yellow-500/20", color: "text-yellow-400" },
    resolved: { labelKey: "resolved", bg: "bg-green-500/20", color: "text-green-400" },
    closed: { labelKey: "closed", bg: "bg-slate-500/20", color: "text-theme-secondary" },
  };
  const status = statusConfig[ticket.status] ?? statusConfig.open;

  return (
    <div className="space-y-6">
      <Link
        href={`/${locale}/support`}
        className="inline-flex items-center gap-2 text-theme-secondary hover:text-theme-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("backToSupport")}
      </Link>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <h1 className="text-2xl font-bold text-theme-primary">{ticket.subject}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.color}`}
          >
            {tStatus(status.labelKey)}
          </span>
        </div>
        <p className="text-theme-secondary text-sm">
          {t("createdOn")} {new Date(ticket.created_at).toLocaleString(locale)}
          {ticket.updated_at !== ticket.created_at &&
            ` • ${t("updatedOn")} ${new Date(ticket.updated_at).toLocaleString(locale)}`}
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-theme-primary flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          {t("messages")}
        </h2>
        {messages.length === 0 ? (
          <p className="text-theme-secondary">{t("noMessages")}</p>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl p-4 border ${msg.author_type === "customer" ? "bg-blue-500/10 border-blue-500/20 ml-4" : "bg-white/5 border-white/10 mr-4"}`}
              >
                <div className="flex items-center gap-2 text-theme-secondary text-sm mb-1">
                  <User className="w-4 h-4" />
                  <span>{msg.author_type === "customer" ? t("you") : t("support")}</span>
                  <span>•</span>
                  <span>{new Date(msg.created_at).toLocaleString(locale)}</span>
                </div>
                <p className="text-theme-primary whitespace-pre-wrap">{msg.body}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {ticket.status !== "closed" && ticket.status !== "resolved" && (
        <form
          onSubmit={handleReply}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <label className="block text-sm font-medium text-slate-300 mb-2">{t("reply")}</label>
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            required
            rows={4}
            placeholder={t("replyPlaceholder")}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-theme-primary placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none mb-4"
          />
          <button
            type="submit"
            disabled={submitting || !replyBody.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-medium disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            {t("send")}
          </button>
        </form>
      )}
    </div>
  );
}
