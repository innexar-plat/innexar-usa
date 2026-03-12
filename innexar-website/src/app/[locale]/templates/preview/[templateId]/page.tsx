import { notFound } from 'next/navigation'
import { getTemplateById, templateRegistry } from '@/templates/registry'

interface TemplatePreviewPageProps {
    params: Promise<{
        locale: string
        templateId: string
    }>
}

// Generate static params for all templates
export async function generateStaticParams() {
    return templateRegistry.map((template) => ({
        templateId: template.id,
    }))
}

export default async function TemplatePreviewPage({ params }: TemplatePreviewPageProps) {
    const { templateId } = await params

    const template = getTemplateById(templateId)

    if (!template) {
        notFound()
    }

    const { Component, defaultConfig } = template

    return <Component config={defaultConfig} />
}
