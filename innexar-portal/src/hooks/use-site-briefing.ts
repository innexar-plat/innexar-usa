import { useState, useEffect, useCallback } from "react";
import { workspaceFetch, getCustomerToken } from "@/lib/workspace-api";
import { API_PATHS } from "@/lib/api-paths";
import type { ProjectAguardando, ProjectFileItem } from "@/types/site-briefing";

const TOTAL_STEPS = 3;

export function useSiteBriefing(isWorkspaceApi: boolean, t: (key: string) => string) {
  const [currentStep, setCurrentStep] = useState(0);
  const [companyName, setCompanyName] = useState("");
  const [services, setServices] = useState("");
  const [city, setCity] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [domain, setDomain] = useState("");
  const [colors, setColors] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#1e293b");
  const [photos, setPhotos] = useState("");
  const [fullDescription, setFullDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [stepErrors, setStepErrors] = useState<Record<number, string>>({});
  const [briefingFiles, setBriefingFiles] = useState<File[]>([]);
  const [projectAguardando, setProjectAguardando] = useState<ProjectAguardando | null>(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [files, setFiles] = useState<ProjectFileItem[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileError, setFileError] = useState("");

  const fetchProjectAguardando = useCallback(async () => {
    const token = getCustomerToken();
    if (!token || !isWorkspaceApi) {
      setProjectLoading(false);
      return;
    }
    try {
      const res = await workspaceFetch(API_PATHS.ME.PROJECT_AGUARDANDO_BRIEFING, { token });
      if (res.ok) {
        const data = await res.json();
        setProjectAguardando(data ?? null);
      }
    } catch {
      setProjectAguardando(null);
    } finally {
      setProjectLoading(false);
    }
  }, [isWorkspaceApi]);

  const fetchFiles = useCallback(async (projectId: number) => {
    const token = getCustomerToken();
    if (!token) return;
    setFilesLoading(true);
    try {
      const res = await workspaceFetch(API_PATHS.PROJECTS.FILES(projectId), { token });
      if (res.ok) {
        const data = await res.json();
        setFiles(Array.isArray(data) ? data : []);
      } else {
        setFiles([]);
      }
    } catch {
      setFiles([]);
    } finally {
      setFilesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjectAguardando();
  }, [fetchProjectAguardando]);

  useEffect(() => {
    if (projectAguardando?.id) {
      fetchFiles(projectAguardando.id);
    } else {
      setFiles([]);
    }
  }, [projectAguardando?.id, fetchFiles]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const projectId = projectAguardando?.id;
      const token = getCustomerToken();
      if (!projectId || !token || !e.target.files?.length) return;
      setFileError("");
      setUploading(true);
      const base = process.env.NEXT_PUBLIC_WORKSPACE_API_URL?.replace(/\/*$/, "") || "";
      try {
        for (const file of Array.from(e.target.files)) {
          const form = new FormData();
          form.append("file", file);
          const res = await fetch(`${base}${API_PATHS.PROJECTS.FILES(projectId)}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: form,
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            setFileError(typeof err.detail === "string" ? err.detail : t("errorSend"));
            break;
          }
        }
        fetchFiles(projectId);
      } catch {
        setFileError(t("errorConnection"));
      } finally {
        setUploading(false);
        e.target.value = "";
      }
    },
    [projectAguardando?.id, t, fetchFiles]
  );

  const validateStep = useCallback(
    (step: number): boolean => {
      const newErrors: Record<number, string> = { ...stepErrors };
      if (step === 0 && !companyName.trim()) {
        newErrors[0] = t("errorCompany");
        setStepErrors(newErrors);
        return false;
      }
      delete newErrors[step];
      setStepErrors(newErrors);
      return true;
    },
    [stepErrors, companyName, t]
  );

  const goNext = useCallback(() => {
    if (validateStep(currentStep) && currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, validateStep]);

  const goPrev = useCallback(() => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  }, [currentStep]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      const token = getCustomerToken();
      if (!token && isWorkspaceApi) {
        setError(t("errorLogin"));
        return;
      }
      if (!companyName.trim()) {
        setError(t("errorCompany"));
        setCurrentStep(0);
        return;
      }
      setSubmitting(true);
      try {
        if (isWorkspaceApi && token) {
          const colorsValue =
            primaryColor && secondaryColor
              ? `Primary: ${primaryColor}, Secondary: ${secondaryColor}${colors.trim() ? `. Notes: ${colors.trim()}` : ""}`
              : colors.trim() || undefined;

          if (briefingFiles.length > 0) {
            const formData = new FormData();
            formData.append("company_name", companyName.trim());
            if (services.trim()) formData.append("services", services.trim());
            if (city.trim()) formData.append("city", city.trim());
            if (whatsapp.trim()) formData.append("whatsapp", whatsapp.trim());
            if (domain.trim()) formData.append("domain", domain.trim());
            if (colorsValue) formData.append("colors", colorsValue);
            if (photos.trim()) formData.append("photos", photos.trim());
            if (fullDescription.trim()) formData.append("description", fullDescription.trim());
            briefingFiles.forEach((file) => formData.append("files", file));
            const base = process.env.NEXT_PUBLIC_WORKSPACE_API_URL?.replace(/\/$/, "") || "";
            const res = await fetch(`${base}${API_PATHS.SITE_BRIEFING_UPLOAD}`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` },
              body: formData,
            });
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              setError(typeof data.detail === "string" ? data.detail : t("errorSend"));
              setSubmitting(false);
              return;
            }
          } else {
            const res = await workspaceFetch(API_PATHS.SITE_BRIEFING, {
              method: "POST",
              token,
              body: JSON.stringify({
                company_name: companyName.trim(),
                services: services.trim() || undefined,
                city: city.trim() || undefined,
                whatsapp: whatsapp.trim() || undefined,
                domain: domain.trim() || undefined,
                logo_url: undefined,
                colors: colorsValue,
                photos: photos.trim() || undefined,
                description: fullDescription.trim() || undefined,
              }),
            });
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              setError(typeof data.detail === "string" ? data.detail : t("errorSend"));
              setSubmitting(false);
              return;
            }
          }
          setSubmitted(true);
          if (typeof window !== "undefined") {
            window.dispatchEvent(new CustomEvent("portal:briefing-submitted"));
          }
          return;
        }
        setError(t("errorNoApi"));
      } catch {
        setError(t("errorConnection"));
      } finally {
        setSubmitting(false);
      }
    },
    [
      isWorkspaceApi,
      t,
      companyName,
      services,
      city,
      whatsapp,
      domain,
      colors,
      primaryColor,
      secondaryColor,
      photos,
      fullDescription,
      briefingFiles,
    ]
  );

  return {
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
    validateStep,
    goNext,
    goPrev,
    handleSubmit,
  };
}
