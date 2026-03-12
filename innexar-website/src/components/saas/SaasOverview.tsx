"use client"

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { 
  ServerIcon, 
  CodeBracketIcon, 
  ShieldCheckIcon, 
  CreditCardIcon,
  ChartBarIcon,
  UsersIcon 
} from '@heroicons/react/24/outline'

const SaasOverview = () => {
  const t = useTranslations('saas')
  const tOverview = useTranslations('saas.overview')

  const features = [
    { 
      text: t('feature1.title'),
      icon: ServerIcon,
      color: "bg-blue-500"
    },
    { 
      text: t('feature2.title'),
      icon: CodeBracketIcon,
      color: "bg-green-500"
    },
    { 
      text: t('feature3.title'),
      icon: ChartBarIcon,
      color: "bg-purple-500"
    },
    { 
      text: t('feature4.title'),
      icon: ShieldCheckIcon,
      color: "bg-indigo-500"
    },
    { 
      text: t('feature5.title'),
      icon: CreditCardIcon,
      color: "bg-orange-500"
    },
    { 
      text: t('feature6.title'),
      icon: UsersIcon,
      color: "bg-pink-500"
    }
  ]

  return (
    <section className="py-20 bg-linear-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">{tOverview('title')}</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {tOverview('subtitle')}
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-gray-700 font-medium">100% Web-based Platform</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-gray-700 font-medium">Multi-tenant Architecture</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-gray-700 font-medium">Automated Provisioning</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{tOverview('title')}</h3>
                <p className="text-gray-600">{tOverview('subtitle')}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-1">150+</div>
                  <div className="text-sm text-gray-600">{tOverview('stats.clients')}</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600 mb-1">99.9%</div>
                  <div className="text-sm text-gray-600">{tOverview('stats.uptime')}</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600 mb-1">1M+</div>
                  <div className="text-sm text-gray-600">{tOverview('stats.transactions')}</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600 mb-1">&lt;2h</div>
                  <div className="text-sm text-gray-600">{tOverview('stats.support')}</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Objectives Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('objectiveTitle')}</h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            {t('objective')}
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.text}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 ${feature.color} rounded-lg mb-4`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <p className="text-gray-700 font-medium">{feature.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Technical Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{tOverview('architecture.title')}</h3>
            <p className="text-gray-600 max-w-3xl mx-auto">
              {t('tech')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ServerIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{tOverview('architecture.backend')}</h4>
              <p className="text-sm text-gray-600">{tOverview('architecture.backendDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ChartBarIcon className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{tOverview('architecture.frontend')}</h4>
              <p className="text-sm text-gray-600">{tOverview('architecture.frontendDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <CodeBracketIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{tOverview('architecture.infrastructure')}</h4>
              <p className="text-sm text-gray-600">{tOverview('architecture.infrastructureDesc')}</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <ShieldCheckIcon className="h-8 w-8 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{tOverview('architecture.security')}</h4>
              <p className="text-sm text-gray-600">{tOverview('architecture.securityDesc')}</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default SaasOverview