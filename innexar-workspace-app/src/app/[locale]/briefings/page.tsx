'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, FileText, FolderOpen, Download, ExternalLink } from 'lucide-react';
import { workspaceFetch, getStaffToken } from '@/lib/workspace-api';

interface BriefingItem {
  id: number;
  customer_id: number;
  customer_name: string;
  project_id?: number | null;
  project_name: string;
  project_type: string;
  description: string | null;
  status: string;
  created_at: string;
}

export default function WorkspaceBriefingsPage() {
  const locale = useLocale();
  const searchParams = useSearchParams();
  const projectIdParam = searchParams.get('project_id');
  const [briefings, setBriefings] = useState<BriefingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getStaffToken();
    if (!token) return;
    setLoading(true);
    const url = projectIdParam
      ? `/api/workspace/briefings?project_id=${encodeURIComponent(projectIdParam)}`
      : '/api/workspace/briefings';
    workspaceFetch(url, { token })
      .then((r) => (r.ok ? r.json() : []))
      .then(setBriefings)
      .catch(() => setError('Falha ao carregar briefings'))
      .finally(() => setLoading(false));
  }, [projectIdParam]);

  const handleDownload = useCallback(
    async (briefingId: number) => {
      const token = getStaffToken();
      if (!token) return;
      const res = await workspaceFetch(
        `/api/workspace/briefings/${briefingId}/download`,
        { token }
      );
      if (!res.ok) return;
      const blob = await res.blob();
      const disposition = res.headers.get('Content-Disposition');
      const match = disposition?.match(/filename="?([^";]+)"?/);
      const filename = match ? match[1].trim() : `briefing-${briefingId}.txt`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    },
    []
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Briefings</h2>
      <p className="text-slate-400">
        Solicitações de projeto e dados de briefing enviados pelos clientes no portal.
      </p>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {briefings.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 flex flex-col"
            >
              <div className="flex items-start gap-3">
                <FileText className="w-8 h-8 text-amber-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white truncate">{b.project_name}</p>
                  <p className="text-sm text-slate-400">
                    <Link
                      href={`/${locale}/customers/${b.customer_id}`}
                      className="text-blue-400 hover:underline"
                    >
                      {b.customer_name}
                    </Link>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{b.project_type}</p>
                </div>
              </div>
              {b.description && (
                <p className="mt-3 text-sm text-slate-400 line-clamp-2">{b.description}</p>
              )}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2 py-1 rounded-lg bg-white/10 text-slate-300 text-xs">
                    {b.status}
                  </span>
                  {b.project_id != null && (
                    <Link
                      href={`/${locale}/projects/${b.project_id}`}
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:underline"
                    >
                      <FolderOpen className="w-3 h-3" />
                      Projeto #{b.project_id}
                    </Link>
                  )}
                </div>
                <span className="text-xs text-slate-500">
                  {new Date(b.created_at).toLocaleDateString(locale)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleDownload(b.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-slate-300 text-sm hover:bg-white/15 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <Link
                  href={`/${locale}/briefings/${b.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 text-slate-300 text-sm hover:bg-white/15 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver detalhe
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      {!loading && briefings.length === 0 && !error && (
        <div className="text-center py-12 text-slate-400 flex flex-col items-center gap-2">
          <FileText className="w-12 h-12 text-slate-600" />
          <p>Nenhum briefing recebido.</p>
        </div>
      )}
    </div>
  );
}
