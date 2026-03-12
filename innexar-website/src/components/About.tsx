'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Link } from '@/i18n/navigation'
import { CheckIcon } from '@heroicons/react/24/solid'

const About = () => {
  const t = useTranslations('about')

  const features = [
    t('features.expertTeam'),
    t('features.provenTrack'),
    t('features.cuttingEdge'),
    t('features.customerFocus'),
    t('features.support247'),
    t('features.scalable')
  ]

  return (
    <section id="about" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {t('title')}
            </h2>
            
            <h3 className="text-xl text-blue-600 font-semibold mb-6">
              {t('subtitle')}
            </h3>
            
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              {t('description')}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center"
                >
                  <CheckIcon className="h-5 w-5 text-green-500 mr-3 shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <Link
                href="/about"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 inline-block"
              >
                {t('learnMoreBtn')}
              </Link>
            </motion.div>
          </motion.div>

          {/* Visual Element */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-linear-to-br from-blue-100 to-cyan-100 rounded-2xl p-8 h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600 mb-4">5+</div>
                <div className="text-xl text-gray-700 mb-6">{t('stats.yearsTitle')}</div>
                
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-cyan-600">50+</div>
                    <div className="text-sm text-gray-600">{t('stats.projectsTitle')}</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-indigo-600">100%</div>
                    <div className="text-sm text-gray-600">{t('stats.satisfactionTitle')}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500 rounded-full opacity-20"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-cyan-500 rounded-full opacity-20"></div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default About