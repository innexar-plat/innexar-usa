"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FolderOpen, ArrowRight } from "lucide-react";
import type { ProjectSummary } from "@/types/dashboard";

type DashboardProjectsListProps = {
  locale: string;
  projects: ProjectSummary[];
  title: string;
  filesLabel: string;
};

export function DashboardProjectsList({
  locale,
  projects,
  title,
  filesLabel,
}: DashboardProjectsListProps) {
  if (projects.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-[var(--card-bg)] border border-[var(--border)] p-5 shadow-md transition-all duration-200"
    >
      <h2 className="text-lg font-semibold text-theme-primary mb-3 flex items-center gap-2">
        <FolderOpen className="w-5 h-5 text-cyan-400" />
        {title}
      </h2>
      <ul className="space-y-2">
        {projects.map((proj) => (
          <li key={proj.id}>
            <Link
              href={`/${locale}/projects/${proj.id}`}
              className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-black/[0.03] hover:bg-black/[0.06] px-4 py-3 text-theme-primary transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <span className="font-medium">{proj.name}</span>
              <span className="flex items-center gap-2 text-sm text-theme-secondary">
                <span className="capitalize">{proj.status.replace(/_/g, " ")}</span>
                {proj.files_count > 0 && (
                  <span className="text-cyan-400">
                    {proj.files_count} {filesLabel}
                  </span>
                )}
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
