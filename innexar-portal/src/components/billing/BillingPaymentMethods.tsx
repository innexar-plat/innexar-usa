"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CreditCard } from "lucide-react";

export function BillingPaymentMethods() {
  const t = useTranslations("billingPage");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-6 shadow-md transition-all duration-200"
    >
      <h2 className="text-lg font-bold text-theme-primary mb-4">{t("paymentMethodsTitle")}</h2>
      <div className="flex items-center gap-4 p-4 rounded-xl border border-[var(--border)] bg-black/[0.03]">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center">
          <CreditCard className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <p className="text-theme-primary font-medium">{t("stripePayments")}</p>
          <p className="text-theme-secondary text-sm">{t("secureProcessing")}</p>
        </div>
      </div>
    </motion.div>
  );
}
