"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Lock, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { getWorkspaceApiBase, useWorkspaceApi } from "@/lib/workspace-api";
import { API_PATHS } from "@/lib/api-paths";

export default function PortalResetPasswordPage() {
  const locale = useLocale();
  const t = useTranslations("auth.resetPassword");
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const isWorkspaceApi = useWorkspaceApi();

  const token = tokenFromUrl || "";

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      if (password !== confirmPassword) {
        setError(t("mismatch"));
        return;
      }
      if (password.length < 8) {
        setError(t("error"));
        return;
      }
      if (!token) {
        setError(t("error"));
        return;
      }
      setLoading(true);
      try {
        if (!isWorkspaceApi) {
          setError(t("error"));
          return;
        }
        const base = getWorkspaceApiBase();
        const res = await fetch(`${base}${API_PATHS.AUTH.RESET_PASSWORD}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, new_password: password }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok) {
          setSuccess(true);
        } else {
          setError(typeof data.detail === "string" ? data.detail : t("error"));
        }
      } catch {
        setError(t("error"));
      } finally {
        setLoading(false);
      }
    },
    [token, password, confirmPassword, isWorkspaceApi, t]
  );

  if (!token && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <p className="text-theme-secondary mb-4">{t("error")}</p>
          <Link href={`/${locale}/forgot-password`} className="text-blue-400 hover:text-blue-300">
            Solicitar novo link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
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
          <Link href={`/${locale}`} className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-7 h-7 text-theme-primary" />
            </div>
            <span className="text-3xl font-bold text-theme-primary">Innexar</span>
          </Link>
          <h1 className="text-2xl font-bold text-theme-primary mb-2">{t("title")}</h1>
          <p className="text-theme-secondary">{success ? t("success") : t("subtitle")}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          {success ? (
            <Link
              href={`/${locale}/login`}
              className="block w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold text-center"
            >
              Ir para o login
            </Link>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t("passwordLabel")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-theme-primary placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    placeholder={t("passwordPlaceholder")}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {t("confirmPasswordLabel")}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-theme-primary placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    placeholder={t("confirmPasswordPlaceholder")}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {t("submit")}
                  </>
                ) : (
                  t("submit")
                )}
              </button>
            </form>
          )}

          {!success && (
            <p className="text-center mt-6">
              <Link
                href={`/${locale}/forgot-password`}
                className="text-sm text-theme-secondary hover:text-theme-primary"
              >
                Solicitar novo link
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
