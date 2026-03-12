"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { usePortalNav } from "@/hooks/use-portal-nav";
import { useTheme } from "@/contexts/theme-context";
import { PortalSidebar } from "@/components/layout/PortalSidebar";
import { PortalHeaderBar } from "@/components/layout/PortalHeaderBar";

type PortalLayoutProps = {
  children: React.ReactNode;
  customerName?: string;
  projectName?: string;
  avatarUrl?: string | null;
};

export default function PortalLayout({
  children,
  customerName,
  projectName,
  avatarUrl,
}: PortalLayoutProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const { navItems, unreadCount, handleLogout, isActive, t } = usePortalNav();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{
        background: `linear-gradient(to bottom right, var(--page-bg-from), var(--page-bg-via), var(--page-bg-to))`,
      }}
    >
      <PortalSidebar
        locale={locale}
        theme={theme}
        sidebarOpen={sidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        navItems={navItems}
        isActive={isActive}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        onMobileClose={() => setMobileMenuOpen(false)}
        onNavClick={() => setMobileMenuOpen(false)}
        onLogout={handleLogout}
        logoutLabel={t("logout")}
      />

      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-[280px]" : "lg:ml-20"}`}>
        <PortalHeaderBar
          locale={locale}
          customerName={customerName}
          projectName={projectName}
          avatarUrl={avatarUrl}
          unreadCount={unreadCount}
          onMenuOpen={() => setMobileMenuOpen(true)}
          mobileMenuOpen={mobileMenuOpen}
        />

        <main className="p-4 sm:p-6 lg:p-8 min-h-[calc(100vh-4rem)] sm:min-h-[calc(100vh-5rem)]">
          {children}
        </main>
      </div>
    </div>
  );
}
