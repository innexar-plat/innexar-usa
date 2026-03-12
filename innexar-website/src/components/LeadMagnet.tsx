'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'

const LeadMagnet = () => {
  const t = useTranslations('leadMagnet')
  const features = (t.raw('features') as string[]) ?? []
  const stats = (t.raw('stats') as { value: string; label: string }[]) ?? []

  return (
    <section className="relative overflow-hidden py-24 bg-gradient-to-br from-cyan-500 via-blue-600 to-slate-900 text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#ffffff33,transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,#0f172a,transparent_70%)] opacity-80" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/90">
              {t('eyebrow')}
            </span>
            <h2 className="mt-6 text-4xl md:text-5xl font-bold leading-tight">
              {t('title')}
            </h2>
            <p className="mt-4 text-lg text-white/80 leading-relaxed">
              {t('subtitle')}
            </p>

            <ul className="mt-8 space-y-3 text-sm text-white/85">
              {features.map((feature) => (
                <li key={feature} className="flex gap-2">
                  <span className="mt-1 h-2 w-2 rounded-full bg-white" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-white px-8 py-4 text-lg font-semibold text-slate-950 shadow-lg shadow-slate-900/30 transition-all duration-300 hover:scale-[1.02]"
              >
                {t('primaryCta')}
              </Link>
              <Link
                href="/checklist"
                className="inline-flex items-center justify-center rounded-xl border border-white/40 px-8 py-4 text-lg font-semibold text-white/90 transition-all duration-300 hover:bg-white/10"
              >
                {t('secondaryCta')}
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl p-8 shadow-2xl shadow-slate-900/40">
              <div className="grid grid-cols-2 gap-6 text-center">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-white/10 px-6 py-6">
                    <div className="text-3xl font-bold text-white">{stat.value}</div>
                    <div className="mt-2 text-sm text-white/70">{stat.label}</div>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-sm text-white/80 leading-relaxed">
                {t('footnote')}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default LeadMagnet

