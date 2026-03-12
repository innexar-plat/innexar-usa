'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { AboutConfig, TemplateColors } from '../types'

interface TemplateAboutProps {
    about: AboutConfig
    colors: TemplateColors
    variant?: 'standard' | 'split' | 'full-width'
    imagePosition?: 'left' | 'right'
}

export function TemplateAbout({
    about,
    colors,
    variant = 'split',
    imagePosition = 'right',
}: TemplateAboutProps) {
    return (
        <section
            className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8"
            style={{ backgroundColor: colors.backgroundAlt }}
        >
            <div className="max-w-7xl mx-auto">
                <div
                    className={`grid gap-12 lg:gap-16 items-center ${variant === 'split' ? 'lg:grid-cols-2' : ''
                        }`}
                >
                    {/* Image Side */}
                    {about.image && variant === 'split' && (
                        <motion.div
                            initial={{ opacity: 0, x: imagePosition === 'left' ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className={`relative ${imagePosition === 'right' ? 'lg:order-2' : ''}`}
                        >
                            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                                <Image
                                    src={about.image}
                                    alt={about.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            {/* Decorative Element */}
                            <div
                                className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl -z-10"
                                style={{ backgroundColor: colors.primary + '30' }}
                            />
                        </motion.div>
                    )}

                    {/* Content Side */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className={imagePosition === 'right' ? 'lg:order-1' : ''}
                    >
                        {about.subtitle && (
                            <p
                                className="text-sm font-semibold uppercase tracking-wider mb-3"
                                style={{ color: colors.primary }}
                            >
                                {about.subtitle}
                            </p>
                        )}

                        <h2
                            className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
                            style={{ color: colors.text }}
                        >
                            {about.title}
                        </h2>

                        <div
                            className="prose prose-lg max-w-none mb-8"
                            style={{ color: colors.textMuted }}
                        >
                            <p className="leading-relaxed">{about.content}</p>
                        </div>

                        {/* Features List */}
                        {about.features && about.features.length > 0 && (
                            <ul className="grid grid-cols-2 gap-4 mb-8">
                                {about.features.map((feature, index) => (
                                    <motion.li
                                        key={feature}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div
                                            className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: colors.primary + '20' }}
                                        >
                                            <svg
                                                className="w-4 h-4"
                                                style={{ color: colors.primary }}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        </div>
                                        <span style={{ color: colors.text }}>{feature}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        )}

                        {/* Stats */}
                        {about.stats && about.stats.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-gray-200">
                                {about.stats.map((stat, index) => (
                                    <motion.div
                                        key={stat.label}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                        className="text-center"
                                    >
                                        <p
                                            className="text-3xl lg:text-4xl font-bold mb-1"
                                            style={{ color: colors.primary }}
                                        >
                                            {stat.value}
                                        </p>
                                        <p
                                            className="text-sm"
                                            style={{ color: colors.textMuted }}
                                        >
                                            {stat.label}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Owner Info */}
                        {about.ownerName && (
                            <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200">
                                {about.ownerImage && (
                                    <Image
                                        src={about.ownerImage}
                                        alt={about.ownerName}
                                        width={64}
                                        height={64}
                                        className="rounded-full"
                                    />
                                )}
                                <div>
                                    <p
                                        className="font-bold"
                                        style={{ color: colors.text }}
                                    >
                                        {about.ownerName}
                                    </p>
                                    {about.ownerTitle && (
                                        <p
                                            className="text-sm"
                                            style={{ color: colors.textMuted }}
                                        >
                                            {about.ownerTitle}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
