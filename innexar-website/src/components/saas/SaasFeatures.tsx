"use client"

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { 
  CloudIcon, 
  CogIcon, 
  ShieldCheckIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  GlobeAltIcon 
} from '@heroicons/react/24/outline'

const SaasFeatures = () => {
  const t = useTranslations('saas')

  const features = [
    {
      icon: CloudIcon,
      title: t('feature1.title'), 
      description: t('feature1.description')
    },
    {
      icon: CogIcon,
      title: t('feature2.title'),
      description: t('feature2.description')
    },
    {
      icon: ShieldCheckIcon,
      title: t('feature3.title'),
      description: t('feature3.description')
    },
    {
      icon: ChartBarIcon,
      title: t('feature4.title'),
      description: t('feature4.description')
    },
    {
      icon: UserGroupIcon,
      title: t('feature5.title'),
      description: t('feature5.description')
    },
    {
      icon: GlobeAltIcon,
      title: t('feature6.title'),
      description: t('feature6.description')
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t('featuresTitle')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('featuresSubtitle')}
            </p>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative p-8 bg-gray-50 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                <feature.icon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>

              {/* Hover effect */}
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </motion.div>
          ))}
        </div>

        {/* Technical Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Built with Modern Technology Stack
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="text-lg font-semibold text-gray-700">Python</div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="text-lg font-semibold text-gray-700">PostgreSQL</div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="text-lg font-semibold text-gray-700">React</div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="text-lg font-semibold text-gray-700">Docker</div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="text-lg font-semibold text-gray-700">Kubernetes</div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="text-lg font-semibold text-gray-700">AWS</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default SaasFeatures