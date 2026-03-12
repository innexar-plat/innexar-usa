'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { EnvelopeIcon, MapPinIcon, ClockIcon } from '@heroicons/react/24/outline'
import ContactForm from '@/components/contact/ContactForm'

const Contact = () => {
  const t = useTranslations('contact')
  const emailFromTranslations = t('info.emailValue')
  const addressLines = (t.raw('info.addressLines') as string[]) ?? []

  return (
    <section id="contact" className="py-24 bg-gray-50 -mt-12 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          
          {/* Contact Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t('info.title')}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {t('info.subtitle')}
              </p>
            </div>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <EnvelopeIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('info.email')}</h3>
                  <a 
                    href={`mailto:${emailFromTranslations}`} 
                    className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    {emailFromTranslations}
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="shrink-0 w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <MapPinIcon className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('info.address')}</h3>
                  <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                    {addressLines.join('\n')}
                  </p>
                </div>
              </div>

              {/* Business Hours */}
              <div className="flex items-start gap-4 p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="shrink-0 w-12 h-12 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <ClockIcon className="h-6 w-6 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{t('info.hours.title')}</h3>
                  <p className="text-gray-600">{t('info.hours.weekdays')}</p>
                  <p className="text-gray-600">{t('info.hours.weekend')}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <ContactForm />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Contact