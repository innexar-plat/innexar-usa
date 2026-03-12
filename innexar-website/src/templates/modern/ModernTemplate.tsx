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

interface ModernTemplateProps {
    config: TemplateConfig
}

export function ModernTemplate({ config }: ModernTemplateProps) {
    const headerCta = {
        text: config.hero.cta.text,
        href: '#contact',
    }

    return (
        <div className="min-h-screen" style={{ fontFamily: config.fontFamily }}>
            <TemplateHeader
                businessName={config.businessName}
                logo={config.logo}
                navigation={config.navigation}
                cta={headerCta}
                colors={config.colors}
            />

            <main>
                <TemplateHero
                    hero={config.hero}
                    colors={config.colors}
                    variant="centered"
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

// Default configuration for demo/preview
export const defaultModernConfig: TemplateConfig = {
    templateId: 'modern',
    templateName: 'Modern',

    businessName: 'Acme Solutions',
    tagline: 'Innovative Solutions for Modern Business',

    colors: {
        primary: '#3B82F6',
        secondary: '#1E40AF',
        accent: '#60A5FA',
        background: '#FFFFFF',
        backgroundAlt: '#F3F4F6',
        text: '#111827',
        textMuted: '#6B7280',
    },

    navigation: [
        { label: 'Home', href: '#' },
        { label: 'Services', href: '#services' },
        { label: 'About', href: '#about' },
        { label: 'Testimonials', href: '#testimonials' },
        { label: 'Contact', href: '#contact' },
    ],

    hero: {
        title: 'Transform Your Business with Cutting-Edge Solutions',
        subtitle: 'We help businesses grow through innovative strategies, expert guidance, and proven results. Let us take your company to the next level.',
        backgroundImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80',
        overlay: true,
        cta: { text: 'Get Started Today', href: '#contact' },
        secondaryCta: { text: 'Learn More', href: '#services' },
    },

    services: {
        title: 'Our Services',
        subtitle: 'Comprehensive solutions tailored to your business needs',
        items: [
            {
                icon: 'Lightbulb',
                title: 'Strategic Consulting',
                description: 'Expert guidance to help you navigate complex business challenges and identify growth opportunities.',
                features: ['Market Analysis', 'Growth Strategy', 'Competitive Research'],
            },
            {
                icon: 'BarChart3',
                title: 'Data Analytics',
                description: 'Transform your data into actionable insights that drive informed decision-making.',
                features: ['Custom Dashboards', 'Predictive Analytics', 'Performance Tracking'],
            },
            {
                icon: 'Users',
                title: 'Team Development',
                description: 'Build and nurture high-performing teams that exceed expectations.',
                features: ['Leadership Training', 'Team Building', 'Performance Coaching'],
            },
            {
                icon: 'Rocket',
                title: 'Digital Transformation',
                description: 'Modernize your operations with cutting-edge technology solutions.',
                features: ['Process Automation', 'Cloud Migration', 'Digital Strategy'],
            },
            {
                icon: 'Target',
                title: 'Marketing Strategy',
                description: 'Reach your target audience with effective marketing campaigns.',
                features: ['Brand Development', 'Content Strategy', 'Lead Generation'],
            },
            {
                icon: 'Shield',
                title: 'Risk Management',
                description: 'Identify and mitigate risks to protect your business interests.',
                features: ['Risk Assessment', 'Compliance', 'Contingency Planning'],
            },
        ],
    },

    about: {
        title: 'About Our Company',
        subtitle: 'Who We Are',
        content: 'With over 15 years of experience, we\'ve helped hundreds of businesses achieve their goals. Our team of experts combines industry knowledge with innovative thinking to deliver results that matter. We believe in building lasting partnerships with our clients, understanding their unique challenges, and crafting customized solutions.',
        image: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80',
        features: [
            'Industry-leading expertise',
            'Proven track record',
            'Customized solutions',
            '24/7 support',
        ],
        stats: [
            { value: '500+', label: 'Clients Served' },
            { value: '15+', label: 'Years Experience' },
            { value: '98%', label: 'Client Satisfaction' },
            { value: '50+', label: 'Team Members' },
        ],
    },

    testimonials: {
        title: 'What Our Clients Say',
        subtitle: 'Trusted by businesses across industries',
        items: [
            {
                name: 'Sarah Johnson',
                role: 'CEO',
                company: 'TechStart Inc',
                content: 'Working with this team transformed our business. Their strategic insights helped us double our revenue in just one year.',
                rating: 5,
            },
            {
                name: 'Michael Chen',
                role: 'Operations Director',
                company: 'Global Logistics',
                content: 'The expertise and dedication they bring to every project is unmatched. Highly recommend their services.',
                rating: 5,
            },
            {
                name: 'Emily Rodriguez',
                role: 'Marketing Manager',
                company: 'Creative Studios',
                content: 'Their marketing strategy took our brand to new heights. We\'ve seen a 300% increase in qualified leads.',
                rating: 5,
            },
        ],
    },

    contact: {
        title: 'Get In Touch',
        subtitle: "Ready to take your business to the next level? Let's talk.",
        phone: '(555) 123-4567',
        email: 'hello@acmesolutions.com',
        address: '123 Business Ave, Suite 100',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        hours: {
            'Monday - Friday': '9:00 AM - 6:00 PM',
            'Saturday': '10:00 AM - 4:00 PM',
            'Sunday': 'Closed',
        },
        socialLinks: {
            facebook: 'https://facebook.com',
            instagram: 'https://instagram.com',
            linkedin: 'https://linkedin.com',
        },
        formEnabled: true,
    },

    footer: {
        columns: [
            {
                title: 'Services',
                links: [
                    { label: 'Consulting', href: '#' },
                    { label: 'Analytics', href: '#' },
                    { label: 'Marketing', href: '#' },
                    { label: 'Development', href: '#' },
                ],
            },
        ],
        copyright: '© {year} Acme Solutions. All rights reserved.',
        showSocialLinks: true,
    },

    seo: {
        title: 'Acme Solutions | Innovative Business Solutions',
        description: 'Transform your business with our cutting-edge solutions. Expert consulting, data analytics, and digital transformation services.',
        keywords: ['business consulting', 'data analytics', 'digital transformation', 'marketing strategy'],
    },
}
