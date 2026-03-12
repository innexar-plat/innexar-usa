import { useState, useCallback } from "react";
import { useWorkspaceApi, workspaceFetch, getCustomerToken } from "@/lib/workspace-api";
import { API_PATHS } from "@/lib/api-paths";

export function useNewProject() {
  const isWorkspaceApi = useWorkspaceApi();
  const [step, setStep] = useState(1);
  const [projectType, setProjectType] = useState("");
  const [projectName, setProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        if (!isWorkspaceApi) {
          alert(
            "Portal requer Workspace API. Configure NEXT_PUBLIC_USE_WORKSPACE_API e NEXT_PUBLIC_WORKSPACE_API_URL."
          );
          setSubmitting(false);
          return;
        }
        const token = getCustomerToken();
        if (!token) {
          alert("Faça login para enviar a solicitação.");
          setSubmitting(false);
          return;
        }
        const response = await workspaceFetch(API_PATHS.NEW_PROJECT, {
          method: "POST",
          token,
          body: JSON.stringify({
            project_name: projectName,
            project_type: projectType,
            description: description || undefined,
            budget: budget || undefined,
            timeline: timeline || undefined,
          }),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          alert(
            `Erro ao submeter: ${typeof data.detail === "string" ? data.detail : "Erro desconhecido"}`
          );
          setSubmitting(false);
          return;
        }
        setSubmitted(true);
      } catch {
        alert("Erro de conexão. Tente novamente.");
      } finally {
        setSubmitting(false);
      }
    },
    [isWorkspaceApi, projectName, projectType, description, budget, timeline]
  );

  return {
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
  };
}
