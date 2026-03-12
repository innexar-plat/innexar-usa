'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Phone } from 'lucide-react'
import type { NavItem, CTAButton, TemplateColors } from '../types'

interface TemplateHeaderProps {
    businessName: string
    logo?: string
    navigation: NavItem[]
    cta?: CTAButton
    colors: TemplateColors
    transparent?: boolean
}

export function TemplateHeader({
    businessName,
    logo,
    navigation,
    cta,
    colors,
    transparent = false,
}: TemplateHeaderProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${transparent ? 'bg-transparent' : 'bg-white shadow-md'
                }`}
            style={{
                backgroundColor: transparent ? 'transparent' : colors.background,
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-3">
                        {logo ? (
                            <Image
                                src={logo}
                                alt={businessName}
                                width={160}
                                height={40}
                                className="h-10 w-auto"
                            />
                        ) : (
                            <span
                                className="text-2xl font-bold"
                                style={{ color: colors.primary }}
                            >
                                {businessName}
                            </span>
                        )}
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-8">
                        {navigation.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm font-medium transition-colors hover:opacity-80"
                                style={{ color: transparent ? '#fff' : colors.text }}
                            >
                                {item.label}
                            </Link>
                        ))}
                        {cta && (
                            <Link
                                href={cta.href}
                                className="px-6 py-2.5 rounded-lg font-semibold transition-all hover:scale-105"
                                style={{
                                    backgroundColor: colors.primary,
                                    color: '#fff',
                                }}
                            >
                                {cta.text}
                            </Link>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2 rounded-lg"
                        style={{ color: transparent ? '#fff' : colors.text }}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden overflow-hidden"
                        style={{ backgroundColor: colors.background }}
                    >
                        <nav className="px-4 py-6 space-y-4">
                            {navigation.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block text-lg font-medium py-2"
                                    style={{ color: colors.text }}
                                >
                                    {item.label}
                                </Link>
                            ))}
                            {cta && (
                                <Link
                                    href={cta.href}
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full text-center px-6 py-3 rounded-lg font-semibold mt-4"
                                    style={{
                                        backgroundColor: colors.primary,
                                        color: '#fff',
                                    }}
                                >
                                    {cta.text}
                                </Link>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    )
}
