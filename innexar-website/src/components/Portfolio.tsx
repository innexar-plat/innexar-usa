'use client'

import { useState, createElement } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import {
  EyeIcon,
  ShoppingBagIcon,
  DevicePhoneMobileIcon,
  CloudIcon,
  ChartBarIcon,
  GlobeAltIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'

const Portfolio = () => {
  const t = useTranslations('portfolio')
  const [activeFilter, setActiveFilter] = useState('all')

  const projects = [
    {
      id: 1,
      title: 'E-commerce Platform',
      category: 'web',
      gradient: 'from-purple-500 via-pink-500 to-red-500',
      icon: ShoppingBagIcon,
      iconColor: 'text-white',
      technologies: ['React', 'Node.js', 'PostgreSQL'],
      description: 'Modern e-commerce platform with advanced analytics',
      image: '/portfolio/e-commerce.png'
    },
    {
      id: 2,
      title: 'Mobile Banking App',
      category: 'mobile',
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      icon: DevicePhoneMobileIcon,
      iconColor: 'text-white',
      technologies: ['React Native', 'Firebase', 'TypeScript'],
      description: 'Secure mobile banking application',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop&q=80'
    },
    {
      id: 3,
      title: 'Cloud Infrastructure',
      category: 'cloud',
      gradient: 'from-blue-500 via-cyan-500 to-sky-500',
      icon: CloudIcon,
      iconColor: 'text-white',
      technologies: ['AWS', 'Kubernetes', 'Docker'],
      description: 'Scalable cloud infrastructure solution',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&q=80'
    },
    {
      id: 4,
      title: 'Data Analytics Dashboard',
      category: 'data',
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      icon: ChartBarIcon,
      iconColor: 'text-white',
      technologies: ['Python', 'TensorFlow', 'React'],
      description: 'Real-time data analytics and visualization',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop&q=80'
    },
    {
      id: 5,
      title: 'Corporate Website',
      category: 'web',
      gradient: 'from-indigo-500 via-blue-500 to-purple-500',
      icon: GlobeAltIcon,
      iconColor: 'text-white',
      technologies: ['Next.js', 'Tailwind CSS', 'Vercel'],
      description: 'Professional corporate website with CMS',
      image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=600&fit=crop&q=80'
    },
    {
      id: 6,
      title: 'IoT Monitoring System',
      category: 'cloud',
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      icon: CpuChipIcon,
      iconColor: 'text-white',
      technologies: ['IoT Core', 'MongoDB', 'Express'],
      description: 'IoT device monitoring and management system',
      image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=600&fit=crop&q=80'
    }
  ]

  const filters = [
    { key: 'all', label: t('filterAll') },
    { key: 'web', label: t('filterWeb') },
    { key: 'mobile', label: t('filterMobile') },
    { key: 'cloud', label: t('filterCloud') },
    { key: 'data', label: t('filterData') }
  ]

  const filteredProjects = activeFilter === 'all'
    ? projects
    : projects.filter(project => project.category === activeFilter)

  return (
    <section className="py-24 bg-gray-50">
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

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
            <div className="text-gray-600">{t('projectsCount')}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-cyan-600 mb-2">30+</div>
            <div className="text-gray-600">{t('clientsCount')}</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-indigo-600 mb-2">5+</div>
            <div className="text-gray-600">{t('yearsCount')}</div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {filters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${activeFilter === filter.key
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                }`}
            >
              {filter.label}
            </button>
          ))}
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="relative overflow-hidden h-64">
                {/* Background Image with Gradient Overlay */}
                <div className="absolute inset-0">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback para gradiente se a imagem falhar
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br ${project.gradient}"></div>`
                      }
                    }}
                  />
                  {/* Gradient overlay para melhor legibilidade */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-60 group-hover:opacity-40 transition-opacity duration-300`}></div>
                </div>

                {/* Pattern overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)',
                    backgroundSize: '24px 24px'
                  }}></div>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
                <div className="absolute bottom-4 left-4 w-20 h-20 bg-white/20 rounded-full blur-xl"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>

                {/* Icon overlay */}
                <div className="absolute bottom-6 right-6" suppressHydrationWarning>
                  {createElement(project.icon, { className: `h-10 w-10 ${project.iconColor} drop-shadow-lg opacity-90` })}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gray-900 bg-opacity-0 group-hover:bg-opacity-80 transition-all duration-300 flex items-center justify-center">
                  <button className="bg-white text-gray-900 px-6 py-3 rounded-full font-semibold opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 shadow-xl hover:scale-105">
                    <EyeIcon className="h-5 w-5" />
                    {t('viewProject')}
                  </button>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {project.description}
                </p>

                <div className="mb-4">
                  <span className="text-sm font-semibold text-gray-700 mb-2 block">
                    {t('technologies')}:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Portfolio