'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowRightIcon, PlayCircleIcon } from '@heroicons/react/24/outline'
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid'
import { Link } from '@/i18n/navigation'

const Hero = () => {
  const t = useTranslations('hero')
  const metrics = (t.raw('metrics') as { value: string; label: string }[]) ?? []
  const problemItems = (t.raw('problem.items') as string[]) ?? []
  const solutionItems = (t.raw('solution.items') as string[]) ?? []

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1e40af,transparent_55%)] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#06b6d4,transparent_45%)] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opacity-95" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-36 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-cyan-200 backdrop-blur border border-white/10"
            >
              {t('badge')}
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mt-6 text-4xl md:text-5xl lg:text-[3.5rem] font-bold leading-tight text-white"
            >
              {t('title')}
              <span className="block bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-400 bg-clip-text text-transparent">
                {t('highlight')}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-8 text-lg md:text-xl text-slate-200 leading-relaxed max-w-2xl"
            >
              {t('subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="mt-10 flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 px-8 py-4 text-lg font-semibold text-slate-950 shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-cyan-500/40"
              >
                {t('primaryCta')}
                <ArrowRightIcon className="h-5 w-5" />
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 px-8 py-4 text-lg font-semibold text-white/90 transition-all duration-300 hover:border-cyan-400/60 hover:text-white hover:bg-white/5"
              >
                <PlayCircleIcon className="h-5 w-5" />
                {t('secondaryCta')}
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-6 text-sm font-medium uppercase tracking-widest text-cyan-200/70"
            >
              {t('coverage')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5 }}
              className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur px-6 py-6">
                <h3 className="text-sm font-semibold text-cyan-200 uppercase tracking-widest mb-3">
                  {t('problem.title')}
                </h3>
                <ul className="space-y-3 text-sm text-slate-200/80">
                  {problemItems.map((item) => (
                    <li key={item} className="flex gap-3">
                      <XCircleIcon className="h-5 w-5 text-rose-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-white/[0.08] border border-white/10 backdrop-blur px-6 py-6">
                <h3 className="text-sm font-semibold text-cyan-200 uppercase tracking-widest mb-3">
                  {t('solution.title')}
                </h3>
                <ul className="space-y-3 text-sm text-slate-100">
                  {solutionItems.map((item) => (
                    <li key={item} className="flex gap-3">
                      <CheckCircleIcon className="h-5 w-5 text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="relative"
          >
            <div className="relative rounded-3xl border border-white/10 bg-white/[0.05] backdrop-blur-xl p-10 shadow-2xl shadow-cyan-500/10">
              <div className="absolute -top-10 -right-6 hidden lg:flex flex-col rounded-2xl bg-cyan-400/90 px-5 py-4 text-slate-950 shadow-xl shadow-cyan-500/40">
                <span className="text-xs font-bold uppercase tracking-widest">
                  {t('badge')}
                </span>
                <span className="text-2xl font-black">{t('callout')}</span>
              </div>

              <h3 className="text-lg font-semibold text-cyan-200/90 uppercase tracking-widest">
                {t('outcome.title')}
              </h3>
              <p className="mt-4 text-xl font-semibold text-white leading-relaxed">
                {t('outcome.subtitle')}
              </p>
              <p className="mt-4 text-sm text-slate-200/70">
                {t('outcome.description')}
              </p>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {metrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="rounded-2xl bg-white/[0.06] border border-white/10 px-5 py-5"
                  >
                    <div className="text-3xl font-bold text-white">
                      {metric.value}
                    </div>
                    <div className="mt-1 text-sm text-slate-200/70">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 rounded-2xl border border-white/10 bg-slate-950/60 px-6 py-5">
                <p className="text-sm font-medium text-cyan-200 uppercase tracking-widest">
                  {t('impact.title')}
                </p>
                <p className="mt-2 text-sm text-slate-200/80">
                  {t('impact.description')}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="animate-bounce text-slate-400/70">
          <svg
            className="w-6 h-6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>
      </motion.div>
    </section>
  )
}

export default Hero