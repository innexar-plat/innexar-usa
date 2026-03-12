"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://innexar.com.br";

type LoginFormProps = {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string) => string;
  locale: string;
};

export function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  error,
  loading,
  onSubmit,
  t,
  locale,
}: LoginFormProps) {
  return (
    <div
      className="backdrop-blur-xl rounded-3xl p-6 sm:p-8 border transition-colors duration-200"
      style={{ background: "var(--card-bg)", borderColor: "var(--border)" }}
    >
      <form onSubmit={onSubmit} className="space-y-6">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </motion.div>
        )}
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("emailLabel")}
          </label>
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              style={{
                background: "var(--page-bg)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              placeholder={t("emailPlaceholder")}
            />
          </div>
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {t("passwordLabel")}
          </label>
          <div className="relative">
            <Lock
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              style={{
                background: "var(--page-bg)",
                borderColor: "var(--border)",
                color: "var(--text-primary)",
              }}
              placeholder={t("passwordPlaceholder")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors hover:opacity-80"
              style={{ color: "var(--text-muted)" }}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="text-right">
          <Link
            href={`/${locale}/forgot-password`}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {t("forgotPassword")}
          </Link>
        </div>
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
          className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("submit")}
            </>
          ) : (
            <>
              {t("submit")}
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </motion.button>
      </form>
      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" style={{ borderColor: "var(--border)" }} />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-transparent" style={{ color: "var(--text-muted)" }}>
            {t("noAccount")}
          </span>
        </div>
      </div>
      <a
        href={SITE_URL}
        className="block w-full py-3 border rounded-xl text-center font-medium transition-all hover:opacity-90"
        style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
      >
        {t("getStarted")}
      </a>
    </div>
  );
}
