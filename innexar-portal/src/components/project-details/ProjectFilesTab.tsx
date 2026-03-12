"use client";

import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { FileText, Upload, Loader2, Download, Trash2 } from "lucide-react";
import type { ProjectFileItem } from "@/types/project";
import { formatFileSize } from "@/lib/project-constants";
import { getIntlLocale } from "@/lib/intl-locale";

type ProjectFilesTabProps = {
  files: ProjectFileItem[];
  loading: boolean;
  uploading: boolean;
  fileError: string | null;
  isDragOver: boolean;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDownload: (fileId: number, filename: string) => void;
  onDeleteFile: (fileId: number) => void;
};

export function ProjectFilesTab({
  files,
  loading,
  uploading,
  fileError,
  isDragOver,
  onFileUpload,
  onDrop,
  onDragOver,
  onDragLeave,
  onDownload,
  onDeleteFile,
}: ProjectFilesTabProps) {
  const t = useTranslations("projectDetails.files");
  const tErrors = useTranslations("projectDetails");
  const locale = useLocale();
  const intlLocale = getIntlLocale(locale);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="card-base rounded-2xl p-6"
    >
      {uploading && (
        <div className="mb-4">
          <div className="h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
              initial={{ width: "0%" }}
              animate={{ width: ["0%", "70%", "100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          </div>
          <p className="text-theme-muted text-xs mt-1">{t("uploading")}</p>
        </div>
      )}
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`mb-4 rounded-xl border-2 border-dashed p-6 transition-colors ${
          isDragOver && !uploading
            ? "border-blue-500/50 bg-blue-500/10"
            : "border-[var(--border)] bg-[var(--border)]/20"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-theme-primary flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            {t("title")}
          </h2>
          <label className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-xl text-white cursor-pointer text-sm font-medium transition-all">
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {isDragOver && !uploading ? t("dropHere") : t("uploadFile")}
            <input type="file" className="hidden" onChange={onFileUpload} disabled={uploading} />
          </label>
        </div>
        {!uploading && <p className="text-theme-muted text-sm mt-2">{t("dragHint")}</p>}
      </div>
      {fileError && (
        <p className="text-red-400 text-sm mb-3">
          {fileError.startsWith("errors.") ? tErrors(fileError) : fileError}
        </p>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-theme-muted" />
        </div>
      ) : files.length === 0 ? (
        <div className="text-center py-8">
          <Upload className="w-12 h-12 text-theme-muted mx-auto mb-3" />
          <p className="text-theme-muted text-sm">{t("noFilesYet")}</p>
          <p className="text-theme-muted text-xs mt-1">{t("noFilesHint")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between gap-3 py-3 px-4 bg-[var(--border)]/30 rounded-xl"
            >
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="w-5 h-5 text-theme-muted flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-theme-primary truncate">{f.filename}</p>
                  <p className="text-xs text-theme-muted">
                    {formatFileSize(f.size)} •{" "}
                    {new Date(f.created_at).toLocaleDateString(intlLocale)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onDownload(f.id, f.filename)}
                  className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteFile(f.id)}
                  className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
