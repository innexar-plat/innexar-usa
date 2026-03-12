'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function NotFound() {
  return (
    <main className="min-h-screen">
      <Header />
      <section className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="text-center px-4">
          <h1 className="text-9xl font-bold text-gray-200 mb-4">404</h1>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Página não encontrada</h2>
          <p className="text-xl text-gray-600 mb-8">
            A página que você está procurando não existe ou foi movida.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Voltar para Home
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Entre em Contato
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  )
}

