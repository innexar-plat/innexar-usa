'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'

const BlockchainTechnologies = () => {
  const t = useTranslations('blockchain.technologies')

  const technologies = (t.raw('items') as {
    name: string
    category: string
  }[]) ?? []

  const categories = Array.from(new Set(technologies.map(t => t.category)))

  return (
    <section className="py-24 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="space-y-12">
          {categories.map((category, catIndex) => {
            const categoryTechs = technologies.filter(t => t.category === category)
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: catIndex * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 capitalize">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-4">
                  {categoryTechs.map((tech, techIndex) => (
                    <motion.div
                      key={tech.name}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: catIndex * 0.1 + techIndex * 0.05 }}
                      viewport={{ once: true }}
                      className="px-6 py-3 bg-white rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300"
                    >
                      <span className="text-gray-800 font-medium">{tech.name}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default BlockchainTechnologies

