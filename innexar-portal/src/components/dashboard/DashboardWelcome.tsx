"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

type DashboardWelcomeProps = {
  customerName: string;
  welcomeLabel: string;
  summaryActiveLabel: string;
  summaryInactiveLabel: string;
  hasPlanOrSite: boolean;
};

export function DashboardWelcome({
  customerName,
  welcomeLabel,
  summaryActiveLabel,
  summaryInactiveLabel,
  hasPlanOrSite,
}: DashboardWelcomeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-blue-400" />
          <span className="text-sm text-theme-secondary">Client Portal</span>
        </div>
        <h1 className="text-3xl font-bold text-theme-primary mb-2">
          {welcomeLabel}
          {customerName ? `, ${customerName}` : ""}! 👋
        </h1>
        <p className="text-theme-secondary">
          {hasPlanOrSite ? summaryActiveLabel : summaryInactiveLabel}
        </p>
      </div>
    </motion.div>
  );
}
