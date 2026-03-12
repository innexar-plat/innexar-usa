"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";

type NewProjectStep2Props = {
  projectName: string;
  setProjectName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  onPrev: () => void;
  onNext: () => void;
};

export function NewProjectStep2({
  projectName,
  setProjectName,
  description,
  setDescription,
  onPrev,
  onNext,
}: NewProjectStep2Props) {
  const t = useTranslations("newProjectPage.step2");
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-theme-primary">{t("title")}</h2>
      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          {t("projectName")}
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500/50"
          placeholder={t("projectNamePlaceholder")}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          {t("description")}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-blue-500/50 resize-none"
          placeholder={t("descriptionPlaceholder")}
        />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onPrev}
          className="px-6 py-3 bg-[var(--card-bg)] hover:opacity-90 border border-[var(--border)] rounded-xl text-theme-primary font-medium"
        >
          {t("back")}
        </button>
        <motion.button
          type="button"
          onClick={onNext}
          disabled={!projectName}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium disabled:opacity-50"
        >
          {t("continue")}
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
}
