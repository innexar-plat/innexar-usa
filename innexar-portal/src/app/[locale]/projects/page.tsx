"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { useProjectsList } from "@/hooks/use-projects-list";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectsEmptyState } from "@/components/projects/ProjectsEmptyState";

export default function ProjectsPage() {
  const locale = useLocale();
  const t = useTranslations("projectsPage");
  const { projects, loading } = useProjectsList();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-primary mb-2">{t("title")}</h1>
          <p className="text-theme-secondary">{t("subtitle")}</p>
        </div>
        <Link
          href={`/${locale}/new-project`}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium"
        >
          {t("newProject")}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} locale={locale} />
          ))}
        </div>
      ) : (
        <ProjectsEmptyState locale={locale} />
      )}
    </div>
  );
}
