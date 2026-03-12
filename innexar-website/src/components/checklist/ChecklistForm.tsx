'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  PaperAirplaneIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/solid'

const ChecklistForm = () => {
  const t = useTranslations('checklist')
  const locale = useLocale()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    // Checklist items
    currentChallenges: '',
    targetAudience: '',
    businessGoals: '',
    technicalRequirements: '',
    budgetRange: '',
    timeline: '',
    teamSize: '',
    existingTools: '',
    successMetrics: '',
    additionalNotes: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [apiEndpoint, setApiEndpoint] = useState('/api/checklist')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setApiEndpoint(`${window.location.origin}/api/checklist`)
    }
  }, [])

  const checklistItems = (t.raw('items') as {
    key: string
    label: string
    placeholder: string
    type: string
  }[]) ?? []

  const validate = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = t('errors.nameRequired')
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('errors.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('errors.emailInvalid')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, locale }),
      })

      if (!response.ok) {
        throw new Error('Erro ao enviar checklist')
      }

      setIsSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        currentChallenges: '',
        targetAudience: '',
        businessGoals: '',
        technicalRequirements: '',
        budgetRange: '',
        timeline: '',
        teamSize: '',
        existingTools: '',
        successMetrics: '',
        additionalNotes: '',
      })
    } catch (error) {
      console.error('Erro ao enviar checklist:', error)
      setErrors({ submit: t('errors.submitFailed') })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }))
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }

  return (
    <section className="relative py-24 bg-gradient-to-br from-cyan-50 via-blue-50 to-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 mb-6">
            <ClipboardDocumentCheckIcon className="h-5 w-5 text-cyan-600" />
            <span className="text-sm font-semibold text-cyan-700 uppercase tracking-widest">
              {t('badge')}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('title')}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Success Message */}
        <AnimatePresence>
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 p-6 bg-green-50 border border-green-200 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-900">{t('success.title')}</h3>
                  <p className="text-sm text-green-700 mt-1">{t('success.message')}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12"
        >
          {/* Contact Information */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('sections.contact')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fields.name')} *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border text-gray-900 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                  placeholder={t('fields.namePlaceholder')}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fields.email')} *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border text-gray-900 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  } focus:ring-2 focus:ring-cyan-500 focus:border-transparent`}
                  placeholder={t('fields.emailPlaceholder')}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fields.phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder={t('fields.phonePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fields.company')}
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder={t('fields.companyPlaceholder')}
                />
              </div>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('sections.checklist')}</h2>
            <div className="space-y-6">
              {checklistItems.map((item, index) => (
                <motion.div
                  key={item.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {item.label}
                  </label>
                  {item.type === 'textarea' ? (
                    <textarea
                      value={formData[item.key as keyof typeof formData] || ''}
                      onChange={(e) => handleChange(item.key, e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                      placeholder={item.placeholder}
                    />
                  ) : (
                    <input
                      type={item.type}
                      value={formData[item.key as keyof typeof formData] || ''}
                      onChange={(e) => handleChange(item.key, e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      placeholder={item.placeholder}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              {t('privacy')}
            </p>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  {t('submitting')}
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="h-5 w-5" />
                  {t('submit')}
                </>
              )}
            </button>
          </div>

          {errors.submit && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}
        </motion.form>
      </div>
    </section>
  )
}

export default ChecklistForm

