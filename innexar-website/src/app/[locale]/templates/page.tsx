'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Eye, Search, Filter, ExternalLink } from 'lucide-react'
import { templateRegistry, getCategories } from '@/templates/registry'

export default function TemplateGalleryPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    const categories = getCategories()

    const filteredTemplates = templateRegistry.filter((template) => {
        const matchesSearch =
            template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesCategory = !selectedCategory || template.category === selectedCategory

        return matchesSearch && matchesCategory
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
            {/* Header */}
            <header className="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white">Template Gallery</h1>
                            <p className="text-gray-400 mt-1">
                                Choose from our professionally designed templates
                            </p>
                        </div>
                        <Link
                            href="/"
                            className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-12">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search templates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === null
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            All
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Template Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredTemplates.map((template, index) => (
                        <motion.div
                            key={template.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-[16/10] overflow-hidden">
                                <Image
                                    src={template.thumbnail}
                                    alt={template.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-6 gap-4">
                                    <Link
                                        href={`/templates/preview/${template.id}`}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Preview
                                    </Link>
                                    <Link
                                        href={`/templates/preview/${template.id}`}
                                        target="_blank"
                                        className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Full Screen
                                    </Link>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-bold text-white">{template.name}</h3>
                                    <span className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300">
                                        {template.category}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm mb-4">{template.description}</p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2">
                                    {template.tags.slice(0, 4).map((tag) => (
                                        <span
                                            key={tag}
                                            className="text-xs px-2 py-1 rounded bg-gray-700/50 text-gray-400"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* No Results */}
                {filteredTemplates.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg">No templates found matching your criteria.</p>
                        <button
                            onClick={() => {
                                setSearchQuery('')
                                setSelectedCategory(null)
                            }}
                            className="mt-4 text-blue-400 hover:text-blue-300"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
