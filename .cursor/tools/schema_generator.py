#!/usr/bin/env python3
"""
Schema Markup Generator — SEO Agent Tool
Generates JSON-LD structured data for common schema types.

Usage:
  python schema_generator.py --type article
  python schema_generator.py --type faq
  python schema_generator.py --type local-business
  python schema_generator.py --type product
  python schema_generator.py --type how-to
  python schema_generator.py --list
"""

import json
import argparse
from datetime import datetime

ISO_NOW = datetime.now().strftime("%Y-%m-%dT%H:%M:%S+00:00")
ISO_DATE = datetime.now().strftime("%Y-%m-%d")


SCHEMAS = {

    "article": {
        "description": "For blog posts, news articles, and editorial content",
        "schema": {
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": "REPLACE: Article headline (max 110 chars)",
            "description": "REPLACE: Article description (max 155 chars)",
            "image": [
                "REPLACE: https://example.com/image-1200x628.jpg"
            ],
            "datePublished": ISO_NOW,
            "dateModified": ISO_NOW,
            "author": {
                "@type": "Person",
                "name": "REPLACE: Author Name",
                "url": "REPLACE: https://example.com/author/name/",
                "jobTitle": "REPLACE: Job Title",
                "worksFor": {
                    "@type": "Organization",
                    "name": "REPLACE: Organization Name"
                }
            },
            "publisher": {
                "@type": "Organization",
                "name": "REPLACE: Site Name",
                "logo": {
                    "@type": "ImageObject",
                    "url": "REPLACE: https://example.com/logo.png",
                    "width": 600,
                    "height": 60
                }
            },
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": "REPLACE: https://example.com/article-url/"
            }
        }
    },

    "faq": {
        "description": "For FAQ sections — enables rich results in Google",
        "schema": {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": "REPLACE: What is the first question?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "REPLACE: Answer to the first question. Can include <a href='https://example.com'>links</a>."
                    }
                },
                {
                    "@type": "Question",
                    "name": "REPLACE: What is the second question?",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "REPLACE: Answer to the second question."
                    }
                },
                {
                    "@type": "Question",
                    "name": "REPLACE: Add more questions as needed",
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": "REPLACE: Answer text."
                    }
                }
            ]
        }
    },

    "local-business": {
        "description": "For local businesses — enhances Google Business Profile signals",
        "schema": {
            "@context": "https://schema.org",
            "@type": ["LocalBusiness", "HealthAndBeautyBusiness"],
            "name": "REPLACE: Business Name",
            "description": "REPLACE: Business description",
            "url": "REPLACE: https://example.com/",
            "telephone": "REPLACE: +5511999990000",
            "email": "REPLACE: contact@example.com",
            "image": "REPLACE: https://example.com/business-photo.jpg",
            "logo": "REPLACE: https://example.com/logo.png",
            "priceRange": "$$",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": "REPLACE: Rua das Flores, 123",
                "addressLocality": "REPLACE: São Paulo",
                "addressRegion": "REPLACE: SP",
                "postalCode": "REPLACE: 01310-100",
                "addressCountry": "BR"
            },
            "geo": {
                "@type": "GeoCoordinates",
                "latitude": "REPLACE: -23.5505",
                "longitude": "REPLACE: -46.6333"
            },
            "openingHoursSpecification": [
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                    "opens": "06:00",
                    "closes": "21:00"
                },
                {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": "Saturday",
                    "opens": "07:00",
                    "closes": "14:00"
                }
            ],
            "sameAs": [
                "REPLACE: https://www.instagram.com/yourbusiness/",
                "REPLACE: https://www.facebook.com/yourbusiness/",
                "REPLACE: https://g.page/yourbusiness"
            ],
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "127",
                "bestRating": "5",
                "worstRating": "1"
            }
        }
    },

    "product": {
        "description": "For product pages in e-commerce",
        "schema": {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": "REPLACE: Product Name",
            "description": "REPLACE: Product description",
            "image": [
                "REPLACE: https://example.com/product-front.jpg",
                "REPLACE: https://example.com/product-side.jpg"
            ],
            "sku": "REPLACE: SKU-001",
            "brand": {
                "@type": "Brand",
                "name": "REPLACE: Brand Name"
            },
            "offers": {
                "@type": "Offer",
                "url": "REPLACE: https://example.com/product/",
                "priceCurrency": "BRL",
                "price": "REPLACE: 299.99",
                "priceValidUntil": f"{(datetime.now().year + 1)}-12-31",
                "itemCondition": "https://schema.org/NewCondition",
                "availability": "https://schema.org/InStock",
                "seller": {
                    "@type": "Organization",
                    "name": "REPLACE: Store Name"
                }
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.7",
                "reviewCount": "89"
            }
        }
    },

    "how-to": {
        "description": "For tutorial/guide content — shows steps in rich results",
        "schema": {
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": "REPLACE: How to [Task]",
            "description": "REPLACE: Brief description of what this guide teaches",
            "image": {
                "@type": "ImageObject",
                "url": "REPLACE: https://example.com/how-to-image.jpg"
            },
            "totalTime": "REPLACE: PT30M",
            "estimatedCost": {
                "@type": "MonetaryAmount",
                "currency": "BRL",
                "value": "REPLACE: 0"
            },
            "supply": [
                {
                    "@type": "HowToSupply",
                    "name": "REPLACE: Supply 1 (e.g., Yoga mat)"
                }
            ],
            "tool": [
                {
                    "@type": "HowToTool",
                    "name": "REPLACE: Tool 1 (e.g., Reformer)"
                }
            ],
            "step": [
                {
                    "@type": "HowToStep",
                    "name": "REPLACE: Step 1 Name",
                    "text": "REPLACE: Detailed step 1 instructions",
                    "image": "REPLACE: https://example.com/step-1.jpg",
                    "url": "REPLACE: https://example.com/guide/#step-1"
                },
                {
                    "@type": "HowToStep",
                    "name": "REPLACE: Step 2 Name",
                    "text": "REPLACE: Detailed step 2 instructions",
                    "image": "REPLACE: https://example.com/step-2.jpg",
                    "url": "REPLACE: https://example.com/guide/#step-2"
                }
            ]
        }
    },

    "breadcrumb": {
        "description": "For breadcrumb navigation — shows path in search results",
        "schema": {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "REPLACE: https://example.com/"
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "REPLACE: Category",
                    "item": "REPLACE: https://example.com/category/"
                },
                {
                    "@type": "ListItem",
                    "position": 3,
                    "name": "REPLACE: Current Page",
                    "item": "REPLACE: https://example.com/category/page/"
                }
            ]
        }
    },

    "review": {
        "description": "For review pages",
        "schema": {
            "@context": "https://schema.org",
            "@type": "Review",
            "name": "REPLACE: Review title",
            "reviewBody": "REPLACE: Full review text",
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5",
                "worstRating": "1"
            },
            "author": {
                "@type": "Person",
                "name": "REPLACE: Reviewer Name"
            },
            "itemReviewed": {
                "@type": "LocalBusiness",
                "name": "REPLACE: Business Being Reviewed",
                "image": "REPLACE: https://example.com/business.jpg"
            },
            "datePublished": ISO_DATE
        }
    },

    "event": {
        "description": "For events, classes, workshops",
        "schema": {
            "@context": "https://schema.org",
            "@type": "Event",
            "name": "REPLACE: Event Name",
            "description": "REPLACE: Event description",
            "startDate": "REPLACE: 2025-04-01T09:00:00-03:00",
            "endDate": "REPLACE: 2025-04-01T11:00:00-03:00",
            "eventStatus": "https://schema.org/EventScheduled",
            "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
            "location": {
                "@type": "Place",
                "name": "REPLACE: Venue Name",
                "address": {
                    "@type": "PostalAddress",
                    "streetAddress": "REPLACE: Street Address",
                    "addressLocality": "REPLACE: City",
                    "addressRegion": "REPLACE: State",
                    "addressCountry": "BR"
                }
            },
            "organizer": {
                "@type": "Organization",
                "name": "REPLACE: Organizer Name",
                "url": "REPLACE: https://example.com/"
            },
            "offers": {
                "@type": "Offer",
                "price": "REPLACE: 50.00",
                "priceCurrency": "BRL",
                "availability": "https://schema.org/InStock",
                "url": "REPLACE: https://example.com/tickets/",
                "validFrom": ISO_NOW
            },
            "image": "REPLACE: https://example.com/event-image.jpg"
        }
    }
}


def generate_html_snippet(schema_dict: dict) -> str:
    json_str = json.dumps(schema_dict, indent=2, ensure_ascii=False)
    return f'<script type="application/ld+json">\n{json_str}\n</script>'


def main():
    parser = argparse.ArgumentParser(
        description="Schema Markup Generator — Generate JSON-LD structured data",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Available schema types:
  article         Blog posts and editorial content
  faq             FAQ sections with Q&A
  local-business  Local business with address and hours
  product         E-commerce product pages
  how-to          Step-by-step tutorial/guide
  breadcrumb      Breadcrumb navigation
  review          Review pages
  event           Events, classes, workshops

Examples:
  python schema_generator.py --type article
  python schema_generator.py --type faq --format html
  python schema_generator.py --list
        """
    )
    parser.add_argument("--type",   choices=list(SCHEMAS.keys()), help="Schema type to generate")
    parser.add_argument("--format", choices=["json", "html"], default="html", help="Output format (default: html)")
    parser.add_argument("--list",   action="store_true", help="List all available schema types")
    
    args = parser.parse_args()
    
    if args.list:
        print("\n📋 Available Schema Types:\n")
        for name, data in SCHEMAS.items():
            print(f"  {name:<20} {data['description']}")
        print()
        return
    
    if not args.type:
        parser.print_help()
        return
    
    schema_data = SCHEMAS[args.type]
    
    print(f"\n{'='*60}")
    print(f"✅ Schema: {args.type.title()}")
    print(f"📝 {schema_data['description']}")
    print(f"{'='*60}\n")
    
    if args.format == "json":
        print(json.dumps(schema_data["schema"], indent=2, ensure_ascii=False))
    else:
        print(generate_html_snippet(schema_data["schema"]))
    
    print(f"\n{'='*60}")
    print("⚠️  Remember to:")
    print("  1. Replace all REPLACE: placeholders with real values")
    print("  2. Validate at https://search.google.com/test/rich-results")
    print("  3. Check schema.org for any required fields")
    print("  4. Place <script> in <head> or end of <body>")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
