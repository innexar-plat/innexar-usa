'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { StarIcon } from '@heroicons/react/24/solid'

type Testimonial = {
  quote: string
  name: string
  role: string
  company: string
}

const Testimonials = () => {
  const t = useTranslations('testimonials')
  const testimonials = (t.raw('items') as Testimonial[]) ?? []

  return (
    <section id="testimonials" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-3xl text-center mx-auto"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-blue-700">
            {t('eyebrow')}
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-gray-900">
            {t('title')}
          </h2>
          <p className="mt-4 text-lg text-gray-600 leading-relaxed">
            {t('subtitle')}
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.06 }}
              viewport={{ once: true }}
              className="rounded-3xl border border-gray-100 bg-white shadow-xl shadow-blue-100/60 p-8"
            >
              <div className="flex gap-1 text-yellow-400">
                {Array.from({ length: 5 }, (_, star) => (
                  <StarIcon key={star} className="h-4 w-4" />
                ))}
              </div>
              <p className="mt-6 text-gray-700 leading-relaxed">
                “{testimonial.quote}”
              </p>
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-900">
                  {testimonial.name}
                </p>
                <p className="text-sm text-gray-500">
                  {testimonial.role} • {testimonial.company}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials

