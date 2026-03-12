"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CheckCircle2, FileText, FolderOpen } from "lucide-react";
import type { ProjectSummary } from "@/types/dashboard";

type DashboardBriefingCtaProps = {
  locale: string;
  checkoutSuccess: boolean;
  projectsAwaiting: ProjectSummary[];
  title: string;
  briefingPromptLabel: string;
  fillSiteDetailsLabel: string;
  uploadFilesLabel: string;
};

export function DashboardBriefingCta({
  locale,
  checkoutSuccess,
  projectsAwaiting,
  title,
  briefingPromptLabel,
  fillSiteDetailsLabel,
  uploadFilesLabel,
}: DashboardBriefingCtaProps) {
  const hasAguardando = projectsAwaiting.length > 0;
  const showCta = checkoutSuccess || hasAguardando;
  if (!showCta) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl bg-gradient-to-r from-emerald-500/15 to-cyan-500/15 border border-emerald-400/30 p-5 shadow-lg shadow-emerald-500/10 transition-shadow duration-200 hover:shadow-xl hover:shadow-emerald-500/15"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-theme-primary font-semibold">{title}</p>
            <p className="text-theme-secondary text-sm mt-0.5">{briefingPromptLabel}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link
            href={`/${locale}/site-briefing`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-semibold hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            <FileText className="w-4 h-4" aria-hidden />
            {fillSiteDetailsLabel}
          </Link>
          {hasAguardando && projectsAwaiting[0] && (
            <Link
              href={`/${locale}/projects/${projectsAwaiting[0].id}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)]/15 text-theme-primary border border-[var(--border)] font-semibold hover:bg-[var(--accent)]/25 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--card-bg)]"
            >
              <FolderOpen className="w-4 h-4" aria-hidden />
              {uploadFilesLabel}
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
