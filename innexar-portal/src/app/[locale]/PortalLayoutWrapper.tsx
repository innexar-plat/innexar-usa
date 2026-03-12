"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import PortalLayout from "@/components/PortalLayout";

interface CustomerData {
  name: string;
  email: string;
}

const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"];

function isPublicPath(pathname: string | null, locale: string): boolean {
  if (!pathname) return false;
  for (const p of PUBLIC_PATHS) {
    if (pathname.includes(p) || pathname === `/${locale}${p}`) return true;
  }
  return false;
}

export default function PortalLayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [loading, setLoading] = useState(true);

  const isPublic = isPublicPath(pathname ?? null, locale);

  useEffect(() => {
    const run = () => {
      if (isPublic) {
        setLoading(false);
        return;
      }
      const token = localStorage.getItem("customer_token");
      if (!token) {
        router.push(`/${locale}/login`);
        return;
      }
      const storedEmail = localStorage.getItem("customer_email");
      if (storedEmail) {
        setCustomerData({
          name: storedEmail.split("@")[0],
          email: storedEmail,
        });
      }
      setLoading(false);
    };
    queueMicrotask(run);
  }, [router, locale, isPublic]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center transition-colors duration-200"
        style={{ background: "var(--page-bg)" }}
      >
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "var(--accent)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (isPublic) {
    return <>{children}</>;
  }

  return <PortalLayout customerName={customerData?.name}>{children}</PortalLayout>;
}
