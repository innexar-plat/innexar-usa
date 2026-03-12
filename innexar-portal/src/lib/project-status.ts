import type { ElementType } from "react";
import { Clock, FileText, Palette, Eye, Rocket, CheckCircle2 } from "lucide-react";

export const PROJECT_STATUS_CONFIG: Record<
  string,
  { icon: ElementType; color: string; label: string }
> = {
  aguardando_briefing: { icon: Clock, color: "amber", label: "Aguardando Briefing" },
  briefing_recebido: { icon: FileText, color: "cyan", label: "Briefing Recebido" },
  em_producao: { icon: Palette, color: "purple", label: "Em Produção" },
  design: { icon: Palette, color: "purple", label: "Design" },
  desenvolvimento: { icon: Palette, color: "blue", label: "Desenvolvimento" },
  revisao: { icon: Eye, color: "cyan", label: "Revisão" },
  entrega: { icon: Rocket, color: "green", label: "Entrega" },
  ativo: { icon: CheckCircle2, color: "green", label: "Ativo" },
  entregue: { icon: Rocket, color: "green", label: "Entregue" },
  active: { icon: Palette, color: "blue", label: "Em Andamento" },
  requested: { icon: Clock, color: "blue", label: "Solicitação Enviada" },
  pending_payment: { icon: Clock, color: "yellow", label: "Aguardando Pagamento" },
  paid: { icon: CheckCircle2, color: "blue", label: "Pagamento Confirmado" },
  onboarding_pending: { icon: FileText, color: "orange", label: "Onboarding" },
  building: { icon: Palette, color: "purple", label: "Em Desenvolvimento" },
  review: { icon: Eye, color: "cyan", label: "Pronto para Revisão" },
  delivered: { icon: Rocket, color: "green", label: "Entregue" },
  lead: { icon: Clock, color: "blue", label: "Lead" },
  qualificacao: { icon: Clock, color: "blue", label: "Qualificação" },
  proposta: { icon: FileText, color: "orange", label: "Proposta" },
  aprovado: { icon: CheckCircle2, color: "blue", label: "Aprovado" },
  em_planejamento: { icon: FileText, color: "purple", label: "Em Planejamento" },
  planejamento_concluido: { icon: CheckCircle2, color: "purple", label: "Planejamento Concluído" },
  em_desenvolvimento: { icon: Palette, color: "purple", label: "Em Desenvolvimento" },
  em_revisao: { icon: Eye, color: "cyan", label: "Em Revisão" },
  concluido: { icon: Rocket, color: "green", label: "Concluído" },
  cancelado: { icon: Clock, color: "red", label: "Cancelado" },
};

const PROGRESS_MAP: Record<string, number> = {
  aguardando_briefing: 0,
  pending_payment: 0,
  requested: 0,
  briefing_recebido: 20,
  paid: 25,
  onboarding_pending: 25,
  em_producao: 40,
  design: 40,
  building: 50,
  active: 50,
  em_desenvolvimento: 50,
  desenvolvimento: 50,
  revisao: 80,
  review: 75,
  em_revisao: 80,
  entrega: 100,
  entregue: 100,
  delivered: 100,
  concluido: 100,
  ativo: 100,
};

export function getProgressFromStatus(status: string): number {
  return PROGRESS_MAP[status] ?? 0;
}

const COLOR_CLASSES: Record<
  string,
  { bg: string; border: string; text: string; gradient: string }
> = {
  yellow: {
    bg: "bg-yellow-500/20",
    border: "border-yellow-500/30",
    text: "text-yellow-400",
    gradient: "from-yellow-500 to-orange-500",
  },
  blue: {
    bg: "bg-blue-500/20",
    border: "border-blue-500/30",
    text: "text-blue-400",
    gradient: "from-blue-500 to-cyan-500",
  },
  orange: {
    bg: "bg-orange-500/20",
    border: "border-orange-500/30",
    text: "text-orange-400",
    gradient: "from-orange-500 to-red-500",
  },
  purple: {
    bg: "bg-purple-500/20",
    border: "border-purple-500/30",
    text: "text-purple-400",
    gradient: "from-purple-500 to-pink-500",
  },
  cyan: {
    bg: "bg-cyan-500/20",
    border: "border-cyan-500/30",
    text: "text-cyan-400",
    gradient: "from-cyan-500 to-blue-500",
  },
  green: {
    bg: "bg-green-500/20",
    border: "border-green-500/30",
    text: "text-green-400",
    gradient: "from-green-500 to-emerald-500",
  },
  red: {
    bg: "bg-red-500/20",
    border: "border-red-500/30",
    text: "text-red-400",
    gradient: "from-red-500 to-rose-500",
  },
};

export function getProjectColorClasses(color: string) {
  return COLOR_CLASSES[color] || COLOR_CLASSES.blue;
}
