"use client";

import { motion } from "framer-motion";
import { Upload, File } from "lucide-react";
import type { ProjectAguardando, ProjectFileItem } from "@/types/site-briefing";

const inputClass =
  "w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-cyan-500/50";

type SiteBriefingStep3Props = {
  fullDescription: string;
  setFullDescription: (v: string) => void;
  projectLoading: boolean;
  projectAguardando: ProjectAguardando | null;
  files: ProjectFileItem[];
  filesLoading: boolean;
  uploading: boolean;
  fileError: string;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  briefingFiles: File[];
  setBriefingFiles: (f: File[] | ((prev: File[]) => File[])) => void;
  isWorkspaceApi: boolean;
  labels: {
    fullDescription: string;
    fullDescriptionPlaceholder: string;
    descriptionHelp: string;
    projectFiles: string;
    projectFilesHint: string;
    selectFiles: string;
    uploading: string;
    filesCount: string;
    noProjectYet: string;
    briefingAttach: string;
    briefingAttachHint: string;
    briefingFilesCount: string;
    briefingSelectFiles: string;
    remove: string;
  };
};

export function SiteBriefingStep3({
  fullDescription,
  setFullDescription,
  projectLoading,
  projectAguardando,
  files,
  filesLoading,
  uploading,
  fileError,
  onFileUpload,
  briefingFiles,
  setBriefingFiles,
  isWorkspaceApi,
  labels,
}: SiteBriefingStep3Props) {
  return (
    <motion.div
      key="step-2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {labels.fullDescription}
        </label>
        <textarea
          value={fullDescription}
          onChange={(e) => setFullDescription(e.target.value)}
          rows={6}
          className={`${inputClass} resize-none`}
          placeholder={labels.fullDescriptionPlaceholder}
        />
        <p className="text-xs text-slate-500 mt-1">{labels.descriptionHelp}</p>
      </div>

      {!projectLoading && projectAguardando && (
        <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border)] p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            {labels.projectFiles}
          </h3>
          <p className="text-slate-400 text-xs">{labels.projectFilesHint}</p>
          {fileError && <p className="text-red-400 text-sm">{fileError}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 cursor-pointer hover:bg-cyan-500/30 text-sm">
              <Upload className="w-4 h-4" />
              {uploading ? labels.uploading : labels.selectFiles}
              <input
                type="file"
                multiple
                className="sr-only"
                disabled={uploading}
                onChange={onFileUpload}
              />
            </label>
            {filesLoading && (
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          {files.length > 0 && (
            <div>
              <p className="text-slate-400 text-xs mb-2">{labels.filesCount}</p>
              <ul className="space-y-1 text-sm text-slate-300">
                {files.map((f) => (
                  <li key={f.id} className="flex items-center gap-2">
                    <File className="w-4 h-4 text-cyan-400" />
                    {f.filename}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!projectLoading && !projectAguardando && isWorkspaceApi && (
        <p className="text-slate-500 text-sm">{labels.noProjectYet}</p>
      )}

      <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border)] p-4 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <File className="w-4 h-4 text-amber-400" />
          {labels.briefingAttach}
        </h3>
        <p className="text-slate-400 text-xs">{labels.briefingAttachHint}</p>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-400/30 cursor-pointer hover:bg-amber-500/30 text-sm">
          <Upload className="w-4 h-4" />
          {briefingFiles.length > 0 ? labels.briefingFilesCount : labels.briefingSelectFiles}
          <input
            type="file"
            multiple
            className="sr-only"
            onChange={(e) => setBriefingFiles(Array.from(e.target.files ?? []))}
          />
        </label>
        {briefingFiles.length > 0 && (
          <ul className="space-y-1 text-sm text-slate-300">
            {briefingFiles.map((f, i) => (
              <li key={i} className="flex items-center justify-between gap-2">
                <span className="truncate">{f.name}</span>
                <button
                  type="button"
                  onClick={() => setBriefingFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="text-slate-500 hover:text-red-400 text-xs"
                >
                  {labels.remove}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}
