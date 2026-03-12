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

interface EstateTemplateProps {
    config: TemplateConfig
}

export function EstateTemplate({ config }: EstateTemplateProps) {
    return (
        <div className="min-h-screen" style={{ fontFamily: config.fontFamily || "'Montserrat', sans-serif" }}>
            <TemplateHeader
                businessName={config.businessName}
                logo={config.logo}
                navigation={config.navigation}
                cta={{ text: 'Schedule Viewing', href: '#contact' }}
                colors={config.colors}
            />

            <main>
                <TemplateHero
                    hero={config.hero}
                    colors={config.colors}
                    variant="centered"
                    height="full"
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

export const defaultEstateConfig: TemplateConfig = {
    templateId: 'estate',
    templateName: 'Estate',

    businessName: 'Prestige Properties',
    tagline: 'Luxury Real Estate Excellence',

    colors: {
        primary: '#7C3AED',
        secondary: '#5B21B6',
        accent: '#A78BFA',
        background: '#FAFAFA',
        backgroundAlt: '#F5F3FF',
        text: '#1F2937',
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
        title: 'Find Your Dream Home in the Perfect Location',
        subtitle: 'Exclusive properties, personalized service, and expert guidance. Let us help you find not just a house, but the place you\'ll call home.',
        backgroundImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
        overlay: true,
        cta: { text: 'View Properties', href: '#services' },
        secondaryCta: { text: 'Contact an Agent', href: '#contact' },
    },

    services: {
        title: 'Our Services',
        subtitle: 'Full-service real estate for buyers, sellers, and investors',
        items: [
            {
                icon: 'Home',
                title: 'Luxury Homes',
                description: 'Exclusive access to premium properties in sought-after neighborhoods.',
                features: ['Private Listings', 'Gated Communities', 'Waterfront Properties'],
            },
            {
                icon: 'TrendingUp',
                title: 'Sell Your Property',
                description: 'Strategic marketing and expert negotiation to maximize your sale price.',
                features: ['Professional Staging', 'Drone Photography', 'Virtual Tours'],
            },
            {
                icon: 'Building2',
                title: 'Commercial Real Estate',
                description: 'Investment properties, retail spaces, and office buildings.',
                features: ['Market Analysis', 'Investment ROI', 'Lease Negotiation'],
            },
            {
                icon: 'Key',
                title: 'First-Time Buyers',
                description: 'Guidance through every step of purchasing your first home.',
                features: ['Mortgage Pre-Approval', 'Home Inspection', 'Closing Support'],
            },
            {
                icon: 'Map',
                title: 'Relocation Services',
                description: 'Seamless transition to a new city with local expertise.',
                features: ['Area Tours', 'School Research', 'Community Insights'],
            },
            {
                icon: 'DollarSign',
                title: 'Investment Properties',
                description: 'Build your real estate portfolio with expert investment advice.',
                features: ['Cash Flow Analysis', 'Property Management', 'Portfolio Strategy'],
            },
        ],
    },

    about: {
        title: 'Your Trusted Real Estate Partner',
        subtitle: 'Why Choose Prestige Properties',
        content: 'With over two decades of experience in luxury real estate, Prestige Properties has helped thousands of clients find their perfect properties. Our team of licensed professionals combines deep market knowledge with personalized service. We believe every client deserves the VIP treatment, whether you\'re buying your first condo or selling a multimillion-dollar estate.',
        image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
        ownerName: 'Alexandra Stone',
        ownerTitle: 'Principal Broker',
        features: [
            'Licensed professionals',
            'Personalized approach',
            'Market expertise',
            'Negotiation skills',
        ],
        stats: [
            { value: '$2B+', label: 'In Sales' },
            { value: '20+', label: 'Years Experience' },
            { value: '1500+', label: 'Homes Sold' },
            { value: '99%', label: 'Client Satisfaction' },
        ],
    },

    testimonials: {
        title: 'Client Success Stories',
        subtitle: 'Hear from our satisfied homeowners',
        items: [
            {
                name: 'The Patterson Family',
                role: 'Home Buyers',
                content: 'Prestige Properties found us our dream home in just 3 weeks. Their knowledge of the market and attention to our needs was exceptional.',
                rating: 5,
            },
            {
                name: 'Marcus Johnson',
                role: 'Home Seller',
                content: 'Sold my home for 15% above asking price! Their staging and marketing strategy was incredible. Highly recommend.',
                rating: 5,
            },
            {
                name: 'Dr. Priya Sharma',
                role: 'Investor',
                content: 'I\'ve purchased 5 investment properties through Prestige. Their market analysis and ROI projections have been spot-on every time.',
                rating: 5,
            },
        ],
    },

    contact: {
        title: 'Start Your Real Estate Journey',
        subtitle: 'Schedule a consultation with one of our expert agents',
        phone: '(555) 456-7890',
        email: 'info@prestigeproperties.com',
        address: '500 Luxury Plaza, Penthouse Suite',
        city: 'Miami',
        state: 'FL',
        zipCode: '33101',
        hours: {
            'Monday - Friday': '9:00 AM - 7:00 PM',
            'Saturday': '10:00 AM - 5:00 PM',
            'Sunday': 'By Appointment',
        },
        socialLinks: {
            instagram: 'https://instagram.com',
            facebook: 'https://facebook.com',
            linkedin: 'https://linkedin.com',
        },
        formEnabled: true,
    },

    footer: {
        columns: [
            {
                title: 'Property Types',
                links: [
                    { label: 'Single Family', href: '#' },
                    { label: 'Condos', href: '#' },
                    { label: 'Luxury Estates', href: '#' },
                    { label: 'Commercial', href: '#' },
                ],
            },
        ],
        copyright: '© {year} Prestige Properties. All rights reserved.',
        showSocialLinks: true,
    },

    seo: {
        title: 'Prestige Properties | Luxury Real Estate',
        description: 'Find your dream home with Miami\'s premier luxury real estate agency. Expert agents, exclusive listings, and personalized service.',
        keywords: ['real estate', 'luxury homes', 'property sales', 'Miami realtor', 'home buying'],
    },
}
