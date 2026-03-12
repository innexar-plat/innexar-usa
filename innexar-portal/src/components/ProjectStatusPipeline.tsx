"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { FileText, Palette, Code, Eye, Rocket, CheckCircle2 } from "lucide-react";
import { getIntlLocale } from "@/lib/intl-locale";

const PIPELINE_STEPS = [
  { key: "briefing", icon: FileText, labelKey: "briefing" },
  { key: "design", icon: Palette, labelKey: "design" },
  { key: "development", icon: Code, labelKey: "development" },
  { key: "review", icon: Eye, labelKey: "review" },
  { key: "delivery", icon: Rocket, labelKey: "delivery" },
] as const;

const STATUS_TO_STEP: Record<string, number> = {
  pending: 0,
  aguardando_briefing: 0,
  briefing_recebido: 1,
  design: 2,
  building: 3,
  active: 3,
  development: 3,
  review: 4,
  delivered: 5,
  completed: 5,
};

interface ProjectStatusPipelineProps {
  status: string;
  expectedDelivery?: string | null;
  locale?: string;
}

export default function ProjectStatusPipeline({
  status,
  expectedDelivery,
  locale: localeProp,
}: ProjectStatusPipelineProps) {
  const localeFromHook = useLocale();
  const locale = localeProp ?? localeFromHook;
  const intlLocale = getIntlLocale(locale);
  const t = useTranslations("projectDetails.pipeline");
  const currentStep = STATUS_TO_STEP[status] ?? 2;

  return (
    <div className="card-base rounded-2xl p-6">
      <h2 className="text-lg font-bold text-theme-primary mb-6 flex items-center gap-2">
        <Rocket className="w-5 h-5 text-[var(--accent)]" />
        {t("title")}
      </h2>

      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-[var(--border)] rounded-full" />
        <motion.div
          initial={{ width: 0 }}
          animate={{
            width: `${Math.min((currentStep / (PIPELINE_STEPS.length - 1)) * 100, 100)}%`,
          }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
        />

        <div className="relative flex justify-between">
          {PIPELINE_STEPS.map((step, i) => {
            const isComplete = currentStep > i;
            const isCurrent = currentStep === i;
            const Icon = step.icon;

            return (
              <div key={step.key} className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 ${
                    isComplete
                      ? "bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md"
                      : isCurrent
                        ? "bg-blue-500/20 ring-4 ring-blue-500/30"
                        : "bg-[var(--border)]"
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Icon
                      className={`w-5 h-5 ${isCurrent ? "text-theme-primary" : "text-theme-muted"}`}
                    />
                  )}
                </motion.div>
                <span
                  className={`mt-3 text-xs font-medium text-center max-w-[80px] ${
                    isComplete || isCurrent ? "text-theme-primary" : "text-theme-muted"
                  }`}
                >
                  {t(step.labelKey)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {expectedDelivery && (
        <p className="mt-6 text-theme-secondary text-sm text-center">
          {t("expectedDelivery")}{" "}
          <span className="text-theme-primary font-medium">
            {new Date(expectedDelivery).toLocaleDateString(intlLocale)}
          </span>
        </p>
      )}
    </div>
  );
}
