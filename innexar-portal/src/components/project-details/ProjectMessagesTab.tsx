"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { MessageSquare, Paperclip, Send, Loader2 } from "lucide-react";
import type { MessageItem } from "@/types/project";
import { getIntlLocale } from "@/lib/intl-locale";

type ProjectMessagesTabProps = {
  messages: MessageItem[];
  loading: boolean;
  msgText: string;
  onMsgTextChange: (v: string) => void;
  onSendMessage: () => void;
  onMessageAttachment: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sendingMsg: boolean;
  sendingAttachment: boolean;
  messageFileInputRef: React.RefObject<HTMLInputElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

export function ProjectMessagesTab({
  messages,
  loading,
  msgText,
  onMsgTextChange,
  onSendMessage,
  onMessageAttachment,
  sendingMsg,
  sendingAttachment,
  messageFileInputRef,
  messagesEndRef,
}: ProjectMessagesTabProps) {
  const t = useTranslations("projectDetails.messages");
  const locale = useLocale();
  const intlLocale = getIntlLocale(locale);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card-base rounded-2xl overflow-hidden"
    >
      <div className="p-4 border-b border-[var(--border)]">
        <h2 className="text-lg font-bold text-theme-primary flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-500" />
          {t("title")}
        </h2>
        <p className="text-theme-secondary text-sm mt-1">{t("subtitle")}</p>
      </div>
      <div className="h-96 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-theme-muted" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-theme-muted">
            <MessageSquare className="w-12 h-12 mb-3 opacity-30" />
            <p className="text-sm">{t("noMessages")}</p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender_type === "customer" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  m.sender_type === "customer"
                    ? "bg-blue-500/20 border border-blue-500/30"
                    : "bg-[var(--border)]/50 border border-[var(--border)]"
                }`}
              >
                <p className="text-xs text-theme-secondary mb-1 font-medium">
                  {m.sender_name || (m.sender_type === "customer" ? t("you") : t("team"))}
                </p>
                <p className="text-sm text-theme-primary whitespace-pre-wrap">{m.body}</p>
                {m.attachment_name && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-blue-500">
                    <Paperclip className="w-3 h-3" />
                    {m.attachment_name}
                  </div>
                )}
                <p className="text-xs text-theme-muted mt-1">
                  {new Date(m.created_at).toLocaleString(intlLocale)}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 border-t border-[var(--border)] flex gap-2 items-center">
        <input
          type="text"
          value={msgText}
          onChange={(e) => onMsgTextChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && onSendMessage()}
          placeholder={t("placeholder")}
          className="flex-1 px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary placeholder-theme-muted text-sm focus:outline-none focus:border-blue-500/50"
        />
        <input
          ref={messageFileInputRef}
          type="file"
          className="hidden"
          accept="*/*"
          onChange={onMessageAttachment}
          disabled={sendingAttachment}
        />
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => messageFileInputRef.current?.click()}
          disabled={sendingAttachment}
          className="p-3 bg-[var(--card-bg)] hover:opacity-80 border border-[var(--border)] rounded-xl text-theme-muted hover:text-theme-primary disabled:opacity-50 transition-colors"
          title={t("attachTitle")}
        >
          {sendingAttachment ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Paperclip className="w-5 h-5" />
          )}
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSendMessage}
          disabled={sendingMsg || !msgText.trim()}
          className="px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl text-white disabled:opacity-50 transition-colors"
        >
          {sendingMsg ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </motion.button>
      </div>
    </motion.div>
  );
}
