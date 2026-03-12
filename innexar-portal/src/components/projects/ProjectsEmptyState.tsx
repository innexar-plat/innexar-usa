"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { FolderOpen, ArrowRight } from "lucide-react";

type ProjectsEmptyStateProps = { locale?: string };

export function ProjectsEmptyState({ locale: localeProp }: ProjectsEmptyStateProps) {
  const localeFromHook = useLocale();
  const locale = localeProp ?? localeFromHook;
  const t = useTranslations("projectsPage.empty");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card-base rounded-2xl p-12 text-center"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <FolderOpen className="w-10 h-10 text-blue-500" />
      </div>
      <h2 className="text-2xl font-bold text-theme-primary mb-2">{t("title")}</h2>
      <p className="text-theme-secondary mb-6">{t("subtitle")}</p>
      <Link
        href={`/${locale}/new-project`}
        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium"
      >
        {t("cta")}
        <ArrowRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}
