"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Download, Calendar, CheckCircle2, Clock } from "lucide-react";
import { workspaceFetch, getCustomerToken } from "@/lib/workspace-api";
import { API_PATHS } from "@/lib/api-paths";
import { getIntlLocale } from "@/lib/intl-locale";
import type { Invoice, StatusFilter } from "@/types/billing";

type StatusConfig = { icon: React.ElementType; color: string; label: string; bg: string };

function useStatusConfig(): (status: string) => StatusConfig {
  const t = useTranslations("billingPage");
  return useCallback(
    (status: string): StatusConfig => {
      const configs: Record<string, StatusConfig> = {
        paid: {
          icon: CheckCircle2,
          color: "text-green-400",
          label: t("paid"),
          bg: "bg-green-500/20",
        },
        pending: {
          icon: Clock,
          color: "text-yellow-400",
          label: t("pending"),
          bg: "bg-yellow-500/20",
        },
        requested: {
          icon: Clock,
          color: "text-blue-400",
          label: t("requested"),
          bg: "bg-blue-500/20",
        },
        overdue: {
          icon: Clock,
          color: "text-red-400",
          label: t("overdue"),
          bg: "bg-red-500/20",
        },
      };
      return configs[status] || configs.pending;
    },
    [t]
  );
}

type BillingInvoiceTableProps = {
  invoices: Invoice[];
  statusFilter: StatusFilter;
  setStatusFilter: (f: StatusFilter) => void;
  locale: string;
  isWorkspaceApi: boolean;
  onPay: (invoice: Invoice) => void;
  onDownload: (invoice: Invoice) => Promise<void>;
  mpPublicKey: string;
};

export function BillingInvoiceTable({
  invoices,
  statusFilter,
  setStatusFilter,
  locale,
  isWorkspaceApi,
  onPay,
  onDownload,
  mpPublicKey,
}: BillingInvoiceTableProps) {
  const t = useTranslations("billingPage");
  const getStatus = useStatusConfig();
  const intlLocale = getIntlLocale(locale);
  const filterOptions: { value: StatusFilter; label: string }[] = [
    { value: "all", label: t("all") },
    { value: "pending", label: t("pendingPlural") },
    { value: "paid", label: t("paidPlural") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl overflow-hidden shadow-md transition-all duration-200"
    >
      <div className="p-6 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-theme-primary">{t("invoiceHistory")}</h2>
        <div className="flex rounded-xl bg-[var(--card-bg)] border border-[var(--border)] p-1">
          {filterOptions.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setStatusFilter(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === value ? "bg-blue-500/20 text-blue-400" : "text-theme-secondary hover:text-theme-primary"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left px-6 py-4 text-theme-secondary font-medium text-sm">
                {t("invoice")}
              </th>
              <th className="text-left px-6 py-4 text-theme-secondary font-medium text-sm">
                {t("project")}
              </th>
              <th className="text-left px-6 py-4 text-theme-secondary font-medium text-sm">
                {t("date")}
              </th>
              <th className="text-left px-6 py-4 text-theme-secondary font-medium text-sm">
                {t("amount")}
              </th>
              <th className="text-left px-6 py-4 text-theme-secondary font-medium text-sm">
                {t("status")}
              </th>
              <th className="text-right px-6 py-4 text-theme-secondary font-medium text-sm">
                {t("actions")}
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-theme-secondary">
                  {t("noInvoicesFilter")}
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => {
                const status = getStatus(invoice.status);
                const Icon = status.icon;
                return (
                  <tr
                    key={invoice.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--card-bg)] transition-colors duration-200"
                  >
                    <td className="px-6 py-4">
                      <span className="text-theme-primary font-medium">
                        INV-{invoice.id.toString().padStart(4, "0")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-theme-primary">{invoice.project_name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-theme-secondary text-sm flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(invoice.date).toLocaleDateString(intlLocale)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-theme-primary font-medium">
                        R$ {invoice.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}
                      >
                        <Icon className="w-3 h-3" />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {invoice.isErp && invoice.status !== "paid" && mpPublicKey && (
                          <button
                            type="button"
                            onClick={() => onPay(invoice)}
                            className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 disabled:opacity-50"
                          >
                            {t("pay")}
                          </button>
                        )}
                        {invoice.isErp && invoice.status !== "paid" && !mpPublicKey && (
                          <span
                            className="text-theme-secondary text-sm"
                            title={t("paymentNotConfigured")}
                          >
                            {t("paymentNotConfigured")}
                          </span>
                        )}
                        {isWorkspaceApi && (
                          <button
                            type="button"
                            onClick={() => onDownload(invoice)}
                            className="p-2 bg-[var(--border)]/30 hover:bg-[var(--border)]/50 rounded-lg transition-colors"
                            title={t("downloadPrintInvoice")}
                          >
                            <Download className="w-4 h-4 text-theme-muted" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
