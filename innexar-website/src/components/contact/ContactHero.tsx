'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline'

const ContactHero = () => {
  const t = useTranslations('contact.hero')
  const emailValue = t('emailValue')
  const addressLines = (t.raw('addressLines') as string[]) ?? []

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,#1e40af,transparent_55%)] opacity-40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#06b6d4,transparent_45%)] opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opacity-95" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 lg:pt-36 pb-24">
        <div className="text-center max-w-4xl mx-auto">
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
            className="mt-8 text-lg md:text-xl text-slate-200 leading-relaxed"
          >
            {t('subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="rounded-xl bg-white/[0.08] border border-white/10 backdrop-blur-xl p-6">
              <EnvelopeIcon className="h-8 w-8 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-cyan-200 uppercase tracking-widest mb-2">
                {t('emailLabel')}
              </h3>
              <a
                href={`mailto:${emailValue}`}
                className="text-white hover:text-cyan-400 transition-colors text-sm"
              >
                {emailValue}
              </a>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="rounded-xl bg-white/[0.08] border border-white/10 backdrop-blur-xl p-6"
            >
              <MapPinIcon className="h-8 w-8 text-cyan-400 mx-auto mb-4" />
              <h3 className="text-sm font-semibold text-cyan-200 uppercase tracking-widest mb-2">
                {t('addressLabel')}
              </h3>
              <p className="text-white text-sm whitespace-pre-line">
                {addressLines.join('\n')}
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ContactHero

