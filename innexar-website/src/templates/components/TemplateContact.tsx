'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    Send,
    Facebook,
    Instagram,
    Linkedin,
    Youtube,
    MessageCircle,
} from 'lucide-react'
import type { ContactConfig, TemplateColors } from '../types'

interface TemplateContactProps {
    contact: ContactConfig
    colors: TemplateColors
    variant?: 'split' | 'centered' | 'minimal'
}

const socialIcons = {
    facebook: Facebook,
    instagram: Instagram,
    linkedin: Linkedin,
    youtube: Youtube,
    whatsapp: MessageCircle,
    twitter: () => (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
}

export function TemplateContact({
    contact,
    colors,
    variant = 'split',
}: TemplateContactProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setSubmitted(true)
        setIsSubmitting(false)
    }

    return (
        <section
            id="contact"
            className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8"
            style={{ backgroundColor: colors.backgroundAlt }}
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
                        {contact.title}
                    </h2>
                    {contact.subtitle && (
                        <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.textMuted }}>
                            {contact.subtitle}
                        </p>
                    )}
                </motion.div>

                <div className={`grid gap-12 ${variant === 'split' ? 'lg:grid-cols-2' : ''}`}>
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="space-y-6">
                            {/* Phone */}
                            <a
                                href={`tel:${contact.phone}`}
                                className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-102"
                                style={{ backgroundColor: colors.background }}
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: colors.primary + '20' }}
                                >
                                    <Phone className="w-6 h-6" style={{ color: colors.primary }} />
                                </div>
                                <div>
                                    <p className="text-sm" style={{ color: colors.textMuted }}>
                                        Phone
                                    </p>
                                    <p className="font-semibold text-lg" style={{ color: colors.text }}>
                                        {contact.phone}
                                    </p>
                                </div>
                            </a>

                            {/* Email */}
                            <a
                                href={`mailto:${contact.email}`}
                                className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-102"
                                style={{ backgroundColor: colors.background }}
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                    style={{ backgroundColor: colors.primary + '20' }}
                                >
                                    <Mail className="w-6 h-6" style={{ color: colors.primary }} />
                                </div>
                                <div>
                                    <p className="text-sm" style={{ color: colors.textMuted }}>
                                        Email
                                    </p>
                                    <p className="font-semibold text-lg" style={{ color: colors.text }}>
                                        {contact.email}
                                    </p>
                                </div>
                            </a>

                            {/* Address */}
                            <div
                                className="flex items-start gap-4 p-4 rounded-xl"
                                style={{ backgroundColor: colors.background }}
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                    style={{ backgroundColor: colors.primary + '20' }}
                                >
                                    <MapPin className="w-6 h-6" style={{ color: colors.primary }} />
                                </div>
                                <div>
                                    <p className="text-sm" style={{ color: colors.textMuted }}>
                                        Address
                                    </p>
                                    <p className="font-semibold" style={{ color: colors.text }}>
                                        {contact.address}
                                    </p>
                                    <p style={{ color: colors.textMuted }}>
                                        {contact.city}, {contact.state} {contact.zipCode}
                                    </p>
                                </div>
                            </div>

                            {/* Hours */}
                            <div
                                className="p-4 rounded-xl"
                                style={{ backgroundColor: colors.background }}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <Clock className="w-5 h-5" style={{ color: colors.primary }} />
                                    <p className="font-semibold" style={{ color: colors.text }}>
                                        Business Hours
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    {Object.entries(contact.hours).map(([day, hours]) => (
                                        <div key={day} className="flex justify-between text-sm">
                                            <span className="capitalize" style={{ color: colors.textMuted }}>
                                                {day}
                                            </span>
                                            <span style={{ color: colors.text }}>{hours}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Social Links */}
                            {Object.keys(contact.socialLinks).length > 0 && (
                                <div className="flex gap-3 pt-4">
                                    {Object.entries(contact.socialLinks).map(([platform, url]) => {
                                        if (!url) return null
                                        const Icon = socialIcons[platform as keyof typeof socialIcons]
                                        if (!Icon) return null
                                        return (
                                            <a
                                                key={platform}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                                                style={{ backgroundColor: colors.primary, color: '#fff' }}
                                            >
                                                <Icon className="w-5 h-5" />
                                            </a>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    {contact.formEnabled && (
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            {submitted ? (
                                <div
                                    className="p-8 rounded-2xl text-center"
                                    style={{ backgroundColor: colors.background }}
                                >
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                                        style={{ backgroundColor: colors.primary + '20' }}
                                    >
                                        <Send className="w-8 h-8" style={{ color: colors.primary }} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>
                                        Message Sent!
                                    </h3>
                                    <p style={{ color: colors.textMuted }}>
                                        Thank you for reaching out. We'll get back to you within 24 hours.
                                    </p>
                                </div>
                            ) : (
                                <form
                                    onSubmit={handleSubmit}
                                    className="p-8 rounded-2xl space-y-6"
                                    style={{ backgroundColor: colors.background }}
                                >
                                    <div>
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            style={{ color: colors.text }}
                                        >
                                            Your Name *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                                            style={{
                                                borderColor: colors.textMuted + '30',
                                                backgroundColor: colors.backgroundAlt,
                                                color: colors.text,
                                            }}
                                            placeholder="John Doe"
                                        />
                                    </div>

                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div>
                                            <label
                                                className="block text-sm font-medium mb-2"
                                                style={{ color: colors.text }}
                                            >
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                                                style={{
                                                    borderColor: colors.textMuted + '30',
                                                    backgroundColor: colors.backgroundAlt,
                                                    color: colors.text,
                                                }}
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label
                                                className="block text-sm font-medium mb-2"
                                                style={{ color: colors.text }}
                                            >
                                                Phone
                                            </label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2"
                                                style={{
                                                    borderColor: colors.textMuted + '30',
                                                    backgroundColor: colors.backgroundAlt,
                                                    color: colors.text,
                                                }}
                                                placeholder="(555) 123-4567"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            className="block text-sm font-medium mb-2"
                                            style={{ color: colors.text }}
                                        >
                                            Message *
                                        </label>
                                        <textarea
                                            required
                                            rows={5}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 resize-none"
                                            style={{
                                                borderColor: colors.textMuted + '30',
                                                backgroundColor: colors.backgroundAlt,
                                                color: colors.text,
                                            }}
                                            placeholder="How can we help you?"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full py-4 rounded-xl font-bold text-lg transition-all hover:scale-102 disabled:opacity-50 flex items-center justify-center gap-2"
                                        style={{ backgroundColor: colors.primary, color: '#fff' }}
                                    >
                                        {isSubmitting ? (
                                            'Sending...'
                                        ) : (
                                            <>
                                                <Send className="w-5 h-5" />
                                                Send Message
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Map */}
                {contact.mapEmbed && (
                    <div className="mt-12 rounded-2xl overflow-hidden h-80">
                        <iframe
                            src={contact.mapEmbed}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        />
                    </div>
                )}
            </div>
        </section>
    )
}
