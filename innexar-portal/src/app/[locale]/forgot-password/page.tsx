"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Mail, ArrowRight, Sparkles, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { getWorkspaceApiBase, useWorkspaceApi } from "@/lib/workspace-api";
import { API_PATHS } from "@/lib/api-paths";

export default function PortalForgotPasswordPage() {
  const locale = useLocale();
  const t = useTranslations("auth.forgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const isWorkspaceApi = useWorkspaceApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (!isWorkspaceApi) {
        setError(t("error"));
        return;
      }
      const base = getWorkspaceApiBase();
      const res = await fetch(`${base}${API_PATHS.AUTH.FORGOT_PASSWORD}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      await res.json().catch(() => ({}));
      if (res.ok) {
        setSent(true);
      } else {
        setError(t("error"));
      }
    } catch {
      setError(t("error"));
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-theme-secondary">{sent ? t("success") : t("subtitle")}</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          {sent ? (
            <div className="space-y-6">
              <div className="flex justify-center">
                <CheckCircle className="w-16 h-16 text-green-400" />
              </div>
              <p className="text-center text-slate-300 text-sm">
                Verifique sua caixa de entrada e o spam. O link é válido por 24 horas.
              </p>
              <Link
                href={`/${locale}/login`}
                className="block w-full py-3 rounded-xl text-center text-white font-medium bg-blue-500 hover:bg-blue-600 transition-colors"
              >
                {t("backToLogin")}
              </Link>
            </div>
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
                  {t("emailLabel")}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-theme-muted" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-theme-primary placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    placeholder={t("emailPlaceholder")}
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
                  <>
                    {t("submit")}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}

          {!sent && (
            <p className="text-center mt-6">
              <Link
                href={`/${locale}/login`}
                className="text-sm text-theme-secondary hover:text-theme-primary"
              >
                {t("backToLogin")}
              </Link>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
