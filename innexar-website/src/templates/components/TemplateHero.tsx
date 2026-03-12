'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import type { HeroConfig, TemplateColors } from '../types'

interface TemplateHeroProps {
    hero: HeroConfig
    colors: TemplateColors
    variant?: 'centered' | 'left' | 'split'
    height?: 'full' | 'large' | 'medium'
}

export function TemplateHero({
    hero,
    colors,
    variant = 'centered',
    height = 'large',
}: TemplateHeroProps) {
    const heightClass = {
        full: 'min-h-screen',
        large: 'min-h-[85vh]',
        medium: 'min-h-[70vh]',
    }[height]

    const alignClass = {
        centered: 'text-center items-center justify-center',
        left: 'text-left items-start justify-center',
        split: 'text-left items-center justify-start lg:justify-center',
    }[variant]

    return (
        <section
            className={`relative ${heightClass} flex ${alignClass} px-4 sm:px-6 lg:px-8 overflow-hidden`}
            style={{
                backgroundColor: colors.secondary,
            }}
        >
            {/* Background Image/Video */}
            {hero.backgroundImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${hero.backgroundImage})` }}
                />
            )}

            {/* Overlay */}
            {(hero.overlay || hero.backgroundImage) && (
                <div className="absolute inset-0 bg-black/50" />
            )}

            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl"
                    style={{ backgroundColor: colors.accent }}
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.1, 0.2, 0.1],
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl"
                    style={{ backgroundColor: colors.primary }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-5xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className={`text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight ${variant === 'centered' ? 'max-w-4xl mx-auto' : 'max-w-2xl'
                        }`}
                >
                    {hero.title}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className={`text-lg sm:text-xl text-white/90 mb-10 ${variant === 'centered' ? 'max-w-2xl mx-auto' : 'max-w-xl'
                        }`}
                >
                    {hero.subtitle}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className={`flex flex-col sm:flex-row gap-4 ${variant === 'centered' ? 'justify-center' : 'justify-start'
                        }`}
                >
                    <Link
                        href={hero.cta.href}
                        className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg transition-all hover:scale-105 shadow-lg"
                        style={{
                            backgroundColor: colors.accent,
                            color: colors.secondary,
                        }}
                    >
                        {hero.cta.text}
                    </Link>

                    {hero.secondaryCta && (
                        <Link
                            href={hero.secondaryCta.href}
                            className="inline-flex items-center justify-center px-8 py-4 rounded-lg font-bold text-lg border-2 border-white/30 text-white hover:bg-white/10 transition-all"
                        >
                            {hero.secondaryCta.text}
                        </Link>
                    )}
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center pt-2">
                    <div className="w-1.5 h-3 bg-white/70 rounded-full" />
                </div>
            </motion.div>
        </section>
    )
}
