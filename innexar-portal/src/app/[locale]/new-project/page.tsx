"use client";

import { useLocale } from "next-intl";
import { useNewProject } from "@/hooks/use-new-project";
import { NewProjectSuccess } from "@/components/new-project/NewProjectSuccess";
import { NewProjectForm } from "@/components/new-project/NewProjectForm";

export default function NewProjectPage() {
  const locale = useLocale();
  const {
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
    submitted,
    handleSubmit,
  } = useNewProject();

  if (submitted) {
    return <NewProjectSuccess locale={locale} />;
  }

  return (
    <NewProjectForm
      step={step}
      setStep={setStep}
      projectType={projectType}
      setProjectType={setProjectType}
      projectName={projectName}
      setProjectName={setProjectName}
      description={description}
      setDescription={setDescription}
      budget={budget}
      setBudget={setBudget}
      timeline={timeline}
      setTimeline={setTimeline}
      submitting={submitting}
      onSubmit={handleSubmit}
    />
  );
}
