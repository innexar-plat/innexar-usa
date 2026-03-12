// Template Configuration Types
// All templates use this schema for dynamic configuration

export interface TemplateColors {
    primary: string
    secondary: string
    accent: string
    background: string
    backgroundAlt: string
    text: string
    textMuted: string
}

export interface NavItem {
    label: string
    href: string
}

export interface CTAButton {
    text: string
    href: string
    variant?: 'primary' | 'secondary' | 'outline'
}

export interface HeroConfig {
    title: string
    subtitle: string
    backgroundImage?: string
    backgroundVideo?: string
    overlay?: boolean
    cta: CTAButton
    secondaryCta?: CTAButton
}

export interface ServiceItem {
    icon: string // Lucide icon name or emoji
    title: string
    description: string
    price?: string
    features?: string[]
    image?: string
}

export interface StatItem {
    value: string
    label: string
    icon?: string
}

export interface AboutConfig {
    title: string
    subtitle?: string
    content: string
    image?: string
    ownerName?: string
    ownerTitle?: string
    ownerImage?: string
    stats?: StatItem[]
    features?: string[]
}

export interface TestimonialItem {
    name: string
    role: string
    company?: string
    content: string
    image?: string
    rating: number // 1-5
}

export interface SocialLinks {
    facebook?: string
    instagram?: string
    linkedin?: string
    youtube?: string
    twitter?: string
    whatsapp?: string
}

export interface BusinessHours {
    [day: string]: string
}

export interface ContactConfig {
    title: string
    subtitle?: string
    phone: string
    email: string
    address: string
    city: string
    state: string
    zipCode?: string
    hours: BusinessHours
    socialLinks: SocialLinks
    mapEmbed?: string
    formEnabled: boolean
}

export interface FooterColumn {
    title: string
    links: NavItem[]
}

export interface FooterConfig {
    columns?: FooterColumn[]
    copyright: string
    showSocialLinks: boolean
}

export interface SEOConfig {
    title: string
    description: string
    keywords: string[]
    ogImage?: string
}

export interface GalleryItem {
    image: string
    title?: string
    category?: string
}

// Main Template Configuration
export interface TemplateConfig {
    // Template Info
    templateId: string
    templateName: string

    // Business Info
    businessName: string
    tagline: string
    logo?: string
    favicon?: string

    // Styling
    colors: TemplateColors
    fontFamily?: string

    // Navigation
    navigation: NavItem[]

    // Sections
    hero: HeroConfig
    services: {
        title: string
        subtitle?: string
        items: ServiceItem[]
    }
    about: AboutConfig
    testimonials: {
        title: string
        subtitle?: string
        items: TestimonialItem[]
    }
    gallery?: {
        title: string
        subtitle?: string
        items: GalleryItem[]
    }
    contact: ContactConfig
    footer: FooterConfig

    // SEO
    seo: SEOConfig
}

// Template metadata for gallery
export interface TemplateMetadata {
    id: string
    name: string
    description: string
    category: string
    previewImage: string
    demoUrl?: string
    features: string[]
}

// Default color palettes for each template
export const TEMPLATE_PALETTES = {
    gourmet: {
        primary: '#D97706',
        secondary: '#92400E',
        accent: '#F59E0B',
        background: '#FFFBEB',
        backgroundAlt: '#FEF3C7',
        text: '#1F2937',
        textMuted: '#6B7280',
    },
    justice: {
        primary: '#1E3A5F',
        secondary: '#0F172A',
        accent: '#D4AF37',
        background: '#F8FAFC',
        backgroundAlt: '#E2E8F0',
        text: '#0F172A',
        textMuted: '#64748B',
    },
    smile: {
        primary: '#0891B2',
        secondary: '#0E7490',
        accent: '#06B6D4',
        background: '#ECFEFF',
        backgroundAlt: '#CFFAFE',
        text: '#164E63',
        textMuted: '#5EEAD4',
    },
    estate: {
        primary: '#7C3AED',
        secondary: '#5B21B6',
        accent: '#A78BFA',
        background: '#FAFAFA',
        backgroundAlt: '#F5F3FF',
        text: '#1F2937',
        textMuted: '#6B7280',
    },
    craft: {
        primary: '#059669',
        secondary: '#047857',
        accent: '#10B981',
        background: '#F0FDF4',
        backgroundAlt: '#DCFCE7',
        text: '#1F2937',
        textMuted: '#6B7280',
    },
    modern: {
        primary: '#3B82F6',
        secondary: '#1D4ED8',
        accent: '#60A5FA',
        background: '#FFFFFF',
        backgroundAlt: '#F3F4F6',
        text: '#111827',
        textMuted: '#6B7280',
    },
} as const

// Template list for gallery
export const TEMPLATES: TemplateMetadata[] = [
    {
        id: 'gourmet',
        name: 'Gourmet',
        description: 'Perfect for restaurants, cafés, and food businesses',
        category: 'Restaurant / Food',
        previewImage: '/templates/gourmet/preview.jpg',
        features: ['Menu showcase', 'Reservation form', 'Photo gallery', 'Location map'],
    },
    {
        id: 'justice',
        name: 'Justice',
        description: 'Professional template for law firms and legal services',
        category: 'Lawyer / Legal',
        previewImage: '/templates/justice/preview.jpg',
        features: ['Practice areas', 'Attorney profiles', 'Case results', 'Consultation form'],
    },
    {
        id: 'smile',
        name: 'Smile',
        description: 'Clean design for dental clinics and healthcare providers',
        category: 'Dentist / Medical',
        previewImage: '/templates/smile/preview.jpg',
        features: ['Services grid', 'Team section', 'Patient testimonials', 'Appointment booking'],
    },
    {
        id: 'estate',
        name: 'Estate',
        description: 'Luxury template for real estate agents and agencies',
        category: 'Real Estate',
        previewImage: '/templates/estate/preview.jpg',
        features: ['Property listings', 'Search filters', 'Agent profile', 'Virtual tours'],
    },
    {
        id: 'craft',
        name: 'Craft',
        description: 'Reliable template for plumbers, electricians, and contractors',
        category: 'Home Services',
        previewImage: '/templates/craft/preview.jpg',
        features: ['Service list', 'Quote request', 'Before/after gallery', 'Emergency contact'],
    },
    {
        id: 'modern',
        name: 'Modern',
        description: 'Versatile template for any type of business',
        category: 'General Business',
        previewImage: '/templates/modern/preview.jpg',
        features: ['Multipurpose sections', 'Team showcase', 'Portfolio grid', 'Contact form'],
    },
]
