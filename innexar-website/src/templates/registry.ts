import type { TemplateConfig } from './types'

// Import all templates
import { ModernTemplate, defaultModernConfig } from './modern'
import { GourmetTemplate, defaultGourmetConfig } from './gourmet'
import { JusticeTemplate, defaultJusticeConfig } from './justice'
import { SmileTemplate, defaultSmileConfig } from './smile'
import { EstateTemplate, defaultEstateConfig } from './estate'
import { CraftTemplate, defaultCraftConfig } from './craft'

export interface TemplateRegistryItem {
    id: string
    name: string
    description: string
    category: string
    thumbnail: string
    previewUrl: string
    defaultConfig: TemplateConfig
    Component: React.ComponentType<{ config: TemplateConfig }>
    tags: string[]
}

export const templateRegistry: TemplateRegistryItem[] = [
    {
        id: 'modern',
        name: 'Modern',
        description: 'Clean, professional template perfect for consulting firms, agencies, and general business.',
        category: 'Business',
        thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=80',
        previewUrl: '/templates/preview/modern',
        defaultConfig: defaultModernConfig,
        Component: ModernTemplate,
        tags: ['professional', 'consulting', 'agency', 'corporate'],
    },
    {
        id: 'gourmet',
        name: 'Gourmet',
        description: 'Elegant template designed for restaurants, cafes, bakeries, and food service businesses.',
        category: 'Restaurant',
        thumbnail: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=80',
        previewUrl: '/templates/preview/gourmet',
        defaultConfig: defaultGourmetConfig,
        Component: GourmetTemplate,
        tags: ['restaurant', 'food', 'cafe', 'dining', 'italian'],
    },
    {
        id: 'justice',
        name: 'Justice',
        description: 'Authoritative template for law firms, attorneys, and legal services with a trust-building design.',
        category: 'Legal',
        thumbnail: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=400&q=80',
        previewUrl: '/templates/preview/justice',
        defaultConfig: defaultJusticeConfig,
        Component: JusticeTemplate,
        tags: ['lawyer', 'attorney', 'legal', 'law firm', 'professional'],
    },
    {
        id: 'smile',
        name: 'Smile',
        description: 'Friendly and calming template ideal for dental practices, medical offices, and healthcare providers.',
        category: 'Healthcare',
        thumbnail: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=400&q=80',
        previewUrl: '/templates/preview/smile',
        defaultConfig: defaultSmileConfig,
        Component: SmileTemplate,
        tags: ['dentist', 'dental', 'medical', 'healthcare', 'doctor'],
    },
    {
        id: 'estate',
        name: 'Estate',
        description: 'Luxury template for real estate agents, property companies, and investment firms.',
        category: 'Real Estate',
        thumbnail: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&q=80',
        previewUrl: '/templates/preview/estate',
        defaultConfig: defaultEstateConfig,
        Component: EstateTemplate,
        tags: ['real estate', 'realtor', 'property', 'luxury', 'homes'],
    },
    {
        id: 'craft',
        name: 'Craft',
        description: 'Reliable template for home service professionals: plumbers, electricians, contractors, and tradespeople.',
        category: 'Home Services',
        thumbnail: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&q=80',
        previewUrl: '/templates/preview/craft',
        defaultConfig: defaultCraftConfig,
        Component: CraftTemplate,
        tags: ['plumber', 'electrician', 'contractor', 'home services', 'trades'],
    },
]

/**
 * Get a template by its ID
 */
export function getTemplateById(id: string): TemplateRegistryItem | undefined {
    return templateRegistry.find((template) => template.id === id)
}

/**
 * Get all templates, optionally filtered by category
 */
export function getAllTemplates(category?: string): TemplateRegistryItem[] {
    if (category) {
        return templateRegistry.filter((template) => template.category === category)
    }
    return templateRegistry
}

/**
 * Search templates by tags
 */
export function searchTemplates(query: string): TemplateRegistryItem[] {
    const lowerQuery = query.toLowerCase()
    return templateRegistry.filter(
        (template) =>
            template.name.toLowerCase().includes(lowerQuery) ||
            template.description.toLowerCase().includes(lowerQuery) ||
            template.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
    )
}

/**
 * Get unique categories from all templates
 */
export function getCategories(): string[] {
    return [...new Set(templateRegistry.map((template) => template.category))]
}
