"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Calendar, ArrowRight, ExternalLink, FileText } from "lucide-react";
import { PROJECT_STATUS_CONFIG, getProjectColorClasses } from "@/lib/project-status";
import { getIntlLocale } from "@/lib/intl-locale";
import type { ProjectListItem } from "@/types/projects-list";

type ProjectCardProps = {
  project: ProjectListItem;
  index: number;
  locale: string;
};

export function ProjectCard({ project, index, locale }: ProjectCardProps) {
  const status = PROJECT_STATUS_CONFIG[project.status] || PROJECT_STATUS_CONFIG.building;
  const colors = getProjectColorClasses(status.color);
  const Icon = status.icon;
  const t = useTranslations("projectsPage.card");
  const tStatus = useTranslations("projectStatus");
  const intlLocale = getIntlLocale(locale);

  const statusLabel = (() => {
    try {
      return tStatus(project.status);
    } catch {
      return status.label;
    }
  })();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card-base rounded-2xl p-6 hover:border-[var(--border)]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${colors.text}`} />
        </div>
        {project.site_url && (
          <a
            href={project.site_url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-[var(--border)]/30 hover:bg-[var(--border)]/50 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-theme-muted" />
          </a>
        )}
      </div>
      <h3 className="text-xl font-bold text-theme-primary mb-2">{project.name}</h3>
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
        >
          {statusLabel}
        </span>
        {project.files_count > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-[var(--border)]/50 text-theme-secondary">
            <FileText className="w-3.5 h-3.5" />
            {project.files_count} {t("filesLabel", { count: project.files_count })}
          </span>
        )}
      </div>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-theme-secondary">{t("progress")}</span>
          <span className="text-theme-primary font-medium">{project.progress}%</span>
        </div>
        <div className="h-2 bg-[var(--border)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${project.progress}%` }}
            transition={{ duration: 1, delay: index * 0.1 }}
            className={`h-full bg-gradient-to-r ${colors.gradient}`}
          />
        </div>
      </div>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1 text-theme-muted">
          <Calendar className="w-4 h-4" />
          <span>
            {project.expected_delivery
              ? new Date(project.expected_delivery).toLocaleDateString(intlLocale)
              : project.created_at
                ? new Date(project.created_at).toLocaleDateString(intlLocale)
                : "-"}
          </span>
        </div>
        <Link
          href={`/${locale}/projects/${project.id}`}
          className="font-medium flex items-center gap-1 text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
        >
          {t("details")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </motion.div>
  );
}
