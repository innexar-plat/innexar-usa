'use client'

import {
    TemplateHeader,
    TemplateHero,
    TemplateServices,
    TemplateAbout,
    TemplateTestimonials,
    TemplateContact,
    TemplateFooter,
} from '../components'
import type { TemplateConfig } from '../types'

interface JusticeTemplateProps {
    config: TemplateConfig
}

export function JusticeTemplate({ config }: JusticeTemplateProps) {
    return (
        <div className="min-h-screen" style={{ fontFamily: config.fontFamily || "'Cormorant Garamond', serif" }}>
            <TemplateHeader
                businessName={config.businessName}
                logo={config.logo}
                navigation={config.navigation}
                cta={{ text: 'Free Consultation', href: '#contact' }}
                colors={config.colors}
            />

            <main>
                <TemplateHero
                    hero={config.hero}
                    colors={config.colors}
                    variant="left"
                    height="large"
                />

                <TemplateServices
                    title={config.services.title}
                    subtitle={config.services.subtitle}
                    items={config.services.items}
                    colors={config.colors}
                    variant="cards"
                    columns={3}
                />

                <TemplateAbout
                    about={config.about}
                    colors={config.colors}
                    variant="split"
                    imagePosition="right"
                />

                <TemplateTestimonials
                    title={config.testimonials.title}
                    subtitle={config.testimonials.subtitle}
                    items={config.testimonials.items}
                    colors={config.colors}
                    variant="carousel"
                />

                <TemplateContact
                    contact={config.contact}
                    colors={config.colors}
                    variant="split"
                />
            </main>

            <TemplateFooter
                businessName={config.businessName}
                logo={config.logo}
                footer={config.footer}
                contact={config.contact}
                navigation={config.navigation}
                colors={config.colors}
            />
        </div>
    )
}

export const defaultJusticeConfig: TemplateConfig = {
    templateId: 'justice',
    templateName: 'Justice',

    businessName: 'Harrison & Associates',
    tagline: 'Excellence in Legal Representation',

    colors: {
        primary: '#1E3A5F',
        secondary: '#0F172A',
        accent: '#D4AF37',
        background: '#F8FAFC',
        backgroundAlt: '#E2E8F0',
        text: '#0F172A',
        textMuted: '#64748B',
    },

    navigation: [
        { label: 'Home', href: '#' },
        { label: 'Practice Areas', href: '#services' },
        { label: 'About Us', href: '#about' },
        { label: 'Testimonials', href: '#testimonials' },
        { label: 'Contact', href: '#contact' },
    ],

    hero: {
        title: 'Protecting Your Rights with Expertise & Dedication',
        subtitle: 'With over 25 years of combined experience, our attorneys provide aggressive representation and personalized legal solutions for individuals and businesses.',
        backgroundImage: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1920&q=80',
        overlay: true,
        cta: { text: 'Schedule Free Consultation', href: '#contact' },
        secondaryCta: { text: 'Our Practice Areas', href: '#services' },
    },

    services: {
        title: 'Practice Areas',
        subtitle: 'Comprehensive legal services to protect your interests',
        items: [
            {
                icon: 'Scale',
                title: 'Personal Injury',
                description: 'We fight for maximum compensation for accident victims. Car accidents, slip and falls, and medical malpractice.',
                features: ['Free Case Review', 'No Win, No Fee', 'Millions Recovered'],
            },
            {
                icon: 'Briefcase',
                title: 'Business Law',
                description: 'Protect your business with expert legal guidance. Formation, contracts, litigation, and compliance.',
                features: ['Contract Review', 'Business Formation', 'Dispute Resolution'],
            },
            {
                icon: 'Home',
                title: 'Real Estate Law',
                description: 'Navigate property transactions with confidence. Purchases, sales, leases, and disputes.',
                features: ['Title Review', 'Contract Negotiation', 'Closing Services'],
            },
            {
                icon: 'Users',
                title: 'Family Law',
                description: 'Compassionate representation in family matters. Divorce, custody, support, and adoption.',
                features: ['Child Custody', 'Divorce Mediation', 'Prenuptial Agreements'],
            },
            {
                icon: 'FileText',
                title: 'Estate Planning',
                description: 'Protect your legacy and loved ones. Wills, trusts, probate, and asset protection.',
                features: ['Will Preparation', 'Trust Administration', 'Probate Services'],
            },
            {
                icon: 'Shield',
                title: 'Criminal Defense',
                description: 'Aggressive defense when your freedom is at stake. DUI, felonies, and misdemeanors.',
                features: ['24/7 Availability', 'Case Dismissals', 'Reduced Charges'],
            },
        ],
    },

    about: {
        title: 'Why Choose Harrison & Associates',
        subtitle: 'Dedicated Legal Excellence',
        content: 'Founded in 1998, Harrison & Associates has built a reputation for excellence in legal representation. Our team of experienced attorneys combines deep legal knowledge with a client-first approach. We understand that legal matters can be stressful, which is why we provide clear communication, strategic counsel, and relentless advocacy for every client.',
        image: 'https://images.unsplash.com/photo-1479142506502-19b3a3b7ff33?w=800&q=80',
        ownerName: 'Robert Harrison',
        ownerTitle: 'Founding Partner',
        features: [
            'AV Preeminent® Rated',
            'Super Lawyers® Selected',
            'Client satisfaction focus',
            'Trial-ready attorneys',
        ],
        stats: [
            { value: '25+', label: 'Years Experience' },
            { value: '5000+', label: 'Cases Won' },
            { value: '$50M+', label: 'Recovered' },
            { value: '98%', label: 'Success Rate' },
        ],
    },

    testimonials: {
        title: 'Client Success Stories',
        subtitle: 'Trusted by individuals and businesses alike',
        items: [
            {
                name: 'David Thompson',
                role: 'Personal Injury Client',
                content: 'After my accident, Harrison & Associates fought tirelessly for me. They secured a settlement that covered all my medical bills and more. Forever grateful.',
                rating: 5,
            },
            {
                name: 'Jennifer Martinez',
                role: 'Business Owner',
                content: 'Their business law expertise saved my company during a complex contract dispute. Professional, thorough, and always available.',
                rating: 5,
            },
            {
                name: 'Michael Brown',
                role: 'Real Estate Investor',
                content: 'I\'ve worked with the firm on multiple property transactions. Their attention to detail and legal acumen is unmatched.',
                rating: 5,
            },
        ],
    },

    contact: {
        title: 'Free Case Consultation',
        subtitle: 'Let us review your case at no cost or obligation',
        phone: '(555) 234-5678',
        email: 'info@harrisonlaw.com',
        address: '100 Justice Center, Suite 500',
        city: 'Boston',
        state: 'MA',
        zipCode: '02108',
        hours: {
            'Monday - Friday': '8:00 AM - 6:00 PM',
            'Saturday': 'By Appointment',
            'Sunday': 'Closed',
            'Emergency': '24/7 Hotline Available',
        },
        socialLinks: {
            linkedin: 'https://linkedin.com',
            facebook: 'https://facebook.com',
        },
        formEnabled: true,
    },

    footer: {
        columns: [
            {
                title: 'Practice Areas',
                links: [
                    { label: 'Personal Injury', href: '#' },
                    { label: 'Business Law', href: '#' },
                    { label: 'Family Law', href: '#' },
                    { label: 'Estate Planning', href: '#' },
                ],
            },
        ],
        copyright: '© {year} Harrison & Associates. All rights reserved.',
        showSocialLinks: true,
    },

    seo: {
        title: 'Harrison & Associates | Trusted Law Firm',
        description: 'Expert legal representation in personal injury, business law, family law, and more. Free consultation available.',
        keywords: ['law firm', 'personal injury attorney', 'business lawyer', 'legal services'],
    },
}
