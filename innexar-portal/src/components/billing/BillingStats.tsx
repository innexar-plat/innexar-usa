"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Receipt, CheckCircle2, Clock } from "lucide-react";
import { getIntlLocale } from "@/lib/intl-locale";

const ICONS = { CheckCircle2, Clock, Receipt } as const;

type StatItem = {
  label: string;
  value: string | number;
  icon: keyof typeof ICONS;
  color: "green" | "yellow" | "blue";
};

type BillingStatsProps = {
  totalPaid: number;
  totalPending: number;
  totalInvoices: number;
  locale?: string;
};

export function BillingStats({
  totalPaid,
  totalPending,
  totalInvoices,
  locale: localeProp,
}: BillingStatsProps) {
  const t = useTranslations("billingPage");
  const localeFromHook = useLocale();
  const locale = localeProp ?? localeFromHook;
  const intlLocale = getIntlLocale(locale);
  const stats: StatItem[] = [
    {
      label: t("statTotalPaid"),
      value: totalPaid.toLocaleString(intlLocale, {
        minimumFractionDigits: 2,
        style: "currency",
        currency: "BRL",
      }),
      icon: "CheckCircle2",
      color: "green",
    },
    {
      label: t("statPending"),
      value: totalPending.toLocaleString(intlLocale, {
        minimumFractionDigits: 2,
        style: "currency",
        currency: "BRL",
      }),
      icon: "Clock",
      color: "yellow",
    },
    {
      label: t("statTotalInvoices"),
      value: totalInvoices,
      icon: "Receipt",
      color: "blue",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, i) => {
        const Icon = ICONS[stat.icon];
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-6 shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-theme-secondary text-sm font-medium">{stat.label}</span>
              <div
                className={
                  stat.color === "green"
                    ? "w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center"
                    : stat.color === "yellow"
                      ? "w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center"
                      : "w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center"
                }
              >
                <Icon
                  className={
                    stat.color === "green"
                      ? "w-5 h-5 text-green-500"
                      : stat.color === "yellow"
                        ? "w-5 h-5 text-amber-500"
                        : "w-5 h-5 text-blue-500"
                  }
                />
              </div>
            </div>
            <p className="text-3xl font-bold text-theme-primary">{stat.value}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
