"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight } from "lucide-react";

type SiteBriefingSuccessProps = {
  backToDashboardLabel: string;
  successTitle: string;
  successMessage: string;
  nextStepsTitle: string;
  nextStep1: string;
  nextStep2: string;
  nextStep3: string;
  onBack: () => void;
};

export function SiteBriefingSuccess({
  backToDashboardLabel,
  successTitle,
  successMessage,
  nextStepsTitle,
  nextStep1,
  nextStep2,
  nextStep3,
  onBack,
}: SiteBriefingSuccessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto card-base rounded-2xl p-12 text-center"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">{successTitle}</h2>
      <p className="text-slate-400 mb-3">{successMessage}</p>
      <div className="mb-6 space-y-2 text-left max-w-sm mx-auto">
        <p className="text-sm text-slate-400">{nextStepsTitle}</p>
        <ul className="space-y-1 text-sm text-slate-300">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
            {nextStep1}
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
            {nextStep2}
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
            {nextStep3}
          </li>
        </ul>
      </div>
      <motion.button
        type="button"
        onClick={onBack}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium"
      >
        {backToDashboardLabel}
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
