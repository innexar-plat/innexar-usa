"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";

type NewProjectSuccessProps = { locale: string };

export function NewProjectSuccess({ locale }: NewProjectSuccessProps) {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto card-base rounded-2xl p-12 text-center"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-400" />
      </div>
      <h2 className="text-2xl font-bold text-theme-primary mb-2">Solicitação Enviada!</h2>
      <p className="text-theme-secondary mb-6">
        Analisaremos sua solicitação de projeto e entraremos em contato em até 24 horas.
      </p>
      <motion.button
        onClick={() => router.push(`/${locale}`)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white font-medium"
      >
        Voltar ao Painel
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
