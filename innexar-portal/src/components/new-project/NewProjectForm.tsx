"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";
import { NewProjectStep1 } from "./NewProjectStep1";
import { NewProjectStep2 } from "./NewProjectStep2";
import { NewProjectStep3 } from "./NewProjectStep3";

type NewProjectFormProps = {
  step: number;
  setStep: (n: number) => void;
  projectType: string;
  setProjectType: (v: string) => void;
  projectName: string;
  setProjectName: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  budget: string;
  setBudget: (v: string) => void;
  timeline: string;
  setTimeline: (v: string) => void;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
};

export function NewProjectForm({
  step,
  setStep,
  projectType,
  setProjectType,
  projectName,
  setProjectName,
  description,
  setDescription,
  budget,
  setBudget,
  timeline,
  setTimeline,
  submitting,
  onSubmit,
}: NewProjectFormProps) {
  const t = useTranslations("newProjectPage");
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-theme-primary mb-2">{t("title")}</h1>
        <p className="text-theme-secondary">{t("subtitle")}</p>
      </div>
      <div className="flex items-center gap-4">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                ${step >= s ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white" : "bg-[var(--border)]/50 text-theme-muted"}`}
            >
              {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
            </div>
            {s < 3 && (
              <div
                className={`w-20 h-1 rounded-full ${step > s ? "bg-blue-500" : "bg-white/10"}`}
              />
            )}
          </div>
        ))}
      </div>
      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="card-base rounded-2xl p-8"
      >
        {step === 1 && (
          <NewProjectStep1
            projectType={projectType}
            setProjectType={setProjectType}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <NewProjectStep2
            projectName={projectName}
            setProjectName={setProjectName}
            description={description}
            setDescription={setDescription}
            onPrev={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <NewProjectStep3
            budget={budget}
            setBudget={setBudget}
            timeline={timeline}
            setTimeline={setTimeline}
            submitting={submitting}
            onPrev={() => setStep(2)}
            onSubmit={onSubmit}
          />
        )}
      </motion.div>
    </div>
  );
}
