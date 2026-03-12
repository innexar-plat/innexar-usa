import { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  LayoutDashboard,
  FolderOpen,
  MessageSquare,
  PlusCircle,
  Receipt,
  User,
  Bell,
} from "lucide-react";
import {
  useWorkspaceApi,
  workspaceFetch,
  getCustomerToken,
  CUSTOMER_TOKEN_KEY,
} from "@/lib/workspace-api";
import { API_PATHS } from "@/lib/api-paths";

export type NavItem = {
  key: string;
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: number;
};

export function usePortalNav() {
  const [features, setFeatures] = useState<{
    invoices?: boolean;
    tickets?: boolean;
    projects?: boolean;
  } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const isWorkspaceApi = useWorkspaceApi();
  const t = useTranslations("auth.nav");

  useEffect(() => {
    if (!isWorkspaceApi) return;
    const token = getCustomerToken();
    if (!token) return;
    workspaceFetch(API_PATHS.ME.FEATURES, { token })
      .then((r) => (r.ok ? r.json() : null))
      .then(setFeatures)
      .catch(() => setFeatures(null));
    workspaceFetch(API_PATHS.ME.DASHBOARD, { token })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { messages?: { unread_count?: number } } | null) =>
        setUnreadCount(d?.messages?.unread_count ?? 0)
      )
      .catch(() => setUnreadCount(0));
  }, [isWorkspaceApi]);

  const navItems = useMemo(() => {
    const all: NavItem[] = [
      { key: "dashboard", label: t("dashboard"), icon: LayoutDashboard, href: `/${locale}` },
      { key: "projects", label: t("projects"), icon: FolderOpen, href: `/${locale}/projects` },
      { key: "support", label: t("support"), icon: MessageSquare, href: `/${locale}/support` },
      {
        key: "new-project",
        label: t("newProject"),
        icon: PlusCircle,
        href: `/${locale}/new-project`,
      },
      { key: "billing", label: t("billing"), icon: Receipt, href: `/${locale}/billing` },
      {
        key: "notifications",
        label: t("notifications"),
        icon: Bell,
        href: `/${locale}/notifications`,
        badge: unreadCount,
      },
      { key: "profile", label: t("profile"), icon: User, href: `/${locale}/profile` },
    ];
    if (!isWorkspaceApi || !features) return all;
    return all.filter((item) => {
      if (item.key === "dashboard" || item.key === "profile" || item.key === "notifications")
        return true;
      if (item.key === "projects") return features.projects !== false;
      if (item.key === "support") return features.tickets !== false;
      if (item.key === "billing") return features.invoices !== false;
      if (item.key === "new-project") return false;
      return true;
    });
  }, [isWorkspaceApi, features, locale, t, unreadCount]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(CUSTOMER_TOKEN_KEY);
    localStorage.removeItem("customer_email");
    localStorage.removeItem("customer_id");
    router.push(`/${locale}/login`);
  }, [router, locale]);

  const isActive = useCallback(
    (href: string) => {
      if (href === `/${locale}`) return pathname === href || pathname === `/${locale}`;
      return pathname?.startsWith(href) ?? false;
    },
    [pathname, locale]
  );

  return { navItems, unreadCount, handleLogout, isActive, t };
}
