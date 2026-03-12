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

interface GourmetTemplateProps {
    config: TemplateConfig
}

export function GourmetTemplate({ config }: GourmetTemplateProps) {
    return (
        <div className="min-h-screen" style={{ fontFamily: config.fontFamily || "'Playfair Display', serif" }}>
            <TemplateHeader
                businessName={config.businessName}
                logo={config.logo}
                navigation={config.navigation}
                cta={{ text: 'Reserve Table', href: '#contact' }}
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

export const defaultGourmetConfig: TemplateConfig = {
    templateId: 'gourmet',
    templateName: 'Gourmet',

    businessName: 'La Bella Cucina',
    tagline: 'Authentic Italian Fine Dining',

    colors: {
        primary: '#D97706',
        secondary: '#92400E',
        accent: '#F59E0B',
        background: '#FFFBEB',
        backgroundAlt: '#FEF3C7',
        text: '#1F2937',
        textMuted: '#6B7280',
    },

    navigation: [
        { label: 'Home', href: '#' },
        { label: 'Menu', href: '#services' },
        { label: 'Our Story', href: '#about' },
        { label: 'Reviews', href: '#testimonials' },
        { label: 'Contact', href: '#contact' },
    ],

    hero: {
        title: 'Experience Authentic Italian Cuisine',
        subtitle: 'Every dish tells a story of tradition, passion, and the finest ingredients from Italy. Join us for an unforgettable culinary journey.',
        backgroundImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80',
        overlay: true,
        cta: { text: 'View Our Menu', href: '#services' },
        secondaryCta: { text: 'Make a Reservation', href: '#contact' },
    },

    services: {
        title: 'Our Menu',
        subtitle: 'Handcrafted dishes using the freshest ingredients',
        items: [
            {
                icon: '🍝',
                title: 'Pasta Fresca',
                description: 'Handmade pasta prepared daily by our master chefs. From classic carbonara to truffle tagliatelle.',
                price: 'From $18',
            },
            {
                icon: '🥩',
                title: 'Carne & Pesce',
                description: 'Premium cuts of meat and fresh seafood prepared with Italian mastery.',
                price: 'From $32',
            },
            {
                icon: '🍕',
                title: 'Pizza Napoletana',
                description: 'Traditional wood-fired pizzas with San Marzano tomatoes and buffalo mozzarella.',
                price: 'From $16',
            },
            {
                icon: '🥗',
                title: 'Antipasti',
                description: 'Start your meal with bruschetta, carpaccio, or our famous burrata.',
                price: 'From $12',
            },
            {
                icon: '🍰',
                title: 'Dolci',
                description: 'Classic Italian desserts including tiramisu, panna cotta, and cannoli.',
                price: 'From $10',
            },
            {
                icon: '🍷',
                title: 'Vino & Cocktails',
                description: 'Curated selection of Italian wines and signature cocktails.',
                price: 'From $9',
            },
        ],
    },

    about: {
        title: 'Our Story',
        subtitle: 'A Family Tradition Since 1985',
        content: 'La Bella Cucina was founded by the Rossi family who brought their grandmother\'s recipes from Naples to share with the world. Three generations later, we continue to honor those traditions while creating new culinary experiences. Every dish is made with love, using imported Italian ingredients and time-honored techniques.',
        image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80',
        features: [
            'Authentic Italian recipes',
            'Fresh daily ingredients',
            'Wood-fired kitchen',
            'Award-winning chef',
        ],
        stats: [
            { value: '38+', label: 'Years Serving' },
            { value: '500+', label: 'Recipes' },
            { value: '50K+', label: 'Happy Guests' },
            { value: '5⭐', label: 'Rating' },
        ],
    },

    testimonials: {
        title: 'What Our Guests Say',
        subtitle: 'Join thousands of satisfied diners',
        items: [
            {
                name: 'Maria Santos',
                role: 'Food Blogger',
                content: 'The best Italian food outside of Italy! The fresh pasta melts in your mouth. A must-visit!',
                rating: 5,
            },
            {
                name: 'James Wilson',
                role: 'Regular Customer',
                content: 'We celebrate every special occasion here. The ambiance, food, and service are always perfect.',
                rating: 5,
            },
            {
                name: 'Sophie Anderson',
                role: 'Food Critic',
                content: 'An authentic Italian experience. The tiramisu alone is worth the trip.',
                rating: 5,
            },
        ],
    },

    contact: {
        title: 'Visit Us',
        subtitle: 'Make a reservation and experience la dolce vita',
        phone: '(555) 867-5309',
        email: 'reservations@labellacucina.com',
        address: '456 Culinary Lane',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102',
        hours: {
            'Mon - Thu': '5:00 PM - 10:00 PM',
            'Fri - Sat': '5:00 PM - 11:00 PM',
            'Sunday': '4:00 PM - 9:00 PM',
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
                title: 'Menu',
                links: [
                    { label: 'Lunch', href: '#' },
                    { label: 'Dinner', href: '#' },
                    { label: 'Wine List', href: '#' },
                    { label: 'Catering', href: '#' },
                ],
            },
        ],
        copyright: '© {year} La Bella Cucina. All rights reserved.',
        showSocialLinks: true,
    },

    seo: {
        title: 'La Bella Cucina | Authentic Italian Restaurant',
        description: 'Experience authentic Italian cuisine in the heart of the city. Fresh pasta, wood-fired pizzas, and traditional recipes.',
        keywords: ['italian restaurant', 'fine dining', 'pasta', 'pizza', 'authentic italian'],
    },
}
