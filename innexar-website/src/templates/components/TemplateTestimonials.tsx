'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import type { TestimonialItem, TemplateColors } from '../types'

interface TemplateTestimonialsProps {
    title: string
    subtitle?: string
    items: TestimonialItem[]
    colors: TemplateColors
    variant?: 'carousel' | 'grid' | 'masonry'
}

function StarRating({ rating, colors }: { rating: number; colors: TemplateColors }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={18}
                    className={star <= rating ? 'fill-current' : ''}
                    style={{ color: star <= rating ? colors.accent : colors.textMuted + '50' }}
                />
            ))}
        </div>
    )
}

export function TemplateTestimonials({
    title,
    subtitle,
    items,
    colors,
    variant = 'carousel',
}: TemplateTestimonialsProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    const nextTestimonial = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length)
    }

    const prevTestimonial = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)
    }

    if (variant === 'grid') {
        return (
            <section
                className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8"
                style={{ backgroundColor: colors.background }}
            >
                <div className="max-w-7xl mx-auto">
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
                            <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.textMuted }}>
                                {subtitle}
                            </p>
                        )}
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {items.map((testimonial, index) => (
                            <motion.div
                                key={testimonial.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="p-8 rounded-2xl relative"
                                style={{ backgroundColor: colors.backgroundAlt }}
                            >
                                <Quote
                                    className="absolute top-6 right-6 opacity-20"
                                    size={40}
                                    style={{ color: colors.primary }}
                                />
                                <StarRating rating={testimonial.rating} colors={colors} />
                                <p
                                    className="mt-4 mb-6 leading-relaxed"
                                    style={{ color: colors.text }}
                                >
                                    "{testimonial.content}"
                                </p>
                                <div className="flex items-center gap-4">
                                    {testimonial.image ? (
                                        <Image
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            width={48}
                                            height={48}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                                            style={{ backgroundColor: colors.primary }}
                                        >
                                            {testimonial.name.charAt(0)}
                                        </div>
                                    )}
                                    <div>
                                        <p className="font-semibold" style={{ color: colors.text }}>
                                            {testimonial.name}
                                        </p>
                                        <p className="text-sm" style={{ color: colors.textMuted }}>
                                            {testimonial.role}
                                            {testimonial.company && `, ${testimonial.company}`}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    // Carousel variant
    return (
        <section
            className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 overflow-hidden"
            style={{ backgroundColor: colors.background }}
        >
            <div className="max-w-5xl mx-auto">
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
                        <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.textMuted }}>
                            {subtitle}
                        </p>
                    )}
                </motion.div>

                <div className="relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="text-center p-8 lg:p-12 rounded-3xl"
                            style={{ backgroundColor: colors.backgroundAlt }}
                        >
                            <Quote
                                className="mx-auto mb-6 opacity-30"
                                size={48}
                                style={{ color: colors.primary }}
                            />
                            <p
                                className="text-xl lg:text-2xl mb-8 leading-relaxed max-w-3xl mx-auto"
                                style={{ color: colors.text }}
                            >
                                "{items[currentIndex].content}"
                            </p>
                            <StarRating rating={items[currentIndex].rating} colors={colors} />
                            <div className="flex items-center justify-center gap-4 mt-6">
                                {items[currentIndex].image ? (
                                    <Image
                                        src={items[currentIndex].image!}
                                        alt={items[currentIndex].name}
                                        width={64}
                                        height={64}
                                        className="rounded-full"
                                    />
                                ) : (
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
                                        style={{ backgroundColor: colors.primary }}
                                    >
                                        {items[currentIndex].name.charAt(0)}
                                    </div>
                                )}
                                <div className="text-left">
                                    <p className="font-bold text-lg" style={{ color: colors.text }}>
                                        {items[currentIndex].name}
                                    </p>
                                    <p style={{ color: colors.textMuted }}>
                                        {items[currentIndex].role}
                                        {items[currentIndex].company && `, ${items[currentIndex].company}`}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    {items.length > 1 && (
                        <>
                            <button
                                onClick={prevTestimonial}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-16 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                style={{ backgroundColor: colors.primary, color: '#fff' }}
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={nextTestimonial}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-16 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
                                style={{ backgroundColor: colors.primary, color: '#fff' }}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </>
                    )}
                </div>

                {/* Dots */}
                {items.length > 1 && (
                    <div className="flex justify-center gap-2 mt-8">
                        {items.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className="w-3 h-3 rounded-full transition-all"
                                style={{
                                    backgroundColor: index === currentIndex ? colors.primary : colors.textMuted + '40',
                                    transform: index === currentIndex ? 'scale(1.2)' : 'scale(1)',
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}
