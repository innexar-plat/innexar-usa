'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { 
  CodeBracketIcon, 
  CloudIcon, 
  LightBulbIcon, 
  WrenchScrewdriverIcon,
  CheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

const ServiceDetails = () => {
  const t = useTranslations('services')
  const [activeService, setActiveService] = useState('development')

  const services = [
    {
      key: 'development',
      icon: CodeBracketIcon,
      color: 'from-blue-500 to-blue-600'
    },
    {
      key: 'infrastructure',
      icon: CloudIcon,
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      key: 'consulting',
      icon: LightBulbIcon,
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      key: 'support',
      icon: WrenchScrewdriverIcon,
      color: 'from-purple-500 to-purple-600'
    }
  ]

  const activeServiceData = services.find(s => s.key === activeService)

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Service Selector */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16"
        >
          {services.map((service) => {
            const IconComponent = service.icon
            const isActive = activeService === service.key
            
            return (
              <button
                key={service.key}
                onClick={() => setActiveService(service.key)}
                className={`p-6 rounded-xl text-center transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-xl scale-105' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-102'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-4 rounded-full bg-linear-to-r ${service.color} flex items-center justify-center ${
                  isActive ? 'bg-opacity-20' : ''
                }`}>
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold">
                  {t(`${service.key}.title`)}
                </h3>
              </button>
            )
          })}
        </motion.div>

        {/* Active Service Details */}
        <motion.div
          key={activeService}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
        >
          
          {/* Content */}
          <div>
            <div className={`w-16 h-16 mb-6 rounded-full bg-linear-to-r ${activeServiceData?.color} flex items-center justify-center`}>
              {activeServiceData && (
                <activeServiceData.icon className="h-8 w-8 text-white" />
              )}
            </div>
            
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              {t(`${activeService}.title`)}
            </h3>
            
            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              {t(`${activeService}.fullDescription`)}
            </p>

            {/* Benefits */}
            <div className="mb-8">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">{t('serviceDetails.keyBenefits')}</h4>
              <div className="space-y-3">
                {t.raw(`${activeService}.benefits`).map((benefit: string) => (
                  <div key={benefit} className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              href="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center group w-fit"
            >
              {t('serviceDetails.learnMore')}
              <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Technologies */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h4 className="text-xl font-semibold text-gray-900 mb-6">{t('serviceDetails.technologiesWeUse')}</h4>
            <div className="grid grid-cols-2 gap-4">
              {t.raw(`${activeService}.technologies`).map((tech: string) => (
                <div key={tech} className="bg-white rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow">
                  <span className="font-medium text-gray-800">{tech}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-6 bg-blue-50 rounded-xl">
              <h5 className="font-semibold text-blue-900 mb-2">{t('serviceDetails.readyToGetStarted')}</h5>
              <p className="text-blue-700 text-sm mb-4">
                {t('serviceDetails.readyToGetStartedDescription', { service: t(`${activeService}.title`).toLowerCase() })}
              </p>
              <Link
                href="/contact"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors inline-block"
              >
                {t('serviceDetails.getQuote')}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ServiceDetails