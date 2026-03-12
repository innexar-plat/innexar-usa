#!/usr/bin/env python3
"""Cria os produtos 'Site Essencial' (R$ 197/mês) e 'Site Completo' (R$ 297/mês) para a landing de venda de sites.
Uso: python scripts/seed_products_site_venda.py"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings


PRODUCTS = [
    {
        "name": "Site Essencial",
        "desc": "Site institucional profissional, até 5 páginas, design responsivo, SEO básico, integração WhatsApp, hospedagem e SSL. Entrega em 48 horas.",
        "amount": 197.00,
        "plan_name": "Mensal",
        "interval": "month",
        "delivery_hours": 48,
    },
    {
        "name": "Site Completo",
        "desc": "Tudo do Essencial + blog, sistema de agendamento, painel administrativo, SEO avançado e integrações. Entrega em 72 horas.",
        "amount": 297.00,
        "plan_name": "Mensal",
        "interval": "month",
        "delivery_hours": 72,
    },
]


async def main() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        for p in PRODUCTS:
            r = await conn.execute(
                text(
                    "SELECT id FROM billing_products WHERE name = :name AND org_id = 'innexar' LIMIT 1"
                ),
                {"name": p["name"]},
            )
            if r.fetchone():
                print(f"Produto '{p['name']}' já existe.")
                continue
            await conn.execute(
                text(
                    "INSERT INTO billing_products (org_id, name, description, is_active, provisioning_type, hestia_package, created_at, updated_at) "
                    "VALUES ('innexar', :name, :desc, true, 'site_delivery', NULL, NOW(), NOW())"
                ),
                {"name": p["name"], "desc": p["desc"]},
            )
            r = await conn.execute(
                text(
                    "SELECT id FROM billing_products WHERE name = :name AND org_id = 'innexar' LIMIT 1"
                ),
                {"name": p["name"]},
            )
            row = r.fetchone()
            product_id = row[0]
            await conn.execute(
                text(
                    "INSERT INTO billing_price_plans (product_id, name, interval, amount, currency, created_at) "
                    "VALUES (:pid, :plan_name, :interval, :amount, 'BRL', NOW())"
                ),
                {
                    "pid": product_id,
                    "plan_name": p["plan_name"],
                    "interval": p["interval"],
                    "amount": p["amount"],
                },
            )
            print(f"OK. Produto '{p['name']}' criado com plano Mensal (R$ {p['amount']:.2f}).")
    print("Seed concluído: Site Essencial (R$ 197) e Site Completo (R$ 297).")


if __name__ == "__main__":
    asyncio.run(main())
