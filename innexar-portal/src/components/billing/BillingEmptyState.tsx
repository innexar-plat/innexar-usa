"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Receipt } from "lucide-react";

export function BillingEmptyState() {
  const t = useTranslations("billingPage");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-12 text-center shadow-md transition-all duration-200"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Receipt className="w-10 h-10 text-blue-400" />
      </div>
      <h2 className="text-2xl font-bold text-theme-primary mb-2">{t("emptyTitle")}</h2>
      <p className="text-theme-secondary">{t("emptySubtitle")}</p>
    </motion.div>
  );
}
