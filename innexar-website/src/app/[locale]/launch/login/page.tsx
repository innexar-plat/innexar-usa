"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Link, useRouter } from "@/i18n/navigation";
import { Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
    const t = useTranslations("auth.login");
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [needsVerification, setNeedsVerification] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/launch/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Mesmo que email não esteja verificado, login deve funcionar.
                // Backend não bloqueia mais por verificação, então tratamos todo erro como genérico.
                throw new Error(data.detail || data.message || t("error.invalid"));
            }

            // Success - store the token and email
            localStorage.setItem("customer_token", data.access_token);
            localStorage.setItem("customer_email", email);
            localStorage.setItem("customer_id", data.customer_id);

            // Redirect customer to client portal dashboard (locale-aware)
            router.push("/portal");
        } catch (err: any) {
            setError(err.message || t("error.generic"));
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
                <p className="mt-2 text-center text-sm text-slate-400">
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
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm"
                        >
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="mb-2">{typeof error === 'string' ? error : 'An error occurred'}</p>
                                </div>
                            </div>
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
                            <div className="flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                                    {t("passwordLabel")}
                                </label>
                                <div className="text-sm">
                                    <Link href="/launch/forgot-password" className="font-medium text-blue-400 hover:text-blue-300">
                                        {t("forgotPassword")}
                                    </Link>
                                </div>
                            </div>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-slate-800/50 text-white sm:text-sm transition-all"
                                    placeholder={t("passwordPlaceholder")}
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

                    <div className="mt-8 pt-6 border-t border-slate-800">
                        <p className="text-center text-sm text-slate-400">
                            {t("noAccount")}{" "}
                            <Link href="/onboarding" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">
                                {t("getStarted")}
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
