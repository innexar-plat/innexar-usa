'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import * as LucideIcons from 'lucide-react'
import type { ServiceItem, TemplateColors } from '../types'
// Lucide icons use 'color' prop directly

interface TemplateServicesProps {
    title: string
    subtitle?: string
    items: ServiceItem[]
    colors: TemplateColors
    variant?: 'grid' | 'cards' | 'list'
    columns?: 2 | 3 | 4
}

// Icon component that renders Lucide icons dynamically
function DynamicIcon({ name, className, color }: { name: string; className?: string; color?: string }) {
    // Check if it's an emoji
    if (name.length <= 4 && /\p{Emoji}/u.test(name)) {
        return <span className={className} style={{ color }}>{name}</span>
    }

    // Try to get Lucide icon - use any to avoid complex type issues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const IconComponent = (LucideIcons as any)[name]
    if (IconComponent) {
        return <IconComponent className={className} color={color} />
    }

    // Fallback
    return <LucideIcons.Star className={className} color={color} />
}

export function TemplateServices({
    title,
    subtitle,
    items,
    colors,
    variant = 'cards',
    columns = 3,
}: TemplateServicesProps) {
    const gridCols = {
        2: 'md:grid-cols-2',
        3: 'md:grid-cols-2 lg:grid-cols-3',
        4: 'md:grid-cols-2 lg:grid-cols-4',
    }[columns]

    return (
        <section
            className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8"
            style={{ backgroundColor: colors.background }}
        >
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2
                        className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
                        style={{ color: colors.text }}
                    >
                        {title}
                    </h2>
                    {subtitle && (
                        <p
                            className="text-lg max-w-2xl mx-auto"
                            style={{ color: colors.textMuted }}
                        >
                            {subtitle}
                        </p>
                    )}
                </motion.div>

                {/* Services Grid */}
                <div className={`grid gap-8 ${gridCols}`}>
                    {items.map((service, index) => (
                        <motion.div
                            key={service.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl ${variant === 'cards' ? 'p-8' : 'p-6'
                                }`}
                            style={{
                                backgroundColor: colors.backgroundAlt,
                            }}
                        >
                            {/* Icon */}
                            <div
                                className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                                style={{ backgroundColor: colors.primary + '20' }}
                            >
                                <DynamicIcon
                                    name={service.icon}
                                    className="w-7 h-7"
                                    color={colors.primary}
                                />
                            </div>

                            {/* Content */}
                            <h3
                                className="text-xl font-bold mb-3"
                                style={{ color: colors.text }}
                            >
                                {service.title}
                            </h3>
                            <p
                                className="mb-4 leading-relaxed"
                                style={{ color: colors.textMuted }}
                            >
                                {service.description}
                            </p>

                            {/* Price */}
                            {service.price && (
                                <p
                                    className="text-lg font-bold"
                                    style={{ color: colors.primary }}
                                >
                                    {service.price}
                                </p>
                            )}

                            {/* Features List */}
                            {service.features && service.features.length > 0 && (
                                <ul className="mt-4 space-y-2">
                                    {service.features.map((feature, i) => (
                                        <li
                                            key={i}
                                            className="flex items-center gap-2 text-sm"
                                            style={{ color: colors.textMuted }}
                                        >
                                            <LucideIcons.Check
                                                className="w-4 h-4"
                                                style={{ color: colors.accent }}
                                            />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Hover Effect Border */}
                            <div
                                className="absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                                style={{ backgroundColor: colors.primary }}
                            />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
