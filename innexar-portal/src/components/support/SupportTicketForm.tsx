"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Send, Loader2, AlertCircle } from "lucide-react";

type SupportTicketFormProps = {
  subject: string;
  setSubject: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  error: string;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
};

export function SupportTicketForm({
  subject,
  setSubject,
  message,
  setMessage,
  error,
  submitting,
  onSubmit,
  onCancel,
}: SupportTicketFormProps) {
  const t = useTranslations("supportPage");
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="card-base rounded-2xl p-6">
        <h2 className="text-xl font-bold text-theme-primary mb-4">{t("formTitle")}</h2>
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              {t("subject")}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500/50"
              placeholder={t("subjectPlaceholder")}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-theme-secondary mb-2">
              {t("message")}
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500/50 resize-none"
              placeholder={t("messagePlaceholder")}
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 bg-[var(--card-bg)] hover:opacity-90 border border-[var(--border)] rounded-xl text-theme-primary font-medium transition-colors"
            >
              {t("cancel")}
            </button>
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t("sending")}
                </>
              ) : (
                <>
                  {t("submitTicket")}
                  <Send className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
