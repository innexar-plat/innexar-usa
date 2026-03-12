"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Package,
  Globe,
  Receipt,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Bell,
  ExternalLink,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import type { DashboardData } from "@/types/dashboard";

const FOCUS_RING =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950";

type DashboardCardsProps = {
  data: DashboardData | null;
  locale: string;
  payingId: number | null;
  labels: {
    plan: string;
    status: string;
    since: string;
    nextDue: string;
    noActivePlan: string;
    site: string;
    noSite: string;
    invoice: string;
    due: string;
    payInvoice: string;
    redirecting: string;
    noInvoice: string;
    panel: string;
    openPanel: string;
    support: string;
    openTickets: string;
    messages: string;
    unread: string;
    invoices: string;
    invoicesDesc: string;
    projects: string;
    projectsDesc: string;
    supportDesc: string;
    couponCode: string;
    couponPlaceholder: string;
  };
  onPayInvoice: (id: number, couponCode?: string) => void;
};

export function DashboardCards({
  data,
  locale,
  payingId,
  labels,
  onPayInvoice,
}: DashboardCardsProps) {
  const [couponCode, setCouponCode] = useState("");
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-6 shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-theme-secondary text-sm">{labels.plan}</span>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          {data?.plan ? (
            <>
              <p className="text-theme-primary font-medium">
                {data.plan.product_name} – {data.plan.price_plan_name}
              </p>
              <p className="text-theme-secondary text-sm mt-1">
                {labels.status}: {data.plan.status}
              </p>
              {data.plan.since && (
                <p className="text-theme-secondary text-xs mt-1">
                  {labels.since}: {new Date(data.plan.since).toLocaleDateString(locale)}
                </p>
              )}
              {data.plan.next_due_date && (
                <p className="text-theme-secondary text-xs mt-1">
                  {labels.nextDue}: {new Date(data.plan.next_due_date).toLocaleDateString(locale)}
                </p>
              )}
            </>
          ) : (
            <p className="text-theme-secondary text-sm">{labels.noActivePlan}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-6 shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-theme-secondary text-sm">{labels.site}</span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          {data?.site?.url || data?.site?.domain ? (
            <>
              <a
                href={
                  data.site!.url?.startsWith("http")
                    ? data.site.url!
                    : `https://${data.site.domain || data.site.url || ""}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                {data.site!.domain || data.site!.url?.replace(/^https?:\/\//, "") || data.site!.url}
                <ExternalLink className="w-3 h-3" />
              </a>
              <p className="text-theme-secondary text-sm mt-1">{data.site!.status}</p>
            </>
          ) : (
            <p className="text-theme-secondary text-sm">{labels.noSite}</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-6 shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-theme-secondary text-sm">{labels.invoice}</span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <Receipt className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          {data?.invoice ? (
            <>
              <p className="text-theme-primary font-medium">
                #{data.invoice.id} – {data.invoice.status}
              </p>
              <p className="text-theme-secondary text-sm mt-1">
                {data.invoice.currency} {data.invoice.total.toFixed(2)}
                {data.invoice.due_date &&
                  ` · ${labels.due} ${new Date(data.invoice.due_date).toLocaleDateString(locale)}`}
              </p>
              {data.can_pay_invoice && (
                <>
                  <div className="mt-3">
                    <label htmlFor="dashboard-coupon" className="sr-only">
                      {labels.couponCode}
                    </label>
                    <input
                      id="dashboard-coupon"
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder={labels.couponPlaceholder}
                      disabled={payingId !== null}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--page-bg)] px-3 py-2 text-sm text-theme-primary placeholder:text-theme-muted focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                      autoComplete="off"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => onPayInvoice(data.invoice!.id, couponCode.trim() || undefined)}
                    disabled={payingId !== null}
                    className="mt-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    <CreditCard className="w-4 h-4" />
                    {payingId === data.invoice?.id ? labels.redirecting : labels.payInvoice}
                  </button>
                </>
              )}
            </>
          ) : (
            <p className="text-theme-secondary text-sm">{labels.noInvoice}</p>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.panel && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-6 shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-2">
              <LayoutDashboard className="w-5 h-5 text-cyan-400" />
              <span className="text-theme-secondary text-sm">{labels.panel}</span>
            </div>
            <p className="text-theme-primary font-medium">{data.panel.login}</p>
            {data.panel.panel_url && (
              <a
                href={data.panel.panel_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm"
              >
                {labels.openPanel}
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            {data.panel.password_hint && (
              <p className="text-theme-muted text-xs mt-1">{data.panel.password_hint}</p>
            )}
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-6 shadow-md transition-all duration-200"
        >
          <Link href={`/${locale}/support`} className={`block rounded-2xl ${FOCUS_RING}`}>
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-5 h-5 text-green-400" />
              <ArrowRight className="w-4 h-4 text-theme-muted" />
            </div>
            <p className="text-theme-primary font-medium">{labels.support}</p>
            <p className="text-theme-secondary text-sm">
              {data?.support?.tickets_open_count ?? 0} {labels.openTickets}
            </p>
          </Link>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--border)] rounded-2xl p-6 shadow-md transition-all duration-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <span className="text-theme-secondary text-sm">{labels.messages}</span>
          </div>
          <p className="text-theme-primary font-medium">
            {data?.messages?.unread_count ?? 0} {labels.unread}
          </p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/${locale}/billing`} className={`rounded-2xl block ${FOCUS_RING}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="group bg-[var(--card-bg)] hover:shadow-lg backdrop-blur-xl border border-[var(--border)] rounded-2xl p-6 flex items-center gap-4 transition-all duration-200 cursor-pointer shadow-md hover:border-blue-500/30"
          >
            <Receipt className="w-10 h-10 text-blue-400" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-theme-primary mb-1">{labels.invoices}</h3>
              <p className="text-theme-secondary text-sm">{labels.invoicesDesc}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-theme-muted group-hover:text-theme-primary" />
          </motion.div>
        </Link>
        <Link href={`/${locale}/projects`} className={`rounded-2xl block ${FOCUS_RING}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="group bg-[var(--card-bg)] hover:shadow-lg backdrop-blur-xl border border-[var(--border)] rounded-2xl p-6 flex items-center gap-4 transition-all duration-200 cursor-pointer shadow-md hover:border-blue-500/30"
          >
            <FolderOpen className="w-10 h-10 text-cyan-400" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-theme-primary mb-1">{labels.projects}</h3>
              <p className="text-theme-secondary text-sm">{labels.projectsDesc}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-theme-muted group-hover:text-theme-primary" />
          </motion.div>
        </Link>
        <Link href={`/${locale}/support`} className={`rounded-2xl block ${FOCUS_RING}`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="group bg-[var(--card-bg)] hover:shadow-lg backdrop-blur-xl border border-[var(--border)] rounded-2xl p-6 flex items-center gap-4 transition-all duration-200 cursor-pointer shadow-md hover:border-blue-500/30"
          >
            <MessageSquare className="w-10 h-10 text-green-400" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-theme-primary mb-1">{labels.support}</h3>
              <p className="text-theme-secondary text-sm">{labels.supportDesc}</p>
            </div>
            <ArrowRight className="w-5 h-5 text-theme-muted group-hover:text-theme-primary" />
          </motion.div>
        </Link>
      </div>
    </>
  );
}
