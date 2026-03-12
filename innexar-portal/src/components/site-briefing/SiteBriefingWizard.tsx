"use client";

import { motion, AnimatePresence } from "framer-motion";
import { FileText, ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import { SiteBriefingProgressBar } from "./SiteBriefingProgressBar";
import { SiteBriefingStep1 } from "./SiteBriefingStep1";
import { SiteBriefingStep2 } from "./SiteBriefingStep2";
import { SiteBriefingStep3 } from "./SiteBriefingStep3";
import type { ProjectAguardando, ProjectFileItem } from "@/types/site-briefing";

type SiteBriefingWizardProps = {
  totalSteps: number;
  currentStep: number;
  setCurrentStep: (n: number) => void;
  stepLabels: string[];
  stepSubtitles: string[];
  title: string;
  subtitle: string;
  error: string;
  stepErrors: Record<number, string>;
  submitting: boolean;
  goPrev: () => void;
  goNext: () => void;
  onSubmit: (e: React.FormEvent) => void;
  companyName: string;
  setCompanyName: (v: string) => void;
  services: string;
  setServices: (v: string) => void;
  city: string;
  setCity: (v: string) => void;
  whatsapp: string;
  setWhatsapp: (v: string) => void;
  domain: string;
  setDomain: (v: string) => void;
  colors: string;
  setColors: (v: string) => void;
  primaryColor: string;
  setPrimaryColor: (v: string) => void;
  secondaryColor: string;
  setSecondaryColor: (v: string) => void;
  photos: string;
  setPhotos: (v: string) => void;
  fullDescription: string;
  setFullDescription: (v: string) => void;
  projectLoading: boolean;
  projectAguardando: ProjectAguardando | null;
  files: ProjectFileItem[];
  filesLoading: boolean;
  uploading: boolean;
  fileError: string;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  briefingFiles: File[];
  setBriefingFiles: (f: File[] | ((prev: File[]) => File[])) => void;
  isWorkspaceApi: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
  submitLabel: string;
  backLabel: string;
  nextLabel: string;
  stepOfFormatted: string;
};

export function SiteBriefingWizard({
  totalSteps,
  currentStep,
  setCurrentStep,
  stepLabels,
  stepSubtitles,
  title,
  subtitle,
  error,
  stepErrors,
  submitting,
  goPrev,
  goNext,
  onSubmit,
  companyName,
  setCompanyName,
  services,
  setServices,
  city,
  setCity,
  whatsapp,
  setWhatsapp,
  domain,
  setDomain,
  colors,
  setColors,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  photos,
  setPhotos,
  fullDescription,
  setFullDescription,
  projectLoading,
  projectAguardando,
  files,
  filesLoading,
  uploading,
  fileError,
  handleFileUpload,
  briefingFiles,
  setBriefingFiles,
  isWorkspaceApi,
  t,
  submitLabel,
  backLabel,
  nextLabel,
  stepOfFormatted,
}: SiteBriefingWizardProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-theme-primary mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8 text-cyan-400" />
          {title}
        </h1>
        <p className="text-theme-secondary">{subtitle}</p>
      </div>

      <SiteBriefingProgressBar
        totalSteps={totalSteps}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        stepLabels={stepLabels}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-base rounded-2xl p-8"
      >
        <div className="mb-6">
          <h2 className="text-xl font-bold text-theme-primary">{stepLabels[currentStep]}</h2>
          <p className="text-sm text-theme-secondary mt-1">{stepSubtitles[currentStep]}</p>
        </div>

        <form onSubmit={onSubmit}>
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              {error}
            </div>
          )}
          {stepErrors[currentStep] && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              {stepErrors[currentStep]}
            </div>
          )}

          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <SiteBriefingStep1
                companyName={companyName}
                setCompanyName={setCompanyName}
                services={services}
                setServices={setServices}
                city={city}
                setCity={setCity}
                whatsapp={whatsapp}
                setWhatsapp={setWhatsapp}
                labels={{
                  companyName: t("companyName"),
                  placeholdersCompany: t("placeholders.company"),
                  companyHelp: t("wizard.companyHelp"),
                  services: t("services"),
                  placeholdersServices: t("placeholders.services"),
                  servicesHelp: t("wizard.servicesHelp"),
                  city: t("city"),
                  placeholdersCity: t("placeholders.city"),
                  whatsapp: t("whatsapp"),
                  placeholdersWhatsapp: t("placeholders.whatsapp"),
                }}
              />
            )}
            {currentStep === 1 && (
              <SiteBriefingStep2
                domain={domain}
                setDomain={setDomain}
                colors={colors}
                setColors={setColors}
                primaryColor={primaryColor}
                setPrimaryColor={setPrimaryColor}
                secondaryColor={secondaryColor}
                setSecondaryColor={setSecondaryColor}
                photos={photos}
                setPhotos={setPhotos}
                projectLoading={projectLoading}
                projectAguardando={projectAguardando}
                files={files}
                filesLoading={filesLoading}
                uploading={uploading}
                fileError={fileError}
                onFileUpload={handleFileUpload}
                labels={{
                  logoUpload: t("wizard.logoUpload"),
                  logoUploadHint: t("wizard.logoUploadHint"),
                  uploadLogo: t("wizard.uploadLogo"),
                  uploading: t("uploading"),
                  brandColors: t("wizard.brandColors"),
                  primary: t("wizard.primary"),
                  secondary: t("wizard.secondary"),
                  placeholdersColors: t("placeholders.colors"),
                  colorsHelp: t("wizard.colorsHelp"),
                  domain: t("domain"),
                  placeholdersDomain: t("placeholders.domain"),
                  domainHelp: t("wizard.domainHelp"),
                  photos: t("photos"),
                  placeholdersPhotos: t("placeholders.photos"),
                }}
              />
            )}
            {currentStep === 2 && (
              <SiteBriefingStep3
                fullDescription={fullDescription}
                setFullDescription={setFullDescription}
                projectLoading={projectLoading}
                projectAguardando={projectAguardando}
                files={files}
                filesLoading={filesLoading}
                uploading={uploading}
                fileError={fileError}
                onFileUpload={handleFileUpload}
                briefingFiles={briefingFiles}
                setBriefingFiles={setBriefingFiles}
                isWorkspaceApi={isWorkspaceApi}
                labels={{
                  fullDescription: t("fullDescription"),
                  fullDescriptionPlaceholder: t("fullDescriptionPlaceholder"),
                  descriptionHelp: t("wizard.descriptionHelp"),
                  projectFiles: t("projectFiles"),
                  projectFilesHint: t("projectFilesHint", { name: projectAguardando?.name ?? "" }),
                  selectFiles: t("selectFiles"),
                  uploading: t("uploading"),
                  filesCount: t("filesCount", { count: files.length }),
                  noProjectYet: t("noProjectYet"),
                  briefingAttach: t("briefingAttach"),
                  briefingAttachHint: t("briefingAttachHint"),
                  briefingFilesCount: t("briefingFilesCount", { count: briefingFiles.length }),
                  briefingSelectFiles: t("briefingSelectFiles"),
                  remove: t("remove"),
                }}
              />
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8 pt-4 border-t border-[var(--border)]">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={goPrev}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border)] text-theme-secondary hover:bg-[var(--border)]/30 transition-colors text-sm font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                {backLabel}
              </button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 transition-colors text-sm"
              >
                {nextLabel}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all text-sm"
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitLabel}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-theme-muted mt-4">{stepOfFormatted}</p>
        </form>
      </motion.div>
    </div>
  );
}
