'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import {
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

export default function ServicesCTA() {
  const t = useTranslations('services.servicesCta')

  const contactOptions = [
    {
      icon: PhoneIcon,
      title: t('options.phone.title'),
      description: t('options.phone.description'),
      action: t('options.phone.action'),
      value: '+55 11 9999-9999',
      href: 'tel:+5511999999999',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      icon: EnvelopeIcon,
      title: t('options.email.title'),
      description: t('options.email.description'),
      action: t('options.email.action'),
      value: 'contact@innexar.com',
      href: 'mailto:contact@innexar.com',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: CalendarDaysIcon,
      title: t('options.meeting.title'),
      description: t('options.meeting.description'),
      action: t('options.meeting.action'),
      value: t('options.meeting.value'),
      href: '#',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: t('options.chat.title'),
      description: t('options.chat.description'),
      action: t('options.chat.action'),
      value: t('options.chat.value'),
      href: '#',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ]

  return (
    <section className="py-20 bg-gray-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-linear-to-br from-blue-600 to-cyan-600"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Main CTA Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
            {t('subtitle')}
          </p>
          
          {/* Primary CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/contact"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl text-center block"
              >
                {t('primaryButton')}
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/portfolio"
                className="border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 text-center block"
              >
                {t('secondaryButton')}
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Contact Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {contactOptions.map((option, index) => {
            const IconComponent = option.icon
            
            return (
              <motion.a
                key={option.title}
                href={option.href}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-gray-800 rounded-xl p-6 text-center hover:bg-gray-700 transition-all duration-300 group cursor-pointer"
              >
                <div className={`${option.color} rounded-lg p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center transition-all duration-300`}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                  {option.title}
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  {option.description}
                </p>
                <div className="text-blue-400 font-medium text-sm">
                  {option.value}
                </div>
                <div className="mt-3 text-blue-400 text-xs uppercase tracking-wide">
                  {option.action}
                </div>
              </motion.a>
            )
          })}
        </div>

        {/* Bottom Section with Urgency */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-linear-to-r from-yellow-500 to-orange-500 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {t('urgency.title')}
            </h3>
            <p className="text-gray-800 mb-6 max-w-2xl mx-auto">
              {t('urgency.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="flex items-center text-gray-800 font-semibold">
                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm mr-3">
                  {t('urgency.badge')}
                </span>
                {t('urgency.offer')}
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/contact"
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 block"
                >
                  {t('urgency.action')}
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 text-sm mb-4">
            {t('trust.subtitle')}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500">
            {(t.raw('trust.indicators') as string[]).map((indicator) => (
              <div key={indicator} className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                {indicator}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}