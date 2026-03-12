"use client";

import { MessageSquare, FileText, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type TabKey = "files" | "messages" | "modifications";

type TabItem = {
  key: TabKey;
  label: string;
  icon: LucideIcon;
  count: number;
};

type ProjectDetailsTabsProps = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  messagesCount: number;
  filesCount: number;
  modRequestsCount: number;
};

export function ProjectDetailsTabs({
  activeTab,
  onTabChange,
  messagesCount,
  filesCount,
  modRequestsCount,
}: ProjectDetailsTabsProps) {
  const tabs: TabItem[] = [
    { key: "messages", label: "Mensagens", icon: MessageSquare, count: messagesCount },
    { key: "files", label: "Arquivos", icon: FileText, count: filesCount },
    {
      key: "modifications",
      label: "Solicitações",
      icon: Wrench,
      count: modRequestsCount,
    },
  ];

  return (
    <div className="flex gap-1 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-1 shadow-[var(--card-shadow)]">
      {tabs.map((tab) => {
        const TabIcon = tab.icon;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === tab.key
                ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-theme-primary border border-blue-500/30 shadow-sm"
                : "text-theme-muted hover:text-theme-primary hover:bg-[var(--border)]/30"
            }`}
          >
            <TabIcon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-blue-500/30 text-blue-300 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
