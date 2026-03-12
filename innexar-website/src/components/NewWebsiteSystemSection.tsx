'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import { Rocket, ArrowRight, Sparkles, Check } from 'lucide-react'

const BULLET_KEYS = ['bullet1', 'bullet2', 'bullet3', 'bullet4'] as const

export default function NewWebsiteSystemSection() {
  const t = useTranslations('home.newSystem')

  return (
    <section className="relative pt-[140px] pb-20 overflow-hidden bg-slate-950 border-b border-white/5" aria-label="Hero">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/4 w-[80%] aspect-square bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-1/2 -right-1/4 w-[70%] aspect-square bg-purple-500/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(59,130,246,0.15),transparent_60%)]" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative rounded-2xl overflow-hidden"
        >
          {/* Glass card with gradient border effect */}
          <div className="relative rounded-2xl bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-pink-500/15 border border-white/10 backdrop-blur-sm p-8 md:p-10 lg:p-12 shadow-2xl shadow-blue-900/20">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
              <div className="flex-1 space-y-5">
                <motion.span
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 text-cyan-300 text-xs font-semibold border border-white/10"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {t('badge')}
                </motion.span>
                <motion.h2
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.5rem] font-bold text-white leading-tight tracking-tight"
                >
                  {t('title')}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-slate-300 text-base md:text-lg max-w-xl leading-relaxed"
                >
                  {t('subtitle')}
                </motion.p>
                <motion.ul
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-200"
                >
                  {BULLET_KEYS.map((key, i) => (
                    <li key={key} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden />
                      <span>{t(key)}</span>
                    </li>
                  ))}
                </motion.ul>
              </div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 shrink-0"
              >
                <Link
                  href="/launch"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white text-slate-900 px-7 py-4 text-base font-bold shadow-lg shadow-white/10 hover:shadow-xl hover:shadow-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  <Rocket className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  {t('cta')}
                </Link>
                <Link
                  href="/launch#plans"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/25 bg-white/5 px-7 py-4 text-base font-semibold text-white hover:bg-white/10 hover:border-white/40 transition-all duration-200"
                >
                  {t('ctaSecondary')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
