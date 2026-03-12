import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";
import { useWorkspaceApi, getWorkspaceApiBase, CUSTOMER_TOKEN_KEY } from "@/lib/workspace-api";
import { API_PATHS } from "@/lib/api-paths";

export function useLogin() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isWorkspaceApi = useWorkspaceApi();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingSession, setCheckingSession] = useState(false);

  const checkoutToken = searchParams.get("token");

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      if (checkoutToken) {
        setCheckingSession(true);
        try {
          if (!isWorkspaceApi) {
            if (isMounted) {
              setError(t("workspaceRequired"));
              setCheckingSession(false);
            }
            return;
          }
          const base = getWorkspaceApiBase();
          const res = await fetch(`${base}${API_PATHS.AUTH.CHECKOUT_LOGIN}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: checkoutToken }),
          });
          const data = await res.json();
          if (res.ok && isMounted) {
            localStorage.setItem(CUSTOMER_TOKEN_KEY, data.access_token);
            localStorage.setItem("customer_email", data.email);
            if (data.customer_id != null) {
              localStorage.setItem("customer_id", String(data.customer_id));
            }
            router.replace(`/${locale}`);
            return;
          }
          if (isMounted) {
            setError(data.detail || t("error.invalid"));
            setCheckingSession(false);
            router.replace(`/${locale}/login`);
          }
        } catch {
          if (isMounted) {
            setError(t("error.generic"));
            setCheckingSession(false);
            router.replace(`/${locale}/login`);
          }
        }
      } else {
        const token = localStorage.getItem(CUSTOMER_TOKEN_KEY);
        if (token && isMounted) {
          router.push(`/${locale}`);
        }
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [router, locale, checkoutToken, isWorkspaceApi, t]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
        if (!isWorkspaceApi) {
          setError(t("workspaceRequired"));
          return;
        }
        const base = getWorkspaceApiBase();
        const response = await fetch(`${base}${API_PATHS.AUTH.LOGIN}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (response.ok) {
          localStorage.setItem(CUSTOMER_TOKEN_KEY, data.access_token);
          localStorage.setItem("customer_email", email);
          if (data.customer_id != null) {
            localStorage.setItem("customer_id", String(data.customer_id));
          }
          router.push(`/${locale}`);
        } else {
          setError(
            Array.isArray(data.detail)
              ? (data.detail[0]?.msg ?? t("error.invalid"))
              : (data.detail ?? t("error.invalid"))
          );
        }
      } catch {
        setError(t("error.generic"));
      } finally {
        setLoading(false);
      }
    },
    [isWorkspaceApi, email, password, locale, router, t]
  );

  return {
    checkingSession,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    error,
    handleSubmit,
    t,
    locale,
  };
}
