"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ArrowRight, Loader2 } from "lucide-react";

type NewProjectStep3Props = {
  budget: string;
  setBudget: (v: string) => void;
  timeline: string;
  setTimeline: (v: string) => void;
  submitting: boolean;
  onPrev: () => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function NewProjectStep3({
  budget,
  setBudget,
  timeline,
  setTimeline,
  submitting,
  onPrev,
  onSubmit,
}: NewProjectStep3Props) {
  const t = useTranslations("newProjectPage.step3");
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <h2 className="text-xl font-bold text-theme-primary">{t("title")}</h2>
      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          {t("budgetLabel")}
        </label>
        <select
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary focus:outline-none focus:border-blue-500/50"
        >
          <option value="" className="bg-[var(--card-bg)]">
            {t("budgetPlaceholder")}
          </option>
          <option value="small" className="bg-[var(--card-bg)]">
            {t("budgetSmall")}
          </option>
          <option value="medium" className="bg-[var(--card-bg)]">
            {t("budgetMedium")}
          </option>
          <option value="large" className="bg-[var(--card-bg)]">
            {t("budgetLarge")}
          </option>
          <option value="enterprise" className="bg-[var(--card-bg)]">
            {t("budgetEnterprise")}
          </option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-theme-secondary mb-2">
          {t("timelineLabel")}
        </label>
        <select
          value={timeline}
          onChange={(e) => setTimeline(e.target.value)}
          className="w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary focus:outline-none focus:border-blue-500/50"
        >
          <option value="" className="bg-[var(--card-bg)]">
            {t("timelinePlaceholder")}
          </option>
          <option value="asap" className="bg-[var(--card-bg)]">
            {t("timelineAsap")}
          </option>
          <option value="2weeks" className="bg-[var(--card-bg)]">
            {t("timeline2weeks")}
          </option>
          <option value="1month" className="bg-[var(--card-bg)]">
            {t("timeline1month")}
          </option>
          <option value="flexible" className="bg-[var(--card-bg)]">
            {t("timelineFlexible")}
          </option>
        </select>
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
          type="submit"
          disabled={submitting}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("sending")}
            </>
          ) : (
            <>
              {t("submit")}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
}
