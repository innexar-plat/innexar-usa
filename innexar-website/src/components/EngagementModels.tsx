'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { ArrowRightIcon } from '@heroicons/react/24/outline'

type Model = {
  title: string
  description: string
  badge: string
  items: string[]
}

const EngagementModels = () => {
  const t = useTranslations('engagement')
  const models = (t.raw('models') as Model[]) ?? []

  return (
    <section id="engagement" className="py-24 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl text-center mx-auto"
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-200">
            {t('eyebrow')}
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-slate-200 leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {models.map((model, index) => (
            <motion.div
              key={model.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-lg shadow-xl shadow-cyan-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-cyan-600/[0.1]" />
              <div className="relative flex flex-col h-full">
                <span className="inline-flex w-max items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-200">
                  {model.badge}
                </span>
                <h3 className="mt-6 text-2xl font-semibold text-white">{model.title}</h3>
                <p className="mt-3 text-sm text-slate-200/80 leading-relaxed">
                  {model.description}
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-100">
                  {model.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <ArrowRightIcon className="mt-1 h-4 w-4 text-cyan-300" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default EngagementModels

