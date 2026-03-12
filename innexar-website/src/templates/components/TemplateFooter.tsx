'use client'

import Link from 'next/link'
import Image from 'next/image'
import {
    Phone,
    Mail,
    MapPin,
    Facebook,
    Instagram,
    Linkedin,
    Youtube,
    MessageCircle,
} from 'lucide-react'
import type { FooterConfig, ContactConfig, NavItem, TemplateColors } from '../types'

interface TemplateFooterProps {
    businessName: string
    logo?: string
    footer: FooterConfig
    contact: ContactConfig
    navigation: NavItem[]
    colors: TemplateColors
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

export function TemplateFooter({
    businessName,
    logo,
    footer,
    contact,
    navigation,
    colors,
}: TemplateFooterProps) {
    const currentYear = new Date().getFullYear()

    return (
        <footer style={{ backgroundColor: colors.secondary }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Brand Column */}
                    <div className="lg:col-span-1">
                        {logo ? (
                            <Image
                                src={logo}
                                alt={businessName}
                                width={160}
                                height={40}
                                className="h-10 w-auto mb-6 brightness-0 invert"
                            />
                        ) : (
                            <h3 className="text-2xl font-bold text-white mb-6">{businessName}</h3>
                        )}
                        <p className="text-white/70 mb-6 leading-relaxed">
                            We're committed to providing exceptional service and creating lasting relationships with our clients.
                        </p>

                        {/* Social Links */}
                        {footer.showSocialLinks && Object.keys(contact.socialLinks).length > 0 && (
                            <div className="flex gap-3">
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
                                            className="w-10 h-10 rounded-lg flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-colors"
                                        >
                                            <Icon className="w-5 h-5" />
                                        </a>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-white font-semibold text-lg mb-6">Quick Links</h4>
                        <ul className="space-y-3">
                            {navigation.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="text-white/70 hover:text-white transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Custom Columns */}
                    {footer.columns?.map((column) => (
                        <div key={column.title}>
                            <h4 className="text-white font-semibold text-lg mb-6">{column.title}</h4>
                            <ul className="space-y-3">
                                {column.links.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            className="text-white/70 hover:text-white transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}

                    {/* Contact Column */}
                    <div>
                        <h4 className="text-white font-semibold text-lg mb-6">Contact Us</h4>
                        <ul className="space-y-4">
                            <li>
                                <a
                                    href={`tel:${contact.phone}`}
                                    className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                                >
                                    <Phone className="w-5 h-5" style={{ color: colors.accent }} />
                                    {contact.phone}
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`mailto:${contact.email}`}
                                    className="flex items-center gap-3 text-white/70 hover:text-white transition-colors"
                                >
                                    <Mail className="w-5 h-5" style={{ color: colors.accent }} />
                                    {contact.email}
                                </a>
                            </li>
                            <li className="flex items-start gap-3 text-white/70">
                                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: colors.accent }} />
                                <span>
                                    {contact.address}<br />
                                    {contact.city}, {contact.state}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-white/60 text-sm text-center md:text-left">
                            {footer.copyright.replace('{year}', String(currentYear))}
                        </p>
                        <p className="text-white/40 text-sm">
                            Powered by{' '}
                            <a
                                href="https://innexar.app"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white transition-colors"
                            >
                                Innexar
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
