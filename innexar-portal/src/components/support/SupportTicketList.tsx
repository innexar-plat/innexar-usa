"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import type { Ticket } from "@/types/support";
import { getIntlLocale } from "@/lib/intl-locale";

type StatusConfig = { icon: React.ElementType; color: string; bg: string; labelKey: string };

const STATUS_KEYS: Record<string, StatusConfig> = {
  open: { icon: AlertCircle, color: "text-blue-400", bg: "bg-blue-500/20", labelKey: "open" },
  pending: {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-500/20",
    labelKey: "pending",
  },
  resolved: {
    icon: CheckCircle2,
    color: "text-green-400",
    bg: "bg-green-500/20",
    labelKey: "resolved",
  },
  closed: {
    icon: CheckCircle2,
    color: "text-slate-400",
    bg: "bg-slate-500/20",
    labelKey: "closed",
  },
};

type SupportTicketListProps = {
  tickets: Ticket[];
  locale: string;
};

export function SupportTicketList({ tickets, locale }: SupportTicketListProps) {
  const t = useTranslations("supportPage");
  const tStatus = useTranslations("supportPage.ticketStatus");
  const intlLocale = getIntlLocale(locale);

  return (
    <div className="space-y-4">
      {tickets.map((ticket, index) => {
        const status = STATUS_KEYS[ticket.status] || STATUS_KEYS.open;
        const StatusIcon = status.icon;
        const statusLabel = tStatus(status.labelKey);
        return (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={`/${locale}/support/${ticket.id}`}>
              <div className="card-base rounded-2xl p-6 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-xl ${status.bg} flex items-center justify-center`}
                    >
                      <StatusIcon className={`w-5 h-5 ${status.color}`} />
                    </div>
                    <div>
                      <h3 className="text-theme-primary font-medium">{ticket.subject}</h3>
                      <p className="text-theme-secondary text-sm">
                        {t("messageCount", { count: ticket.message_count })} • {t("updated")}{" "}
                        {new Date(ticket.updated_at).toLocaleDateString(intlLocale)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color} border border-current/30`}
                    >
                      {statusLabel}
                    </span>
                    <ArrowRight className="w-4 h-4 text-theme-muted" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}
