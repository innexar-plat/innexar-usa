"use client";

import { useTranslations } from "next-intl";
import { MessageSquare } from "lucide-react";

const SUPPORT_EMAIL = "support@innexar.app";
const WHATSAPP_NUMBER = "14074736081";

export function SupportQuickContact() {
  const t = useTranslations("supportPage");
  return (
    <div className="card-base rounded-2xl p-6">
      <h2 className="text-lg font-bold text-theme-primary mb-4">{t("quickContact")}</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="flex items-center gap-4 p-4 bg-[var(--border)]/30 hover:bg-[var(--border)]/50 rounded-xl transition-colors"
        >
          <div className="w-10 h-10 bg-[var(--accent)]/20 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <div>
            <p className="text-theme-primary font-medium">{t("emailSupport")}</p>
            <p className="text-theme-secondary text-sm">{SUPPORT_EMAIL}</p>
          </div>
        </a>
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 bg-[var(--border)]/30 hover:bg-[var(--border)]/50 rounded-xl transition-colors"
        >
          <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <p className="text-theme-primary font-medium">{t("whatsApp")}</p>
            <p className="text-theme-secondary text-sm">{t("quickResponse")}</p>
          </div>
        </a>
      </div>
    </div>
  );
}
