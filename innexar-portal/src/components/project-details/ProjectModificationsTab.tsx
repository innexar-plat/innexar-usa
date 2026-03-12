"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Wrench, Calendar, Paperclip, Send, Loader2 } from "lucide-react";
import type { ModRequestItem, ModQuota } from "@/types/project";
import { MOD_STATUS_LABELS, getStatusColorClasses } from "@/lib/project-constants";

type ProjectModificationsTabProps = {
  modRequests: ModRequestItem[];
  modLoading: boolean;
  modQuota: ModQuota | null;
  modTitle: string;
  modDesc: string;
  modFiles: File[];
  modError: string | null;
  sendingMod: boolean;
  onModTitleChange: (v: string) => void;
  onModDescChange: (v: string) => void;
  onModFilesChange: (f: File[]) => void;
  onSubmitMod: (e: React.FormEvent) => void;
};

export function ProjectModificationsTab({
  modRequests,
  modLoading,
  modQuota,
  modTitle,
  modDesc,
  modFiles,
  modError,
  sendingMod,
  onModTitleChange,
  onModDescChange,
  onModFilesChange,
  onSubmitMod,
}: ProjectModificationsTabProps) {
  const t = useTranslations("projectDetails.modifications");
  const tErrors = useTranslations("projectDetails");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const chosen = e.target.files;
    if (!chosen?.length) return;
    onModFilesChange([...modFiles, ...Array.from(chosen)]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    onModFilesChange(modFiles.filter((_, i) => i !== index));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {modQuota && (
        <div className="card-base rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-theme-secondary">{t("requestsThisMonth")}</p>
            <p className="text-2xl font-bold text-theme-primary">
              {modQuota.used_this_month}{" "}
              <span className="text-theme-muted text-sm font-normal">
                / {modQuota.monthly_limit}
              </span>
            </p>
          </div>
          <div
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              modQuota.remaining > 0
                ? "bg-green-500/20 text-green-700 dark:text-green-400 border border-green-500/30"
                : "bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/30"
            }`}
          >
            {modQuota.remaining > 0 ? `${modQuota.remaining} ${t("remaining")}` : t("limitReached")}
          </div>
        </div>
      )}

      {(!modQuota || modQuota.remaining > 0) && (
        <div className="card-base rounded-2xl p-6">
          <h2 className="text-lg font-bold text-theme-primary flex items-center gap-2 mb-4">
            <Wrench className="w-5 h-5 text-amber-500" />
            {t("newRequest")}
          </h2>
          {modError && (
            <p className="text-red-600 dark:text-red-400 text-sm mb-3">
              {modError.startsWith("errors.") ? tErrors(modError) : modError}
            </p>
          )}
          <form onSubmit={onSubmitMod} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-1">
                {t("title")}
              </label>
              <input
                type="text"
                value={modTitle}
                onChange={(e) => onModTitleChange(e.target.value)}
                required
                placeholder={t("titlePlaceholder")}
                className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary placeholder-theme-muted text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-1">
                {t("description")}
              </label>
              <textarea
                value={modDesc}
                onChange={(e) => onModDescChange(e.target.value)}
                required
                rows={3}
                placeholder={t("descPlaceholder")}
                className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary placeholder-theme-muted text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-y"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-theme-primary mb-1">
                {t("attachment")}
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-secondary hover:text-theme-primary cursor-pointer text-sm">
                  <Paperclip className="w-4 h-4" />
                  {t("selectFiles")}
                  <input
                    type="file"
                    className="hidden"
                    accept="*/*"
                    multiple
                    onChange={handleFileSelect}
                  />
                </label>
                {modFiles.length > 0 && (
                  <ul className="flex flex-wrap gap-2 list-none">
                    {modFiles.map((file, i) => (
                      <li
                        key={`${file.name}-${i}`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[var(--border)]/40 rounded-lg text-sm text-theme-primary"
                      >
                        <span className="truncate max-w-[160px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-theme-muted hover:text-red-600 dark:hover:text-red-400"
                          aria-label={t("remove")}
                        >
                          {t("remove")}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            <motion.button
              type="submit"
              disabled={sendingMod}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-white font-medium flex items-center gap-2 disabled:opacity-50"
            >
              {sendingMod ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {t("submit")}
            </motion.button>
          </form>
        </div>
      )}

      <div className="card-base rounded-2xl p-6">
        <h2 className="text-lg font-bold text-theme-primary flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[var(--accent)]" />
          {t("history")}
        </h2>
        {modLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-theme-muted" />
          </div>
        ) : modRequests.length === 0 ? (
          <p className="text-theme-secondary text-sm text-center py-8">{t("none")}</p>
        ) : (
          <div className="space-y-3">
            {modRequests.map((r) => {
              const st = MOD_STATUS_LABELS[r.status] ?? {
                label: r.status,
                color: "blue",
              };
              const stColors = getStatusColorClasses(st.color);
              return (
                <div key={r.id} className="p-4 bg-[var(--border)]/30 rounded-xl">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-medium text-theme-primary text-sm">{r.title}</h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${stColors.bg} ${stColors.text} ${stColors.border} border`}
                    >
                      {st.label}
                    </span>
                  </div>
                  <p className="text-theme-secondary text-sm">{r.description}</p>
                  {r.staff_notes && (
                    <div className="mt-2 p-2 bg-[var(--accent)]/10 rounded-lg">
                      <p className="text-xs font-medium text-[var(--accent)]">{t("staffReply")}</p>
                      <p className="text-sm text-theme-secondary">{r.staff_notes}</p>
                    </div>
                  )}
                  <p className="text-xs text-theme-muted mt-2">
                    {new Date(r.created_at).toLocaleString("pt-BR")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
