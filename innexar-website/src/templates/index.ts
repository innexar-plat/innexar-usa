// Main templates index - exports all templates and utilities

// Types
export * from './types'

// Components
export * from './components'

// Templates
export { ModernTemplate, defaultModernConfig } from './modern'
export { GourmetTemplate, defaultGourmetConfig } from './gourmet'
export { JusticeTemplate, defaultJusticeConfig } from './justice'
export { SmileTemplate, defaultSmileConfig } from './smile'
export { EstateTemplate, defaultEstateConfig } from './estate'
export { CraftTemplate, defaultCraftConfig } from './craft'

// Template Registry
export { templateRegistry, getTemplateById, getAllTemplates } from './registry'
