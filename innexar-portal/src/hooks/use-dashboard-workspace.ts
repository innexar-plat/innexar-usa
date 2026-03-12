import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { workspaceFetch, getCustomerToken, CUSTOMER_TOKEN_KEY } from "@/lib/workspace-api";
import { API_PATHS } from "@/lib/api-paths";
import type { DashboardData } from "@/types/dashboard";

export function useDashboardWorkspace(locale: string) {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState("");
  const [payingId, setPayingId] = useState<number | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const refetchDashboard = useCallback(async () => {
    const currentToken = getCustomerToken();
    if (!currentToken) return;
    try {
      const r = await workspaceFetch(API_PATHS.ME.DASHBOARD, {
        token: currentToken,
        cache: "no-store",
      });
      if (r.ok) {
        const d = await r.json();
        setData(d);
        if (d.requires_password_change) {
          setShowPasswordModal(true);
        }
      } else if (r.status === 401) {
        localStorage.removeItem(CUSTOMER_TOKEN_KEY);
        router.push(`/${locale}/login`);
      } else {
        setData(null);
      }
    } catch {
      setData(null);
    }
  }, [locale, router]);

  useEffect(() => {
    let isMounted = true;

    const initDashboard = async () => {
      const currentToken = getCustomerToken();

      if (!currentToken) {
        if (isMounted) setLoading(false);
        router.push(`/${locale}/login`);
        return;
      }

      const email = typeof window !== "undefined" ? localStorage.getItem("customer_email") : null;
      if (email && isMounted) setCustomerName(email.split("@")[0]);

      try {
        const r = await workspaceFetch(API_PATHS.ME.DASHBOARD, {
          token: currentToken,
          cache: "no-store",
        });
        if (r.ok && isMounted) {
          const d = await r.json();
          setData(d);
          if (d.requires_password_change) {
            setShowPasswordModal(true);
          }
        } else if (isMounted) {
          if (r.status === 401) {
            localStorage.removeItem(CUSTOMER_TOKEN_KEY);
            router.push(`/${locale}/login`);
            return;
          }
          setData(null);
        }
      } catch {
        if (isMounted) setData(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initDashboard();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") refetchDashboard();
    };
    const onBriefingSubmitted = () => refetchDashboard();
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("portal:briefing-submitted", onBriefingSubmitted);

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("portal:briefing-submitted", onBriefingSubmitted);
    };
  }, [locale, router, refetchDashboard]);

  const handlePayInvoice = async (invoiceId: number, couponCode?: string) => {
    const token = getCustomerToken();
    if (!token) return;
    setPayingId(invoiceId);
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const successUrl = `${base}/${locale}/billing?paid=1`;
    const cancelUrl = `${base}/${locale}/billing`;
    try {
      const res = await workspaceFetch(API_PATHS.INVOICES.PAY(invoiceId), {
        method: "POST",
        token,
        body: JSON.stringify({
          success_url: successUrl,
          cancel_url: cancelUrl,
          coupon_code: couponCode?.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (json.payment_url) {
        window.location.href = json.payment_url;
        return;
      }
    } finally {
      setPayingId(null);
    }
  };

  return {
    data,
    loading,
    customerName,
    payingId,
    showPasswordModal,
    setShowPasswordModal,
    handlePayInvoice,
  };
}
