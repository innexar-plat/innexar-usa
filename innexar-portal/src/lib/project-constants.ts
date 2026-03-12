import type { LucideIcon } from "lucide-react";
import { Clock, FileText, Palette, Eye, Rocket, CheckCircle2, XCircle, Wrench } from "lucide-react";

export type StatusConfigItem = {
  icon: LucideIcon;
  color: string;
  label: string;
};

export const PROJECT_STATUS_CONFIG: Record<string, StatusConfigItem> = {
  aguardando_briefing: { icon: Clock, color: "amber", label: "Aguardando briefing" },
  briefing_recebido: { icon: FileText, color: "cyan", label: "Briefing recebido" },
  em_producao: { icon: Palette, color: "purple", label: "Em produção" },
  design: { icon: Palette, color: "purple", label: "Design" },
  desenvolvimento: { icon: Palette, color: "blue", label: "Desenvolvimento" },
  revisao: { icon: Eye, color: "cyan", label: "Revisão" },
  entrega: { icon: Rocket, color: "green", label: "Entrega" },
  concluido: { icon: CheckCircle2, color: "green", label: "Concluído" },
  ativo: { icon: CheckCircle2, color: "green", label: "Ativo" },
  entregue: { icon: Rocket, color: "green", label: "Entregue" },
  cancelado: { icon: XCircle, color: "red", label: "Cancelado" },
  active: { icon: Palette, color: "blue", label: "Em andamento" },
  building: { icon: Palette, color: "purple", label: "Em desenvolvimento" },
  review: { icon: Eye, color: "cyan", label: "Em revisão" },
  delivered: { icon: Rocket, color: "green", label: "Entregue" },
  completed: { icon: CheckCircle2, color: "green", label: "Concluído" },
};

export const MOD_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendente", color: "amber" },
  approved: { label: "Aprovada", color: "blue" },
  in_progress: { label: "Em andamento", color: "purple" },
  completed: { label: "Concluída", color: "green" },
  rejected: { label: "Rejeitada", color: "red" },
};

export const STATUS_COLOR_CLASSES: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400" },
  purple: { bg: "bg-purple-500/20", border: "border-purple-500/30", text: "text-purple-400" },
  cyan: { bg: "bg-cyan-500/20", border: "border-cyan-500/30", text: "text-cyan-400" },
  green: { bg: "bg-green-500/20", border: "border-green-500/30", text: "text-green-400" },
  amber: { bg: "bg-amber-500/20", border: "border-amber-500/30", text: "text-amber-400" },
  red: { bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-400" },
};

export function getStatusColorClasses(color: string): {
  bg: string;
  border: string;
  text: string;
} {
  return STATUS_COLOR_CLASSES[color] ?? STATUS_COLOR_CLASSES.blue;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
