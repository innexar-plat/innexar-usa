"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    const t = useTranslations("auth.forgotPassword");

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/launch/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error(t("error"));
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || "Failed to send reset link");
        } finally {
            setLoading(false);
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
                    {t("title")}
                </h2>
                <p className="mt-2 text-center text-sm text-slate-400 px-4">
                    {t("subtitle")}
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10"
            >
                <div className="bg-slate-900/50 backdrop-blur-xl py-8 px-4 shadow-2xl border border-slate-800 sm:rounded-2xl sm:px-10">
                    {success ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-4"
                        >
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-500/10 border border-green-500/50 mb-4">
                                <CheckCircle2 className="h-6 w-6 text-green-400" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-2">{t("success")}</h3>
                            <div className="mt-6">
                                <Link
                                    href="/launch/login"
                                    className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    {t("backToLogin")}
                                </Link>
                            </div>
                        </motion.div>
                    ) : (
                        <>
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

                            <form className="space-y-6" onSubmit={handleSubmit}>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                                        {t("emailLabel")}
                                    </label>
                                    <div className="mt-1 relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                            <Mail className="h-5 w-5" />
                                        </div>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            autoComplete="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="appearance-none block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-slate-800/50 text-white sm:text-sm transition-all"
                                            placeholder={t("emailPlaceholder")}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all items-center gap-2 group"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                {t("submit")}
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>

                            <div className="mt-8 pt-6 border-t border-slate-800 text-center">
                                <Link
                                    href="/launch/login"
                                    className="font-medium text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    {t("backToLogin")}
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
