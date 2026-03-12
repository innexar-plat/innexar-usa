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

interface SmileTemplateProps {
    config: TemplateConfig
}

export function SmileTemplate({ config }: SmileTemplateProps) {
    return (
        <div className="min-h-screen" style={{ fontFamily: config.fontFamily || "'Nunito', sans-serif" }}>
            <TemplateHeader
                businessName={config.businessName}
                logo={config.logo}
                navigation={config.navigation}
                cta={{ text: 'Book Appointment', href: '#contact' }}
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

export const defaultSmileConfig: TemplateConfig = {
    templateId: 'smile',
    templateName: 'Smile',

    businessName: 'Bright Smile Dental',
    tagline: 'Your Smile, Our Passion',

    colors: {
        primary: '#0891B2',
        secondary: '#0E7490',
        accent: '#06B6D4',
        background: '#ECFEFF',
        backgroundAlt: '#CFFAFE',
        text: '#164E63',
        textMuted: '#0E7490',
    },

    navigation: [
        { label: 'Home', href: '#' },
        { label: 'Services', href: '#services' },
        { label: 'About Us', href: '#about' },
        { label: 'Reviews', href: '#testimonials' },
        { label: 'Contact', href: '#contact' },
    ],

    hero: {
        title: 'A Beautiful Smile Starts Here',
        subtitle: 'Experience gentle, modern dentistry in a welcoming environment. Our team is dedicated to your comfort and oral health.',
        backgroundImage: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=1920&q=80',
        overlay: true,
        cta: { text: 'Schedule Your Visit', href: '#contact' },
        secondaryCta: { text: 'Our Services', href: '#services' },
    },

    services: {
        title: 'Dental Services',
        subtitle: 'Comprehensive care for the whole family',
        items: [
            {
                icon: 'Sparkles',
                title: 'General Dentistry',
                description: 'Routine exams, cleanings, and preventive care to maintain your oral health.',
                features: ['Dental Exams', 'Professional Cleaning', 'X-Rays'],
            },
            {
                icon: 'Star',
                title: 'Cosmetic Dentistry',
                description: 'Transform your smile with whitening, veneers, and aesthetic treatments.',
                features: ['Teeth Whitening', 'Porcelain Veneers', 'Bonding'],
            },
            {
                icon: 'Heart',
                title: 'Pediatric Dentistry',
                description: 'Gentle care designed specifically for children in a fun environment.',
                features: ['Kid-Friendly Care', 'Sealants', 'Fluoride Treatment'],
            },
            {
                icon: 'Zap',
                title: 'Emergency Care',
                description: 'Same-day appointments for dental emergencies when you need us most.',
                features: ['Same-Day Service', 'Pain Relief', 'Emergency Repairs'],
            },
            {
                icon: 'Grid3x3',
                title: 'Invisalign®',
                description: 'Straighten your teeth discreetly with clear aligner technology.',
                features: ['Free Consultation', 'Custom Treatment', 'Invisible Aligners'],
            },
            {
                icon: 'Plus',
                title: 'Dental Implants',
                description: 'Permanent tooth replacement solutions that look and feel natural.',
                features: ['3D Planning', 'Same-Day Implants', 'Lifetime Results'],
            },
        ],
    },

    about: {
        title: 'Meet Dr. Sarah Mitchell',
        subtitle: 'Your Caring Dentist',
        content: 'Dr. Sarah Mitchell founded Bright Smile Dental with a vision of creating a dental practice where patients feel truly cared for. With over 15 years of experience and advanced training in cosmetic and restorative dentistry, Dr. Mitchell combines expertise with a gentle touch. Our state-of-the-art facility uses the latest technology to ensure comfortable, efficient treatments.',
        image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80',
        ownerName: 'Dr. Sarah Mitchell, DDS',
        ownerTitle: 'Founder & Lead Dentist',
        features: [
            'Advanced certifications',
            'Pain-free techniques',
            'Modern technology',
            'Compassionate care',
        ],
        stats: [
            { value: '15+', label: 'Years Practice' },
            { value: '10K+', label: 'Happy Patients' },
            { value: '4.9⭐', label: 'Google Rating' },
            { value: '0', label: 'Wait Time' },
        ],
    },

    testimonials: {
        title: 'Patient Stories',
        subtitle: 'See why our patients love us',
        items: [
            {
                name: 'Amanda Collins',
                role: 'Patient',
                content: 'I used to be terrified of the dentist. Dr. Mitchell changed that completely. The whole team is so gentle and caring. Best dental experience ever!',
                rating: 5,
            },
            {
                name: 'Robert Kim',
                role: 'Patient',
                content: 'Got my Invisalign through Bright Smile and couldn\'t be happier. The results are amazing and the process was so easy.',
                rating: 5,
            },
            {
                name: 'Lisa Thompson',
                role: 'Mom of 3',
                content: 'Found a dentist the whole family loves! Kids actually look forward to their appointments. That says it all.',
                rating: 5,
            },
        ],
    },

    contact: {
        title: 'Book Your Appointment',
        subtitle: 'New patients welcome! Most insurances accepted.',
        phone: '(555) 345-6789',
        email: 'hello@brightsmile.com',
        address: '789 Wellness Drive, Suite 200',
        city: 'Denver',
        state: 'CO',
        zipCode: '80202',
        hours: {
            'Monday - Thursday': '8:00 AM - 5:00 PM',
            'Friday': '8:00 AM - 3:00 PM',
            'Saturday': 'By Appointment',
            'Sunday': 'Closed',
        },
        socialLinks: {
            instagram: 'https://instagram.com',
            facebook: 'https://facebook.com',
        },
        formEnabled: true,
    },

    footer: {
        columns: [
            {
                title: 'Services',
                links: [
                    { label: 'General Dentistry', href: '#' },
                    { label: 'Cosmetic Dentistry', href: '#' },
                    { label: 'Invisalign', href: '#' },
                    { label: 'Emergency Care', href: '#' },
                ],
            },
        ],
        copyright: '© {year} Bright Smile Dental. All rights reserved.',
        showSocialLinks: true,
    },

    seo: {
        title: 'Bright Smile Dental | Family Dentist',
        description: 'Gentle, modern dentistry for the whole family. Cosmetic dentistry, Invisalign, implants, and emergency care.',
        keywords: ['dentist', 'dental care', 'cosmetic dentistry', 'Invisalign', 'family dentist'],
    },
}
