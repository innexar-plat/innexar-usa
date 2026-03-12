"use client"

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { CheckIcon, ArrowRightIcon } from '@heroicons/react/24/outline'

const StructurOneHero = () => {
  const t = useTranslations('saas.structurone')

  const benefits = t.raw('hero.benefits') as string[]

  return (
    <section className="relative min-h-screen flex items-center bg-linear-to-br from-slate-900 via-slate-800 to-sky-900 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-72 h-72 bg-sky-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full mr-2 animate-pulse" />{' '}
              {t('hero.badge')}
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t('title')}
            </h1>

            <p className="text-xl text-sky-100 mb-8 leading-relaxed">
              {t('subtitle')}
            </p>

            {/* Benefits */}
            <div className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="flex items-center text-sky-100"
                >
                  <CheckIcon className="h-5 w-5 text-emerald-400 mr-3 shrink-0" />
                  <span>{benefit}</span>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-8 py-4 bg-white text-slate-900 rounded-lg text-lg font-semibold hover:bg-slate-50 transition-all duration-300 shadow-lg group"
                >
                  {t('hero.cta')}
                  <ArrowRightIcon className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <div className="bg-white rounded-lg p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    StructurOne • Overview de Empreendimentos
                  </h3>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full" />
                    <div className="w-3 h-3 bg-amber-400 rounded-full" />
                    <div className="w-3 h-3 bg-rose-400 rounded-full" />
                  </div>
                </div>

                {/* Mock metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-sky-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-sky-600">12</div>
                    <div className="text-sm text-gray-600">{t('hero.mock.projects')}</div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">48M</div>
                    <div className="text-sm text-gray-600">{t('hero.mock.volume')}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">🏗️ {t('hero.mock.project1')}</span>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                      {t('hero.mock.status1')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">🏢 {t('hero.mock.project2')}</span>
                    <span className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded">
                      {t('hero.mock.status2')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">🏘️ {t('hero.mock.project3')}</span>
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                      {t('hero.mock.status3')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default StructurOneHero


