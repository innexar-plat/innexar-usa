/**
 * Route-level loading UI. Shown immediately during navigation (Suspense).
 * Reduces perceived wait and layout shift.
 */
export default function LocaleLoading() {
  return (
    <div className="flex items-center justify-center min-h-[40vh] p-8" aria-live="polite" aria-busy="true">
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"
          role="status"
          aria-label="Carregando"
        />
        <p className="text-sm text-slate-400">Carregando…</p>
      </div>
    </div>
  );
}
