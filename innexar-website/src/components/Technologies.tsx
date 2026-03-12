'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

const badgeClasses =
  'inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-white/80 text-gray-700 shadow-sm border border-white/40 backdrop-blur'

const listContainerClasses =
  'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8'

const cardClasses =
  'rounded-2xl bg-white/90 border border-white/60 shadow-lg p-6 h-full flex flex-col justify-between hover:-translate-y-1 transition-transform duration-300'

const Technologies = () => {
  const t = useTranslations('technologies')

  const stackItems = t.raw('stack.items') as string[]
  const cloudItems = t.raw('cloud.items') as string[]
  const aiItems = t.raw('ai.items') as string[]
  const toolingItems = t.raw('tooling.items') as string[]

  const sections = [
    {
      title: t('stack.title'),
      description: t('stack.description'),
      items: stackItems,
    },
    {
      title: t('cloud.title'),
      description: t('cloud.description'),
      items: cloudItems,
    },
    {
      title: t('ai.title'),
      description: t('ai.description'),
      items: aiItems,
    },
    {
      title: t('tooling.title'),
      description: t('tooling.description'),
      items: toolingItems,
    },
  ]

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.35),transparent_55%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.35),transparent_55%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className={badgeClasses}>{t('badge')}</span>

          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-white">
            {t('title')}
          </h2>

          <p className="mt-4 text-lg md:text-xl text-slate-200 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="mt-16 space-y-12">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
              className="bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 md:p-10 backdrop-blur"
            >
              <div className="md:flex md:items-start md:justify-between gap-10">
                <div className="md:max-w-xl">
                  <h3 className="text-2xl font-semibold text-white">
                    {section.title}
                  </h3>
                  <p className="mt-3 text-slate-200 leading-relaxed">
                    {section.description}
                  </p>
                </div>

                <div className="mt-8 md:mt-0 flex-1">
                  <div className={listContainerClasses}>
                    {section.items.map((item) => (
                      <div key={item} className={cardClasses}>
                        <div>
                          <p className="text-lg font-semibold text-slate-900">
                            {item}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-slate-200 text-lg">{t('cta')}</p>
        </motion.div>
      </div>
    </section>
  )
}

export default Technologies

