'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Loader2, AlertCircle, FileText, FolderOpen, Download, ArrowLeft } from 'lucide-react';
import { workspaceFetch, getStaffToken } from '@/lib/workspace-api';

interface BriefingDetail {
  id: number;
  customer_id: number;
  customer_name: string;
  project_id: number | null;
  project_name: string;
  project_type: string;
  description: string | null;
  status: string;
  created_at: string;
  meta?: Record<string, unknown> | null;
  budget?: string | null;
  timeline?: string | null;
}

export default function BriefingDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const id = typeof params.id === 'string' ? params.id : params.id?.[0];
  const [briefing, setBriefing] = useState<BriefingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getStaffToken();
    if (!token || !id) return;
    setLoading(true);
    workspaceFetch(`/api/workspace/briefings/${id}`, { token })
      .then((r) => {
        if (!r.ok) throw new Error('Briefing não encontrado');
        return r.json();
      })
      .then(setBriefing)
      .catch(() => setError('Falha ao carregar briefing'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = useCallback(async () => {
    if (!briefing) return;
    const token = getStaffToken();
    if (!token) return;
    const res = await workspaceFetch(
      `/api/workspace/briefings/${briefing.id}/download`,
      { token }
    );
    if (!res.ok) return;
    const blob = await res.blob();
    const disposition = res.headers.get('Content-Disposition');
    const match = disposition?.match(/filename="?([^";]+)"?/);
    const filename = match ? match[1].trim() : `briefing-${briefing.id}.txt`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [briefing]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error || !briefing) {
    return (
      <div className="space-y-4">
        <Link
          href={`/${locale}/briefings`}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Link>
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          <AlertCircle className="w-5 h-5" />
          <p>{error || 'Briefing não encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/briefings`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <h2 className="text-2xl font-bold text-white">Briefing #{briefing.id}</h2>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 text-slate-200 hover:bg-white/15 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 space-y-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Cliente</p>
            <Link
              href={`/${locale}/customers/${briefing.customer_id}`}
              className="text-blue-400 hover:underline font-medium"
            >
              {briefing.customer_name}
            </Link>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Projeto</p>
            <p className="font-medium text-white">{briefing.project_name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Tipo</p>
            <p className="text-slate-300">{briefing.project_type}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Status</p>
            <span className="inline-block px-2 py-1 rounded-lg bg-white/10 text-slate-300 text-sm">
              {briefing.status}
            </span>
          </div>
          {briefing.project_id != null && (
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Projeto vinculado</p>
              <Link
                href={`/${locale}/projects/${briefing.project_id}`}
                className="inline-flex items-center gap-1 text-cyan-400 hover:underline"
              >
                <FolderOpen className="w-4 h-4" />
                Projeto #{briefing.project_id}
              </Link>
            </div>
          )}
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Data</p>
            <p className="text-slate-400">
              {new Date(briefing.created_at).toLocaleString(locale)}
            </p>
          </div>
        </div>

        {briefing.description && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Descrição</h3>
            <pre className="whitespace-pre-wrap text-slate-300 text-sm bg-black/20 rounded-lg p-4">
              {briefing.description}
            </pre>
          </div>
        )}

        {(briefing.budget || briefing.timeline) && (
          <div className="flex flex-wrap gap-6">
            {briefing.budget && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Orçamento</p>
                <p className="text-slate-300">{briefing.budget}</p>
              </div>
            )}
            {briefing.timeline && (
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider">Prazo</p>
                <p className="text-slate-300">{briefing.timeline}</p>
              </div>
            )}
          </div>
        )}

        {briefing.meta && Object.keys(briefing.meta).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2">Dados do briefing (meta)</h3>
            <dl className="grid gap-2 sm:grid-cols-2">
              {Object.entries(briefing.meta).map(
                ([key, value]) =>
                  value != null && value !== '' && (
                    <div key={key}>
                      <dt className="text-xs text-slate-500">{key}</dt>
                      <dd className="text-slate-300 text-sm">{String(value)}</dd>
                    </div>
                  )
              )}
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
