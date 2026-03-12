"use client"

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { CheckIcon, StarIcon } from '@heroicons/react/24/solid'

const SaasPricing = () => {
  const STRIPE_URL = process.env.STRIPE_URL || '#'
  const MERCADOPAGO_URL = process.env.MERCADOPAGO_URL || '#'
  const t = useTranslations('saas.pricing')

  const plans = [
    {
      name: t('starter.name'),
      price: t('starter.price'),
      description: t('starter.description'),
      popular: false,
      features: t.raw('starter.features') as string[]
    },
    {
      name: t('professional.name'),
      price: t('professional.price'),
      description: t('professional.description'),
      popular: true,
      features: t.raw('professional.features') as string[]
    },
    {
      name: t('enterprise.name'),
      price: t('enterprise.price'),
      description: t('enterprise.description'),
      popular: false,
      features: t.raw('enterprise.features') as string[]
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`relative bg-white rounded-2xl shadow-lg overflow-hidden ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-blue-500 text-white text-center py-2 text-sm font-medium">
                  <StarIcon className="inline h-4 w-4 mr-1" />
                  {t('professional.popular')}
                </div>
              )}
              
              <div className={`p-8 ${plan.popular ? 'pt-16' : ''}`}>
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-xl text-gray-500 ml-1">{t('perMonth')}</span>
                  </div>
                </div>

                {/* Features List */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <CheckIcon className="h-5 w-5 text-green-500 shrink-0 mr-3" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                  onClick={() => {
                    if (plan.name.toLowerCase().includes('starter')) {
                      window.open(STRIPE_URL, '_blank')
                    } else if (plan.name.toLowerCase().includes('professional')) {
                      window.open(MERCADOPAGO_URL, '_blank')
                    } else {
                      window.open(STRIPE_URL, '_blank')
                    }
                  }}
                >
                  {t('selectPlan')}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            {t('allPlansInclude')}
          </p>
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center">
              <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
              {t('sslSecurity')}
            </div>
            <div className="flex items-center">
              <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
              {t('uptimeSla')}
            </div>
            <div className="flex items-center">
              <CheckIcon className="h-4 w-4 text-green-500 mr-1" />
              {t('dailyBackups')}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default SaasPricing