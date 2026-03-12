"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import type { ProjectDetails } from "@/types/project";
import { PROJECT_STATUS_CONFIG, getStatusColorClasses } from "@/lib/project-constants";
import { Palette } from "lucide-react";
import { getIntlLocale } from "@/lib/intl-locale";

type ProjectDetailsHeaderProps = {
  project: ProjectDetails;
  locale: string;
};

export function ProjectDetailsHeader({ project, locale }: ProjectDetailsHeaderProps) {
  const t = useTranslations("projectDetails");
  const tStatus = useTranslations("projectStatus");
  const status = PROJECT_STATUS_CONFIG[project.status] ?? {
    icon: Palette,
    color: "blue",
    label: project.status,
  };
  const colors = getStatusColorClasses(status.color);
  const StatusIcon = status.icon;
  const intlLocale = getIntlLocale(locale);

  const statusLabel = (() => {
    try {
      return tStatus(project.status);
    } catch {
      return status.label;
    }
  })();

  return (
    <>
      <Link href={`/${locale}/projects`}>
        <motion.button
          whileHover={{ x: -4 }}
          className="flex items-center gap-2 text-theme-muted hover:text-theme-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("backToProjects")}
        </motion.button>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="card-base rounded-2xl p-6"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
              <StatusIcon className={`w-6 h-6 ${colors.text}`} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-theme-primary">{project.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border`}
                >
                  {statusLabel}
                </span>
                <span className="text-theme-muted text-xs">
                  {t("createdOn")} {new Date(project.created_at).toLocaleDateString(intlLocale)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
