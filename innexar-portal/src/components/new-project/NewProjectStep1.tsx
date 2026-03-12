"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Rocket, Globe, Smartphone, ShoppingCart, Palette, Code, ArrowRight } from "lucide-react";

const PROJECT_TYPE_IDS = ["website", "landing", "ecommerce", "webapp", "mobile", "custom"] as const;
const PROJECT_ICONS = [Globe, Rocket, ShoppingCart, Code, Smartphone, Palette];

type NewProjectStep1Props = {
  projectType: string;
  setProjectType: (v: string) => void;
  onNext: () => void;
};

export function NewProjectStep1({ projectType, setProjectType, onNext }: NewProjectStep1Props) {
  const t = useTranslations("newProjectPage.step1");
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-theme-primary">{t("title")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {PROJECT_TYPE_IDS.map((id, index) => {
          const Icon = PROJECT_ICONS[index];
          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => setProjectType(id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-xl border text-left transition-all
                ${projectType === id ? "bg-blue-500/20 border-blue-500/50" : "bg-[var(--card-bg)] border-[var(--border)] hover:shadow-[var(--card-shadow-hover)]"}`}
            >
              <Icon
                className={`w-6 h-6 mb-3 ${projectType === id ? "text-[var(--accent)]" : "text-theme-muted"}`}
              />
              <p className="text-theme-primary font-medium">{t(`types.${id}.label`)}</p>
              <p className="text-theme-secondary text-sm">{t(`types.${id}.description`)}</p>
            </motion.button>
          );
        })}
      </div>
      <div className="flex justify-end">
        <motion.button
          type="button"
          onClick={onNext}
          disabled={!projectType}
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
