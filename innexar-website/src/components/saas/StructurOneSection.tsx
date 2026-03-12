"use client"

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { CheckIcon, StarIcon } from '@heroicons/react/24/solid'

const StructurOneSection = () => {
  const t = useTranslations('saas.structurone')

  const plans = t.raw('pricing.plans') as {
    slug: string
    name: string
    price: string
    description: string
    highlight?: string
    features: string[]
  }[]

  const appUrl = process.env.NEXT_PUBLIC_STRUCTURONE_APP_URL || 'http://localhost:3007'

  return (
    <section id="structurone" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header StructurOne */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Pricing Cards StructurOne */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const isHighlight = !!plan.highlight
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative bg-gray-50 rounded-2xl shadow-lg overflow-hidden ${
                  isHighlight ? 'ring-2 ring-indigo-500 scale-105' : ''
                }`}
              >
                {isHighlight && (
                  <div className="absolute top-0 left-0 right-0 bg-indigo-500 text-white text-center py-2 text-sm font-medium">
                    <StarIcon className="inline h-4 w-4 mr-1" />
                    {plan.highlight}
                  </div>
                )}

                <div className={`p-8 ${isHighlight ? 'pt-16' : ''}`}>
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      <span className="text-xl text-gray-500 ml-1">
                        {t('pricing.perMonth')}
                      </span>
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <CheckIcon className="h-5 w-5 text-green-500 shrink-0 mr-3" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                      isHighlight
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                    onClick={() => {
                      window.location.href = `${appUrl}/register?plan=${plan.slug}`
                    }}
                  >
                    {t('pricing.selectPlan')}
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default StructurOneSection


