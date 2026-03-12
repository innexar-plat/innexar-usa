"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useWorkspaceApi } from "@/lib/workspace-api";
import WorkspaceLayout from "@/components/workspace-layout";

const STAFF_TOKEN_KEY = "staff_token";

export default function WorkspaceLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const isWorkspaceApi = useWorkspaceApi();
  const [loading, setLoading] = useState(true);

  const isPublicAuthPage =
    pathname?.includes("/login") ||
    pathname?.includes("/forgot-password") ||
    pathname?.includes("/reset-password");

  useEffect(() => {
    if (!isWorkspaceApi) {
      setLoading(false);
      return;
    }
    if (isPublicAuthPage) {
      setLoading(false);
      return;
    }
    const token =
      typeof window !== "undefined" ? localStorage.getItem(STAFF_TOKEN_KEY) : null;
    if (!token) {
      router.push(`/${locale}/login`);
      return;
    }
    setLoading(false);
  }, [router, locale, isPublicAuthPage, isWorkspaceApi]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" aria-hidden="true" />
      </div>
    );
  }

  if (!isWorkspaceApi) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <p className="text-slate-400">
          Workspace is not configured. Set NEXT_PUBLIC_USE_WORKSPACE_API and
          NEXT_PUBLIC_WORKSPACE_API_URL.
        </p>
      </div>
    );
  }

  if (isPublicAuthPage) {
    return <>{children}</>;
  }

  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
