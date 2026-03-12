import React from 'react'

interface StructuredDataProps {
    organization: object
    website: object
}

export default function StructuredData({ organization, website }: StructuredDataProps) {
    return (
        <>
            <script
                id="structured-data-organization"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
            />
            <script
                id="structured-data-website"
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
            />
        </>
    )
}
