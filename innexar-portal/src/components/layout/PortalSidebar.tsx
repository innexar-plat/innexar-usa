"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, LogOut, X } from "lucide-react";
import type { NavItem } from "@/hooks/use-portal-nav";
import type { Theme } from "@/contexts/theme-context";

const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]";

type PortalSidebarProps = {
  locale: string;
  theme: Theme;
  sidebarOpen: boolean;
  mobileMenuOpen: boolean;
  navItems: NavItem[];
  isActive: (href: string) => boolean;
  onSidebarToggle: () => void;
  onMobileClose: () => void;
  onNavClick: () => void;
  onLogout: () => void;
  logoutLabel: string;
};

export function PortalSidebar({
  locale,
  theme,
  sidebarOpen,
  mobileMenuOpen,
  navItems,
  isActive,
  onSidebarToggle,
  onMobileClose,
  onNavClick,
  onLogout,
  logoutLabel,
}: PortalSidebarProps) {
  return (
    <>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onMobileClose}
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{
          width: sidebarOpen ? 280 : 80,
          x: mobileMenuOpen
            ? 0
            : typeof window !== "undefined" && window.innerWidth < 1024
              ? -280
              : 0,
        }}
        className={`fixed top-0 left-0 h-full backdrop-blur-xl border-r z-50 flex flex-col transition-colors duration-200
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ background: "var(--sidebar-bg)", borderColor: "var(--border)" }}
      >
        <div
          className="h-20 flex items-center justify-between px-4 sm:px-6 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <Link href={`/${locale}`} className="flex items-center min-w-0">
            <motion.div
              animate={{ width: sidebarOpen ? "auto" : "40px" }}
              className="overflow-hidden"
            >
              {sidebarOpen ? (
                <Image
                  src="/logo-header-white.png"
                  alt="Innexar"
                  width={360}
                  height={90}
                  className={`h-20 w-auto max-w-[200px] sm:max-w-none sm:h-24 ${theme === "light" ? "invert" : ""}`}
                />
              ) : (
                <Image
                  src="/favicon.png"
                  alt="Innexar"
                  width={40}
                  height={40}
                  className="rounded-xl"
                />
              )}
            </motion.div>
          </Link>

          <button
            type="button"
            onClick={onSidebarToggle}
            aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            className={`hidden lg:flex w-8 h-8 items-center justify-center rounded-lg transition-colors ${FOCUS_RING}`}
            style={{ background: "var(--card-bg)", color: "var(--text-secondary)" }}
          >
            <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }}>
              <ChevronLeft className="w-4 h-4" />
            </motion.div>
          </button>

          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Close menu"
            className={`lg:hidden w-8 h-8 flex items-center justify-center rounded-lg ${FOCUS_RING}`}
            style={{ background: "var(--card-bg)", color: "var(--text-secondary)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 overflow-y-auto" aria-label="Main navigation">
          <ul className="space-y-1" role="list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    onClick={onNavClick}
                    aria-current={active ? "page" : undefined}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${FOCUS_RING} ${
                      active
                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30"
                        : "hover:bg-[var(--card-bg)]"
                    }`}
                    style={{
                      color: active ? "var(--text-primary)" : "var(--text-secondary)",
                      background: active ? undefined : "transparent",
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-shrink-0"
                      style={{ color: active ? "var(--accent)" : "var(--text-muted)" }}
                    >
                      <Icon className="w-5 h-5" />
                    </motion.div>

                    <AnimatePresence>
                      {sidebarOpen && (
                        <motion.span
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          className="flex-1 font-medium truncate"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {item.badge !== undefined && item.badge > 0 && sidebarOpen && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded-full flex-shrink-0"
                      >
                        {item.badge}
                      </motion.span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Log out"
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:text-red-500 ${FOCUS_RING}`}
            style={{ color: "var(--text-secondary)" }}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-medium"
                >
                  {logoutLabel}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>
    </>
  );
}
