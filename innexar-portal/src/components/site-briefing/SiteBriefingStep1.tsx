"use client";

import { motion } from "framer-motion";

type SiteBriefingStep1Props = {
  companyName: string;
  setCompanyName: (v: string) => void;
  services: string;
  setServices: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  whatsapp: string;
  setWhatsapp: (v: string) => void;
  labels: {
    companyName: string;
    placeholdersCompany: string;
    companyHelp: string;
    services: string;
    placeholdersServices: string;
    servicesHelp: string;
    city: string;
    placeholdersCity: string;
    whatsapp: string;
    placeholdersWhatsapp: string;
  };
};

const inputClass =
  "w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-cyan-500/50";

export function SiteBriefingStep1({
  companyName,
  setCompanyName,
  services,
  setServices,
  city,
  setCity,
  whatsapp,
  setWhatsapp,
  labels,
}: SiteBriefingStep1Props) {
  return (
    <motion.div
      key="step-0"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {labels.companyName}
        </label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          className={inputClass}
          placeholder={labels.placeholdersCompany}
        />
        <p className="text-xs text-slate-500 mt-1">{labels.companyHelp}</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{labels.services}</label>
        <textarea
          value={services}
          onChange={(e) => setServices(e.target.value)}
          rows={3}
          className={`${inputClass} resize-none`}
          placeholder={labels.placeholdersServices}
        />
        <p className="text-xs text-slate-500 mt-1">{labels.servicesHelp}</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">{labels.city}</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputClass}
            placeholder={labels.placeholdersCity}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">{labels.whatsapp}</label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className={inputClass}
            placeholder={labels.placeholdersWhatsapp}
          />
        </div>
      </div>
    </motion.div>
  );
}
