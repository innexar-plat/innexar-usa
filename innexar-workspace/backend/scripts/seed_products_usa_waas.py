#!/usr/bin/env python3
"""Create WaaS USA products: Starter ($129), Business ($199), Pro ($299) monthly USD.
Slug is derived from product name: Starter Website -> starter, Business Website -> business, Pro Website -> pro.
Usage: python scripts/seed_products_usa_waas.py"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings

ORG_ID = "innexar"

# Slug is used by GET /api/public/products/waas and POST checkout/start (plan_slug).
# Resolved by name: "Starter Website" -> starter, "Business Website" -> business, "Pro Website" -> pro.
PRODUCTS = [
    {
        "name": "Starter Website",
        "slug": "starter",
        "desc": "Professional website, up to 5 pages, hosting, SSL, basic SEO, 1 content update/month, email support.",
        "amount": 129.00,
        "plan_name": "Monthly",
        "interval": "month",
        "features": [
            "5 pages",
            "Hosting included",
            "SSL security",
            "Basic SEO",
            "1 content update/month",
            "Email support",
        ],
    },
    {
        "name": "Business Website",
        "slug": "business",
        "desc": "Everything in Starter + up to 10 pages, blog, analytics, SEO, 3 updates/month.",
        "amount": 199.00,
        "plan_name": "Monthly",
        "interval": "month",
        "features": [
            "10 pages",
            "Blog",
            "Analytics integration",
            "SEO optimized",
            "3 updates/month",
            "Priority support",
        ],
    },
    {
        "name": "Pro Website",
        "slug": "pro",
        "desc": "Unlimited pages, advanced SEO, integrations, priority support.",
        "amount": 299.00,
        "plan_name": "Monthly",
        "interval": "month",
        "features": [
            "Unlimited pages",
            "Advanced SEO",
            "Integrations (CRM, etc.)",
            "Priority support",
        ],
    },
]


async def main() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        for p in PRODUCTS:
            r = await conn.execute(
                text(
                    "SELECT id FROM billing_products WHERE name = :name AND org_id = :org LIMIT 1"
                ),
                {"name": p["name"], "org": ORG_ID},
            )
            if r.fetchone():
                print(f"Product '{p['name']}' already exists.")
                continue
            await conn.execute(
                text(
                    "INSERT INTO billing_products (org_id, name, description, is_active, provisioning_type, hestia_package, created_at, updated_at) "
                    "VALUES (:org, :name, :desc, true, 'site_delivery', NULL, NOW(), NOW())"
                ),
                {"org": ORG_ID, "name": p["name"], "desc": p["desc"]},
            )
            r = await conn.execute(
                text(
                    "SELECT id FROM billing_products WHERE name = :name AND org_id = :org LIMIT 1"
                ),
                {"name": p["name"], "org": ORG_ID},
            )
            row = r.fetchone()
            assert row is not None
            product_id = row[0]
            await conn.execute(
                text(
                    "INSERT INTO billing_price_plans (product_id, name, interval, amount, currency, created_at) "
                    "VALUES (:pid, :plan_name, :interval, :amount, 'USD', NOW())"
                ),
                {
                    "pid": product_id,
                    "plan_name": p["plan_name"],
                    "interval": p["interval"],
                    "amount": p["amount"],
                },
            )
            print(f"OK. Product '{p['name']}' (slug={p['slug']}) created, ${p['amount']:.0f}/month.")
    print("Seed done: Starter ($129), Business ($199), Pro ($299) USD.")


if __name__ == "__main__":
    asyncio.run(main())
