"use client";

import { motion } from "framer-motion";
import { Upload, File } from "lucide-react";
import type { ProjectAguardando, ProjectFileItem } from "@/types/site-briefing";

const inputClass =
  "w-full px-4 py-3 bg-[var(--card-bg)] border border-[var(--border)] rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-cyan-500/50";

type SiteBriefingStep2Props = {
  domain: string;
  setDomain: (v: string) => void;
  colors: string;
  setColors: (v: string) => void;
  primaryColor: string;
  setPrimaryColor: (v: string) => void;
  secondaryColor: string;
  setSecondaryColor: (v: string) => void;
  photos: string;
  setPhotos: (v: string) => void;
  projectLoading: boolean;
  projectAguardando: ProjectAguardando | null;
  files: ProjectFileItem[];
  filesLoading: boolean;
  uploading: boolean;
  fileError: string;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  labels: {
    logoUpload: string;
    logoUploadHint: string;
    uploadLogo: string;
    uploading: string;
    brandColors: string;
    primary: string;
    secondary: string;
    placeholdersColors: string;
    colorsHelp: string;
    domain: string;
    placeholdersDomain: string;
    domainHelp: string;
    photos: string;
    placeholdersPhotos: string;
  };
};

export function SiteBriefingStep2({
  domain,
  setDomain,
  colors,
  setColors,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  photos,
  setPhotos,
  projectLoading,
  projectAguardando,
  files,
  filesLoading,
  uploading,
  fileError,
  onFileUpload,
  labels,
}: SiteBriefingStep2Props) {
  return (
    <motion.div
      key="step-1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-5"
    >
      {!projectLoading && projectAguardando && (
        <div className="rounded-xl bg-[var(--card-bg)] border border-[var(--border)] p-4 space-y-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            {labels.logoUpload}
          </h3>
          <p className="text-slate-400 text-xs">{labels.logoUploadHint}</p>
          {fileError && <p className="text-red-400 text-sm">{fileError}</p>}
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-400/30 cursor-pointer hover:bg-cyan-500/30 text-sm">
              <Upload className="w-4 h-4" />
              {uploading ? labels.uploading : labels.uploadLogo}
              <input
                type="file"
                accept="image/*"
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
            <ul className="space-y-1 text-sm text-slate-300">
              {files.map((f) => (
                <li key={f.id} className="flex items-center gap-2">
                  <File className="w-4 h-4 text-cyan-400" />
                  {f.filename}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {labels.brandColors}
        </label>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">{labels.primary}</label>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-white/20 bg-transparent cursor-pointer"
            />
            <span className="text-xs text-slate-500 font-mono">{primaryColor}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-400">{labels.secondary}</label>
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              className="w-10 h-10 rounded-lg border border-white/20 bg-transparent cursor-pointer"
            />
            <span className="text-xs text-slate-500 font-mono">{secondaryColor}</span>
          </div>
        </div>
        <input
          type="text"
          value={colors}
          onChange={(e) => setColors(e.target.value)}
          className={inputClass}
          placeholder={labels.placeholdersColors}
        />
        <p className="text-xs text-slate-500 mt-1">{labels.colorsHelp}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{labels.domain}</label>
        <input
          type="text"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          className={inputClass}
          placeholder={labels.placeholdersDomain}
        />
        <p className="text-xs text-slate-500 mt-1">{labels.domainHelp}</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{labels.photos}</label>
        <textarea
          value={photos}
          onChange={(e) => setPhotos(e.target.value)}
          rows={2}
          className={`${inputClass} resize-none`}
          placeholder={labels.placeholdersPhotos}
        />
      </div>
    </motion.div>
  );
}
