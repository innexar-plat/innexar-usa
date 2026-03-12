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

interface CraftTemplateProps {
    config: TemplateConfig
}

export function CraftTemplate({ config }: CraftTemplateProps) {
    return (
        <div className="min-h-screen" style={{ fontFamily: config.fontFamily || "'Work Sans', sans-serif" }}>
            <TemplateHeader
                businessName={config.businessName}
                logo={config.logo}
                navigation={config.navigation}
                cta={{ text: 'Get Free Quote', href: '#contact' }}
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
                    imagePosition="left"
                />

                <TemplateTestimonials
                    title={config.testimonials.title}
                    subtitle={config.testimonials.subtitle}
                    items={config.testimonials.items}
                    colors={config.colors}
                    variant="grid"
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

export const defaultCraftConfig: TemplateConfig = {
    templateId: 'craft',
    templateName: 'Craft',

    businessName: 'ProFix Plumbing & Electrical',
    tagline: 'Your Trusted Home Service Experts',

    colors: {
        primary: '#059669',
        secondary: '#047857',
        accent: '#10B981',
        background: '#F0FDF4',
        backgroundAlt: '#DCFCE7',
        text: '#1F2937',
        textMuted: '#6B7280',
    },

    navigation: [
        { label: 'Home', href: '#' },
        { label: 'Services', href: '#services' },
        { label: 'About Us', href: '#about' },
        { label: 'Reviews', href: '#testimonials' },
        { label: 'Contact', href: '#contact' },
    ],

    hero: {
        title: 'Fast, Reliable Home Repairs You Can Trust',
        subtitle: 'Licensed professionals available 24/7 for all your plumbing and electrical needs. No job too big or small.',
        backgroundImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1920&q=80',
        overlay: true,
        cta: { text: 'Call Now: (555) 567-8901', href: 'tel:5555678901' },
        secondaryCta: { text: 'Get Free Estimate', href: '#contact' },
    },

    services: {
        title: 'Our Services',
        subtitle: 'Professional solutions for your home',
        items: [
            {
                icon: 'Droplets',
                title: 'Plumbing Repairs',
                description: 'Leaky faucets, clogged drains, pipe repairs, and more. Fast and affordable solutions.',
                features: ['Same-Day Service', 'Upfront Pricing', 'Licensed Plumbers'],
            },
            {
                icon: 'Zap',
                title: 'Electrical Services',
                description: 'Installations, repairs, panel upgrades, and safety inspections by certified electricians.',
                features: ['Code Compliant', 'Safety First', 'Free Estimates'],
            },
            {
                icon: 'Droplet',
                title: 'Water Heater',
                description: 'Installation, repair, and maintenance of tank and tankless water heaters.',
                features: ['All Brands', 'Energy Efficient', 'Warranty Included'],
            },
            {
                icon: 'ThermometerSun',
                title: 'HVAC Services',
                description: 'Heating and cooling installation, repair, and seasonal maintenance.',
                features: ['24/7 Emergency', 'Tune-Ups', 'New Installations'],
            },
            {
                icon: 'Wrench',
                title: 'Emergency Repairs',
                description: 'Available 24/7 for urgent plumbing and electrical emergencies.',
                features: ['24/7 Availability', 'Fast Response', 'No Extra Fees'],
            },
            {
                icon: 'Home',
                title: 'Remodeling',
                description: 'Kitchen and bathroom remodeling with expert plumbing and electrical work.',
                features: ['Custom Design', 'Quality Materials', 'Project Management'],
            },
        ],
    },

    about: {
        title: 'Why Choose ProFix?',
        subtitle: 'Family-Owned Since 1995',
        content: 'ProFix has been serving our community for nearly 30 years. Started by master plumber Mike Torres, our company has grown into a full-service home repair business. We treat every home like our own, providing honest assessments, fair pricing, and quality workmanship. Our technicians are licensed, insured, and background-checked for your peace of mind.',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112e17dd0c?w=800&q=80',
        ownerName: 'Mike Torres',
        ownerTitle: 'Founder & Master Plumber',
        features: [
            'Licensed & insured',
            'Background-checked techs',
            'Upfront pricing',
            'Satisfaction guaranteed',
        ],
        stats: [
            { value: '28+', label: 'Years in Business' },
            { value: '15K+', label: 'Jobs Completed' },
            { value: '4.9⭐', label: 'Customer Rating' },
            { value: '60min', label: 'Avg Response' },
        ],
    },

    testimonials: {
        title: 'Customer Reviews',
        subtitle: "Don't just take our word for it",
        items: [
            {
                name: 'Tom Henderson',
                role: 'Homeowner',
                content: 'Called at 2am with a burst pipe. They were at my house in 45 minutes and had it fixed within an hour. Saved my basement! Highly recommend.',
                rating: 5,
            },
            {
                name: 'Sandra Lopez',
                role: 'Homeowner',
                content: 'Great experience from start to finish. Fair pricing, clean work, and the electrician explained everything clearly. Will definitely use again.',
                rating: 5,
            },
            {
                name: 'Kevin Park',
                role: 'Property Manager',
                content: 'We use ProFix for all our rental properties. Reliable, professional, and always available when we need them. A+++ service.',
                rating: 5,
            },
        ],
    },

    contact: {
        title: 'Get Your Free Estimate',
        subtitle: 'Available 24/7 for emergencies',
        phone: '(555) 567-8901',
        email: 'service@profixhome.com',
        address: '1234 Trade Center Blvd',
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85001',
        hours: {
            'Regular Hours': '7:00 AM - 7:00 PM',
            'Emergency Service': '24/7 Available',
            'Weekend': 'Available with appointment',
        },
        socialLinks: {
            facebook: 'https://facebook.com',
            instagram: 'https://instagram.com',
        },
        formEnabled: true,
    },

    footer: {
        columns: [
            {
                title: 'Services',
                links: [
                    { label: 'Plumbing', href: '#' },
                    { label: 'Electrical', href: '#' },
                    { label: 'HVAC', href: '#' },
                    { label: 'Emergency', href: '#' },
                ],
            },
        ],
        copyright: '© {year} ProFix Plumbing & Electrical. All rights reserved. Licensed & Insured.',
        showSocialLinks: true,
    },

    seo: {
        title: 'ProFix Plumbing & Electrical | 24/7 Home Services',
        description: 'Licensed plumbers and electricians available 24/7. Fast response, fair pricing, and quality work guaranteed.',
        keywords: ['plumber', 'electrician', 'home repair', 'emergency plumbing', '24 hour electrician'],
    },
}
