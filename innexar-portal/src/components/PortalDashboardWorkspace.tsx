"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useDashboardWorkspace } from "@/hooks/use-dashboard-workspace";
import { ForcePasswordModal } from "./ForcePasswordModal";
import { DashboardBriefingCta } from "./dashboard/DashboardBriefingCta";
import { DashboardProjectsList } from "./dashboard/DashboardProjectsList";
import { DashboardWelcome } from "./dashboard/DashboardWelcome";
import { DashboardCards } from "./dashboard/DashboardCards";

export default function PortalDashboardWorkspace() {
  const locale = useLocale();
  const t = useTranslations("dashboardWorkspace");
  const searchParams = useSearchParams();
  const checkoutSuccess = searchParams.get("checkout") === "success";

  const {
    data,
    loading,
    customerName,
    payingId,
    showPasswordModal,
    setShowPasswordModal,
    handlePayInvoice,
  } = useDashboardWorkspace(locale);

  if (loading) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-4 h-64"
        aria-busy="true"
        aria-live="polite"
      >
        <div
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
        <span className="sr-only">{t("loadingDashboard")}</span>
      </div>
    );
  }

  const aguardando = (data?.projects_aguardando_briefing ?? []).filter(
    (p) => p.status === "aguardando_briefing"
  );
  const briefingCtaTitle = checkoutSuccess
    ? t("paymentConfirmed")
    : aguardando.length > 0
      ? t("projectsAwaiting", { count: aguardando.length })
      : t("nextStep");

  return (
    <div className="space-y-8">
      <ForcePasswordModal
        isOpen={showPasswordModal}
        onSuccess={() => {
          setShowPasswordModal(false);
          window.location.reload();
        }}
      />

      <DashboardBriefingCta
        locale={locale}
        checkoutSuccess={checkoutSuccess}
        projectsAwaiting={aguardando}
        title={briefingCtaTitle}
        briefingPromptLabel={t("briefingPrompt")}
        fillSiteDetailsLabel={t("fillSiteDetails")}
        uploadFilesLabel={t("uploadFiles")}
      />

      {(data?.projects?.length ?? 0) > 0 && (
        <DashboardProjectsList
          locale={locale}
          projects={data!.projects!}
          title={t("yourProjects")}
          filesLabel={t("files")}
        />
      )}

      <DashboardWelcome
        customerName={customerName}
        welcomeLabel={t("welcome")}
        summaryActiveLabel={t("summaryActive")}
        summaryInactiveLabel={t("summaryInactive")}
        hasPlanOrSite={!!(data?.plan || data?.site?.url)}
      />

      <DashboardCards
        data={data}
        locale={locale}
        payingId={payingId}
        onPayInvoice={handlePayInvoice}
        labels={{
          plan: t("plan"),
          status: t("status"),
          since: t("since"),
          nextDue: t("nextDue"),
          noActivePlan: t("noActivePlan"),
          site: t("site"),
          noSite: t("noSite"),
          invoice: t("invoice"),
          due: t("due"),
          payInvoice: t("payInvoice"),
          redirecting: t("redirecting"),
          noInvoice: t("noInvoice"),
          panel: t("panel"),
          openPanel: t("openPanel"),
          support: t("support"),
          openTickets: t("openTickets"),
          messages: t("messages"),
          unread: t("unread"),
          invoices: t("invoices"),
          invoicesDesc: t("invoicesDesc"),
          projects: t("projects"),
          projectsDesc: t("projectsDesc"),
          supportDesc: t("supportDesc"),
          couponCode: t("couponCode"),
          couponPlaceholder: t("couponPlaceholder"),
        }}
      />
    </div>
  );
}
