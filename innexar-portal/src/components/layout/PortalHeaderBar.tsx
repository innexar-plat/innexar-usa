"use client";

import Link from "next/link";
import { Menu, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/header/ThemeToggle";
import { LocaleSwitcher } from "@/components/header/LocaleSwitcher";
import { HeaderAvatar } from "@/components/header/HeaderAvatar";

const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]";

type PortalHeaderBarProps = {
  locale: string;
  customerName?: string;
  projectName?: string;
  avatarUrl?: string | null;
  unreadCount: number;
  onMenuOpen: () => void;
  mobileMenuOpen: boolean;
};

export function PortalHeaderBar({
  locale,
  customerName,
  projectName,
  avatarUrl,
  unreadCount,
  onMenuOpen,
  mobileMenuOpen,
}: PortalHeaderBarProps) {
  return (
    <header
      className="sticky top-0 z-30 h-16 sm:h-20 backdrop-blur-xl border-b transition-colors duration-200"
      style={{ background: "var(--header-bg)", borderColor: "var(--border)" }}
    >
      <div className="h-full px-3 sm:px-4 lg:px-8 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onMenuOpen}
          aria-label="Open menu"
          aria-expanded={mobileMenuOpen}
          className={`lg:hidden w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${FOCUS_RING}`}
          style={{ background: "var(--card-bg)", color: "var(--text-primary)" }}
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden lg:flex items-center gap-2 min-w-0">
          <h1
            className="text-lg lg:text-xl font-bold truncate"
            style={{ color: "var(--text-primary)" }}
          >
            {projectName || customerName || "Client Portal"}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          <ThemeToggle />
          <LocaleSwitcher />
          <a
            href="https://wa.me/5513991821557"
            target="_blank"
            rel="noopener noreferrer"
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 transition-colors text-[#25D366] flex-shrink-0 hidden sm:flex"
            aria-label="Falar com suporte no WhatsApp"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.865 9.865 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>
          <Link
            href={`/${locale}/notifications`}
            className={`relative w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${FOCUS_RING}`}
            style={{ background: "var(--card-bg)", color: "var(--text-secondary)" }}
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-xs font-bold bg-red-500 text-white rounded-full">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Link>
          <HeaderAvatar customerName={customerName} avatarUrl={avatarUrl} />
        </div>
      </div>
    </header>
  );
}
