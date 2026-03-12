"use client"

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { StarIcon } from '@heroicons/react/24/solid'
import { BuildingOfficeIcon } from '@heroicons/react/24/outline'

const SaasTestimonials = () => {
  const t = useTranslations('saas.testimonials')

  const testimonials = [
    {
      name: t('client1.author'),
      role: t('client1.role'),
      company: t('client1.company'),
      rating: 5,
      content: t('client1.quote'),
      image: t('client1.author').charAt(0),
      color: "bg-blue-500"
    },
    {
      name: t('client2.author'),
      role: t('client2.role'), 
      company: t('client2.company'),
      rating: 5,
      content: t('client2.quote'),
      image: t('client2.author').charAt(0),
      color: "bg-green-500"
    },
    {
      name: t('client3.author'),
      role: t('client3.role'),
      company: t('client3.company'),
      rating: 5,
      content: t('client3.quote'),
      image: t('client3.author').charAt(0),
      color: "bg-purple-500"
    }
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                {new Array(testimonial.rating).fill(0).map((_, i) => (
                  <StarIcon key={`star-${testimonial.name}-${i}`} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 italic">
                &ldquo;{testimonial.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center">
                <div className={`w-12 h-12 ${testimonial.color} rounded-full flex items-center justify-center mr-4`}>
                  <span className="text-white font-semibold text-lg">
                    {testimonial.image}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-gray-500 flex items-center">
                    <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                    {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-sm text-gray-600">{t('happyClients')}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-green-600 mb-2">1M+</div>
              <div className="text-sm text-gray-600">{t('transactions')}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-sm text-gray-600">{t('countries')}</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">4.9/5</div>
              <div className="text-sm text-gray-600">{t('rating')}</div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white"
        >
          <h3 className="text-2xl font-bold mb-4">{t('readyToGetStarted')}</h3>
          <p className="text-lg mb-6 opacity-90">
            {t('readyToGetStartedDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200 text-center"
            >
              {t('startFreeTrial')}
            </Link>
            <Link
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200 text-center"
            >
              {t('scheduleDemo')}
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default SaasTestimonials