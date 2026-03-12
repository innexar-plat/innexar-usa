import { generateMetadata, generateStructuredData } from '../seo'

// Mock next-intl
jest.mock('next-intl/server', () => ({
    getTranslations: jest.fn().mockResolvedValue((key: string, options?: { defaultValue: string }) => {
        if (key === 'default.title') return 'Innexar'
        if (key === 'default.description') return 'Tech solutions'
        if (key === 'default.keywords') return 'tech, software'
        if (options?.defaultValue) return options.defaultValue
        return key
    }),
}))

describe('SEO Utilities', () => {
    describe('generateMetadata', () => {
        it('should generate default metadata', async () => {
            const metadata = await generateMetadata('en', 'home')
            expect(metadata.title).toBe('Innexar')
            expect(metadata.description).toBe('Tech solutions')
            expect(metadata.openGraph).toBeDefined()
        })
    })

    describe('generateStructuredData', () => {
        it('should generate valid JSON-LD structure', () => {
            const data = generateStructuredData('en', 'home')
            expect(data.organization['@type']).toBe('Organization')
            expect(data.website['@type']).toBe('WebSite')
            expect(data.breadcrumb['itemListElement']).toHaveLength(1) // Home only
        })

        it('should include subpages in breadcrumb', () => {
            const data = generateStructuredData('en', 'services')
            expect(data.breadcrumb['itemListElement']).toHaveLength(2) // Home + Services
            expect(data.breadcrumb['itemListElement'][1].name).toBe('Services')
        })
    })
})
