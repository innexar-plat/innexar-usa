'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

const AboutHero = () => {
  const t = useTranslations('about.hero')

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1e40af,transparent_55%)] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#06b6d4,transparent_45%)] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opacity-95" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-36 pb-24">
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
                {t('secondaryCta')}
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="rounded-2xl bg-white/[0.08] border border-white/10 backdrop-blur-xl p-8">
              <div className="grid grid-cols-2 gap-6">
                {((t.raw('metrics') as { value: string; label: string }[]) ?? []).map((metric, index) => (
                  <motion.div
                    key={metric.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                    className="rounded-xl bg-white/[0.05] border border-white/10 p-6 text-center"
                  >
                    <div className="text-3xl md:text-4xl font-bold text-cyan-400 mb-2">
                      {metric.value}
                    </div>
                    <div className="text-sm text-slate-300">
                      {metric.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default AboutHero

