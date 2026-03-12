"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldAlert, Loader2, CheckCircle2 } from "lucide-react";
import { getWorkspaceApiBase, getCustomerToken } from "@/lib/workspace-api";
import { API_PATHS } from "@/lib/api-paths";

export function ForcePasswordModal({
  isOpen,
  onSuccess,
}: {
  isOpen: boolean;
  onSuccess: () => void;
}) {
  const t = useTranslations("portal");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError(t("errorPasswordLength"));
      return;
    }
    setError("");
    setLoading(true);

    try {
      const token = getCustomerToken();
      const base = getWorkspaceApiBase();
      const res = await fetch(`${base}${API_PATHS.ME.SET_PASSWORD}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ new_password: password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || t("errorGeneric"));
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t("errorGeneric");
      setError(message);
    } finally {
      if (!success) setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative"
        >
          {/* Decorative Top Glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-cyan-500" />

          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 flex items-center justify-center ring-1 ring-white/10 shadow-inner">
                {success ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                ) : (
                  <ShieldAlert className="w-8 h-8 text-blue-400" />
                )}
              </div>
            </div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">{t("welcomeSetup")}</h2>
              <p className="text-slate-400 text-sm">{t("setupPasswordPrompt")}</p>
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center"
              >
                <p className="text-emerald-400 font-medium">{t("passwordSaved")}</p>
                <p className="text-emerald-400/80 text-sm mt-1">{t("redirecting")}...</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                    {error}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-300">{t("newPassword")}</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-500" />
                    </div>
                    <input
                      type="password"
                      autoFocus
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-xl border-0 py-3 pl-10 pr-4 bg-slate-950/50 text-white ring-1 ring-inset ring-slate-800 placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-500 text-sm sm:leading-6 transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <p className="text-xs text-slate-500 pl-1">{t("min6chars")}</p>
                </div>

                <button
                  type="submit"
                  disabled={loading || password.length < 6}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : t("saveAndContinue")}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
