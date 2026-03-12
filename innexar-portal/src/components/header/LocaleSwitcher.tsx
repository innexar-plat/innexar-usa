"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useCallback } from "react";

const LOCALES = [
  { code: "pt", label: "PT" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
] as const;

const FOCUS_CLASS =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--page-bg)]";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const setLocale = useCallback(
    (newLocale: string) => {
      router.replace(pathname, { locale: newLocale });
    },
    [router, pathname]
  );

  return (
    <div
      className="flex items-center rounded-xl border border-[var(--border)] overflow-hidden"
      role="group"
      aria-label="Language"
    >
      {LOCALES.map(({ code, label }) => {
        const isActive = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            aria-label={`Language: ${label}`}
            aria-pressed={isActive}
            className={`min-w-[2.5rem] h-10 px-2 text-sm font-medium transition-colors ${FOCUS_CLASS} ${
              isActive
                ? "bg-[var(--accent)] text-white"
                : "bg-[var(--card-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
