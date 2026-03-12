"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useTheme } from "@/contexts/theme-context";
import { useLogin } from "@/hooks/use-login";
import { LoginForm } from "@/components/auth/LoginForm";
import { ThemeToggle } from "@/components/header/ThemeToggle";
import { LocaleSwitcher } from "@/components/header/LocaleSwitcher";

const SUPPORT_EMAIL = "support@innexar.app";

function LoginContent() {
  const { theme } = useTheme();
  const {
    checkingSession,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    loading,
    handleSubmit,
    t,
    locale,
  } = useLogin();

  if (checkingSession) {
    return (
      <div
        className="min-h-screen flex items-center justify-center transition-colors duration-200"
        style={{ background: "var(--page-bg)" }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
          style={{ color: "var(--text-secondary)" }}
        >
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent)" }} />
          <p>{t("checkingSession")}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 transition-colors duration-200"
      style={{ background: "var(--page-bg)" }}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <ThemeToggle />
        <LocaleSwitcher />
      </div>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center justify-center mb-6">
            <Image
              src="/logo-header-white.png"
              alt="Innexar"
              width={320}
              height={80}
              className={`h-16 w-auto sm:h-20 md:h-24 ${theme === "light" ? "invert" : ""}`}
            />
          </Link>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--text-primary)" }}>
            {t("title")}
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>{t("subtitle")}</p>
        </div>
        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          error={error}
          loading={loading}
          onSubmit={handleSubmit}
          t={t}
          locale={locale}
        />
        <p className="text-center text-sm mt-8" style={{ color: "var(--text-muted)" }}>
          {t("needHelp")}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            {SUPPORT_EMAIL}
          </a>
        </p>
      </motion.div>
    </div>
  );
}

export default function PortalLogin() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: "var(--page-bg)" }}
        >
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent)" }} />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
