import { useState, useEffect, useCallback } from "react";
import { useWorkspaceApi, workspaceFetch, getCustomerToken } from "@/lib/workspace-api";
import { API_PATHS } from "@/lib/api-paths";
import type { CustomerProfile } from "@/types/profile";
import { emptyProfile } from "@/types/profile";

export function useProfile() {
  const isWorkspaceApi = useWorkspaceApi();
  const [profile, setProfile] = useState<CustomerProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!isWorkspaceApi) {
        const email = localStorage.getItem("customer_email") || "";
        setProfile((prev) => ({ ...prev, email, name: email.split("@")[0] || "" }));
        setLoading(false);
        return;
      }
      const token = getCustomerToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await workspaceFetch(API_PATHS.ME.PROFILE, { token });
        if (res.ok) {
          const data = (await res.json()) as CustomerProfile;
          setProfile({
            name: data.name ?? "",
            email: data.email ?? "",
            phone: data.phone ?? null,
            address: data.address ?? null,
          });
        } else {
          setProfile((prev) => ({ ...prev, email: localStorage.getItem("customer_email") || "" }));
        }
      } catch {
        setProfile((prev) => ({ ...prev, email: localStorage.getItem("customer_email") || "" }));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isWorkspaceApi]);

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSaving(true);
      const token = getCustomerToken();
      if (!isWorkspaceApi || !token) {
        setError("Não foi possível salvar. Faça login novamente.");
        setSaving(false);
        return;
      }
      try {
        const res = await workspaceFetch(API_PATHS.ME.PROFILE, {
          method: "PATCH",
          token,
          body: JSON.stringify({
            name: profile.name.trim(),
            phone: profile.phone?.trim() || null,
            address:
              profile.address && Object.keys(profile.address).length > 0 ? profile.address : null,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as CustomerProfile;
          setProfile({
            name: data.name ?? "",
            email: data.email ?? "",
            phone: data.phone ?? null,
            address: data.address ?? null,
          });
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        } else {
          const data = await res.json().catch(() => ({}));
          setError(
            typeof (data as { detail?: string }).detail === "string"
              ? (data as { detail: string }).detail
              : "Erro ao salvar"
          );
        }
      } catch {
        setError("Erro de conexão.");
      } finally {
        setSaving(false);
      }
    },
    [isWorkspaceApi, profile]
  );

  return { profile, setProfile, loading, saving, saved, error, handleSave };
}
