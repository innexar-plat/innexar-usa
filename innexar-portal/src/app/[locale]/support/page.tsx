"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useSupport } from "@/hooks/use-support";
import { SupportTicketForm } from "@/components/support/SupportTicketForm";
import { SupportTicketList } from "@/components/support/SupportTicketList";
import { SupportEmptyState } from "@/components/support/SupportEmptyState";
import { SupportQuickContact } from "@/components/support/SupportQuickContact";

export default function SupportPage() {
  const locale = useLocale();
  const t = useTranslations("supportPage");
  const searchParams = useSearchParams();
  const {
    tickets,
    loading,
    showForm,
    setShowForm,
    subject,
    setSubject,
    message,
    setMessage,
    error,
    handleSubmit,
    submitting,
  } = useSupport(searchParams);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-theme-primary mb-2">{t("title")}</h1>
          <p className="text-theme-secondary">{t("subtitle")}</p>
        </div>
        <motion.button
          onClick={() => setShowForm(!showForm)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium shadow-lg shadow-blue-500/25"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? t("cancel") : t("newTicket")}
        </motion.button>
      </div>

      <AnimatePresence>
        {showForm && (
          <SupportTicketForm
            key="support-form"
            subject={subject}
            setSubject={setSubject}
            message={message}
            setMessage={setMessage}
            error={error}
            submitting={submitting}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {tickets.length > 0 ? (
        <SupportTicketList tickets={tickets} locale={locale} />
      ) : (
        <SupportEmptyState onNewTicket={() => setShowForm(true)} />
      )}

      <SupportQuickContact />
    </div>
  );
}
