"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Bell, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useWorkspaceApi, workspaceFetch, getCustomerToken } from "@/lib/workspace-api";
import { API_PATHS } from "@/lib/api-paths";

interface NotificationItem {
  id: number;
  channel: string;
  title: string;
  body: string | null;
  read_at: string | null;
  created_at: string;
}

export default function NotificationsPage() {
  const locale = useLocale();
  const t = useTranslations("notificationsPage");
  const isWorkspaceApi = useWorkspaceApi();
  const [list, setList] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [markingId, setMarkingId] = useState<number | null>(null);

  const fetchList = async () => {
    const token = getCustomerToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setError("");
    try {
      if (!isWorkspaceApi) {
        setLoading(false);
        return;
      }
      const res = await workspaceFetch(API_PATHS.NOTIFICATIONS.LIST, { token });
      if (res.ok) {
        const data = await res.json();
        setList(Array.isArray(data) ? data : []);
      } else {
        setList([]);
      }
    } catch {
      setError(t("errorLoad"));
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [isWorkspaceApi]);

  const handleMarkRead = async (id: number) => {
    const token = getCustomerToken();
    if (!token) return;
    setMarkingId(id);
    try {
      const res = await workspaceFetch(API_PATHS.NOTIFICATIONS.READ(id), {
        token,
        method: "PATCH",
      });
      if (res.ok) {
        setList((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
        );
      }
    } finally {
      setMarkingId(null);
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
        <h1 className="text-3xl font-bold text-theme-primary">{t("title")}</h1>
        <p className="text-theme-secondary">{t("unavailable")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-theme-primary mb-2">{t("title")}</h1>
        <p className="text-theme-secondary">{t("subtitle")}</p>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {list.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-base rounded-2xl p-12 text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Bell className="w-10 h-10 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-theme-primary mb-2">{t("emptyTitle")}</h2>
          <p className="text-theme-secondary">{t("emptySubtitle")}</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {list.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`card-base rounded-2xl p-6 ${n.read_at ? "" : "ring-1 ring-blue-500/30"}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-theme-primary font-medium">{n.title}</h3>
                  {n.body && (
                    <p className="text-theme-secondary text-sm mt-1 whitespace-pre-wrap">
                      {n.body}
                    </p>
                  )}
                  <p className="text-theme-muted text-xs mt-2">
                    {new Date(n.created_at).toLocaleString(locale)}
                  </p>
                </div>
                {!n.read_at && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(n.id)}
                    disabled={markingId !== null}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 text-sm font-medium disabled:opacity-50 shrink-0"
                  >
                    {markingId === n.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    {t("markAsRead")}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
