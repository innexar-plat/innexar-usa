'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { ArrowLongRightIcon } from '@heroicons/react/24/outline'

type ProcessStep = {
  title: string
  description: string
  deliverable: string
  duration: string
}

const ProcessSection = () => {
  const t = useTranslations('process')
  const steps = (t.raw('steps') as ProcessStep[]) ?? []

  return (
    <section id="process" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl text-center mx-auto"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-blue-700">
            {t('eyebrow')}
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-gray-900">
            {t('title')}
          </h2>
            <p className="mt-4 text-lg text-gray-600 leading-relaxed">
              {t('subtitle')}
            </p>
        </motion.div>

        <div className="mt-16 relative">
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-200 via-blue-100 to-transparent" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="relative grid lg:grid-cols-2 gap-10 items-center"
              >
                <div className={`lg:pl-12 ${index % 2 === 0 ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-semibold text-lg shadow-lg shadow-blue-600/20">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">
                        {step.title}
                      </h3>
                      <p className="text-sm font-medium uppercase tracking-widest text-blue-600 mt-1">
                        {step.duration}
                      </p>
                    </div>
                  </div>
                  <p className="mt-6 text-base text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className={`relative ${index % 2 === 0 ? 'lg:order-2 lg:pr-12' : 'lg:order-1 lg:pl-12'}`}>
                  <div className="rounded-3xl border border-gray-100 bg-white shadow-xl shadow-gray-200/40 p-8">
                    <h4 className="text-sm font-semibold text-blue-700 uppercase tracking-widest">
                      {t('deliverable')}
                    </h4>
                    <p className="mt-4 text-gray-700 font-medium leading-relaxed">
                      {step.deliverable}
                    </p>
                    {index < steps.length - 1 && (
                      <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
                        <span>{t('nextStep')}</span>
                        <ArrowLongRightIcon className="h-5 w-5 text-blue-400" />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProcessSection

