"use client";

import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useWorkspaceApi } from "@/lib/workspace-api";
import { useSiteBriefing } from "@/hooks/use-site-briefing";
import { SiteBriefingSuccess } from "@/components/site-briefing/SiteBriefingSuccess";
import { SiteBriefingWizard } from "@/components/site-briefing/SiteBriefingWizard";

export default function SiteBriefingPage() {
  const t = useTranslations("siteBriefing");
  const router = useRouter();
  const locale = useLocale();
  const isWorkspaceApi = useWorkspaceApi();

  const {
    TOTAL_STEPS,
    currentStep,
    setCurrentStep,
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
    submitting,
    submitted,
    error,
    stepErrors,
    briefingFiles,
    setBriefingFiles,
    projectAguardando,
    projectLoading,
    files,
    filesLoading,
    uploading,
    fileError,
    handleFileUpload,
    goNext,
    goPrev,
    handleSubmit,
  } = useSiteBriefing(isWorkspaceApi, (key) => t(key as Parameters<typeof t>[0]));

  const stepLabels = [t("wizard.step1"), t("wizard.step2"), t("wizard.step3")];
  const stepSubtitles = [t("wizard.step1Desc"), t("wizard.step2Desc"), t("wizard.step3Desc")];

  if (submitted) {
    return (
      <SiteBriefingSuccess
        backToDashboardLabel={t("backToDashboard")}
        successTitle={t("successTitle")}
        successMessage={t("successMessage")}
        nextStepsTitle={t("wizard.nextStepsTitle")}
        nextStep1={t("wizard.nextStep1")}
        nextStep2={t("wizard.nextStep2")}
        nextStep3={t("wizard.nextStep3")}
        onBack={() => router.push(`/${locale}`)}
      />
    );
  }

  return (
    <SiteBriefingWizard
      totalSteps={TOTAL_STEPS}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      stepLabels={stepLabels}
      stepSubtitles={stepSubtitles}
      title={t("title")}
      subtitle={t("subtitle")}
      error={error}
      stepErrors={stepErrors}
      submitting={submitting}
      goPrev={goPrev}
      goNext={goNext}
      onSubmit={handleSubmit}
      companyName={companyName}
      setCompanyName={setCompanyName}
      services={services}
      setServices={setServices}
      city={city}
      setCity={setCity}
      whatsapp={whatsapp}
      setWhatsapp={setWhatsapp}
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
      fullDescription={fullDescription}
      setFullDescription={setFullDescription}
      projectLoading={projectLoading}
      projectAguardando={projectAguardando}
      files={files}
      filesLoading={filesLoading}
      uploading={uploading}
      fileError={fileError}
      handleFileUpload={handleFileUpload}
      briefingFiles={briefingFiles}
      setBriefingFiles={setBriefingFiles}
      isWorkspaceApi={isWorkspaceApi}
      t={(key, values) =>
        values !== undefined
          ? t(key as Parameters<typeof t>[0], values)
          : t(key as Parameters<typeof t>[0])
      }
      submitLabel={t("submit")}
      backLabel={t("wizard.back")}
      nextLabel={t("wizard.next")}
      stepOfFormatted={t("wizard.stepOf", { current: currentStep + 1, total: TOTAL_STEPS })}
    />
  );
}
