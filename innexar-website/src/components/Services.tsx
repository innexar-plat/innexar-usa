'use client'

import type { ComponentType, SVGProps } from 'react'
import { motion } from 'framer-motion'
import {
  SparklesIcon,
  CubeTransparentIcon,
  DevicePhoneMobileIcon,
  BoltIcon,
  CloudIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'

const iconMap: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  web: SparklesIcon,
  saas: CubeTransparentIcon,
  mobile: DevicePhoneMobileIcon,
  ai: BoltIcon,
  cloud: CloudIcon,
  integrations: CommandLineIcon,
}

const Services = () => {
  const t = useTranslations('services')
  const items =
    (t.raw('items') as {
      key: string
      title: string
      headline: string
      description: string
      results: string[]
      tag: string
    }[]) ?? []

  return (
    <section id="services" className="relative py-24 bg-slate-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1d4ed8,transparent_60%)] opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,#0ea5e9,transparent_55%)] opacity-20" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-200">
            {t('eyebrow')}
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-slate-200 leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, index) => {
            const Icon = iconMap[item.key] ?? SparklesIcon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] p-8 backdrop-blur-lg shadow-lg shadow-cyan-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-cyan-500/[0.08]" />
                <div className="relative">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-200">
                    {item.tag}
                  </span>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400/80 to-blue-500/80 text-slate-950 shadow-md shadow-cyan-500/30">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                      <p className="text-sm text-cyan-200/80">{item.headline}</p>
                    </div>
                  </div>
                  <p className="mt-6 text-sm text-slate-200/80 leading-relaxed">
                    {item.description}
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-slate-100">
                    {item.results.map((result) => (
                      <li key={result} className="flex gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400/90" />
                        <span>{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-col items-center gap-4 text-center"
        >
          <p className="text-sm text-slate-200/70">{t('footnote')}</p>
        </motion.div>
      </div>
    </section>
  )
}

export default Services
