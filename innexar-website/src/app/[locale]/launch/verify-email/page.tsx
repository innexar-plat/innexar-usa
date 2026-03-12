"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link, useRouter } from "@/i18n/navigation";
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const t = useTranslations("auth.verifyEmail");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (token) {
      handleVerify(token);
    }
  }, [token]);

  const handleVerify = async (token: string) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/launch/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Verification failed");
      }

      setVerified(true);
    } catch (err: any) {
      setError(err.message || "Failed to verify email");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setResending(true);
    setError("");
    setSuccess(false);

    try {
      const response = await fetch("/api/launch/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to resend");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/30 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="flex justify-center">
          <Link href="/" className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Innexar
          </Link>
        </div>

        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          {verified ? t("verified.title") : t("title")}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400 px-4">
          {verified ? t("verified.subtitle") : t("subtitle")}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl py-8 px-4 shadow-2xl border border-slate-800 sm:rounded-2xl sm:px-10">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/50 flex items-center gap-3 text-red-400 text-sm"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{typeof error === 'string' ? error : 'An error occurred'}</p>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/50 flex items-center gap-3 text-green-400 text-sm"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p>{t("success")}</p>
            </motion.div>
          )}

          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center border border-blue-500/30">
              {loading ? (
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              ) : verified ? (
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              ) : (
                <Mail className="w-8 h-8 text-blue-400" />
              )}
            </div>

            {verified ? (
              <div className="w-full space-y-4">
                <div className="text-center">
                  <p className="text-green-400 text-sm mb-4">
                    Email verificado com sucesso! Redirecionando para login...
                  </p>
                </div>
                <Link
                  href="/launch/login"
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all items-center gap-2"
                >
                  {t("verified.cta")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <div className="text-center w-full">
                <p className="text-sm text-slate-400 mb-6">
                  {t("resend")}
                </p>
                <button
                  onClick={handleResend}
                  disabled={resending || !email}
                  className="w-full flex justify-center py-2.5 px-4 border border-slate-700 rounded-lg shadow-sm text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-50 transition-all items-center gap-2"
                >
                  {resending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    t("resendButton")
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
