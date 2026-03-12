"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { MessageSquare, Plus } from "lucide-react";

type SupportEmptyStateProps = { onNewTicket: () => void };

export function SupportEmptyState({ onNewTicket }: SupportEmptyStateProps) {
  const t = useTranslations("supportPage");
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-base rounded-2xl p-12 text-center"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <MessageSquare className="w-10 h-10 text-[var(--accent)]" />
      </div>
      <h2 className="text-2xl font-bold text-theme-primary mb-2">{t("emptyTitle")}</h2>
      <p className="text-theme-secondary mb-6">{t("emptySubtitle")}</p>
      <motion.button
        onClick={onNewTicket}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium shadow-lg"
      >
        <Plus className="w-4 h-4" />
        {t("createFirstTicket")}
      </motion.button>
    </motion.div>
  );
}
