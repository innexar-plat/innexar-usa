"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { motion } from "framer-motion";
import {
  Lock,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Sparkles,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  useWorkspaceApi,
  workspaceFetch,
  parseWorkspaceError,
} from "@/lib/workspace-api";
import { WORKSPACE_API_PATHS } from "@/lib/workspace-api-paths";

export default function WorkspaceResetPasswordPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const isWorkspaceApi = useWorkspaceApi();
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = searchParams.get("token") ?? "";
    setToken(t);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim() || newPassword.length < 6) {
      setError("Token e nova senha (mín. 6 caracteres) são obrigatórios.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await workspaceFetch(
        WORKSPACE_API_PATHS.AUTH.STAFF_RESET_PASSWORD,
        {
          method: "POST",
          body: JSON.stringify({
            token: token.trim(),
            new_password: newPassword,
          }),
        }
      );
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(
          parseWorkspaceError(data) || "Token inválido ou expirado."
        );
      }
    } catch {
      setError("Erro de conexão. Verifique a URL da API.");
    } finally {
      setLoading(false);
    }
  };

  if (!isWorkspaceApi) return null;

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
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Nova senha</h1>
          <p className="text-slate-400">
            Defina uma nova senha para o painel
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          {success ? (
            <div className="space-y-4 text-center">
              <p className="text-slate-300">
                Senha atualizada. Faça login com a nova senha.
              </p>
              <Link
                href={`/${locale}/login`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-white font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Ir para o login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nova senha (mín. 6 caracteres)
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="new_password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !token.trim()}
                className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Redefinir senha"
                )}
              </button>
              <Link
                href={`/${locale}/login`}
                className="flex items-center justify-center gap-2 text-slate-400 hover:text-white text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar ao login
              </Link>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
