'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ArrowUpRightIcon } from '@heroicons/react/24/outline'

type CaseStudy = {
  name: string
  industry: string
  challenge: string
  solution: string
  results: string[]
}

const SuccessStories = () => {
  const t = useTranslations('successStories')
  const cases = (t.raw('cases') as CaseStudy[]) ?? []

  return (
    <section id="portfolio" className="py-24 bg-slate-950 text-white">
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

        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
          {cases.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: index * 0.08 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-8 backdrop-blur-lg shadow-xl shadow-cyan-500/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-cyan-600/[0.12]" />
              <div className="relative flex flex-col h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200/80">
                      {item.industry}
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      {item.name}
                    </h3>
                  </div>
                  <ArrowUpRightIcon className="h-6 w-6 text-cyan-300" />
                </div>

                <div className="mt-6 space-y-4 text-sm text-slate-200/80 leading-relaxed">
                  <p>
                    <span className="font-semibold text-white">{t('challenge')}</span>{' '}
                    {item.challenge}
                  </p>
                  <p>
                    <span className="font-semibold text-white">{t('solution')}</span>{' '}
                    {item.solution}
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-xs font-semibold uppercase tracking-widest text-cyan-200">
                    {t('results')}
                  </p>
                  <ul className="mt-4 space-y-3 text-sm text-slate-100">
                    {item.results.map((result) => (
                      <li key={result} className="flex gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-cyan-400/90" />
                        <span>{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <a
            href={t('ctaLink')}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white/90 transition-all duration-300 hover:border-cyan-400/60 hover:text-white hover:bg-white/10"
          >
            {t('cta')}
            <ArrowUpRightIcon className="h-4 w-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default SuccessStories

