#!/usr/bin/env python3
"""Cria o produto 'Hospedagem site estático regenciada' com um plano de preço. Uso: python scripts/seed_product_static_hosting.py"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings


async def main() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        r = await conn.execute(
            text(
                "SELECT id FROM billing_products WHERE name = :name AND org_id = 'innexar' LIMIT 1"
            ),
            {"name": "Hospedagem site estático regenciada"},
        )
        if r.fetchone():
            print("Produto 'Hospedagem site estático regenciada' já existe.")
            return
        await conn.execute(
            text(
                "INSERT INTO billing_products (org_id, name, description, is_active, provisioning_type, hestia_package, created_at, updated_at) "
                "VALUES ('innexar', :name, :desc, true, 'hestia_hosting', 'default', NOW(), NOW())"
            ),
            {
                "name": "Hospedagem site estático regenciada",
                "desc": "Hospedagem de site estático com suporte regenciado: domínio, SSL, e-mail e painel Hestia. Ideal para sites institucionais e landing pages.",
            },
        )
        r = await conn.execute(text("SELECT id FROM billing_products WHERE name = :name AND org_id = 'innexar' LIMIT 1"), {"name": "Hospedagem site estático regenciada"})
        row = r.fetchone()
        product_id = row[0]
        await conn.execute(
            text(
                "INSERT INTO billing_price_plans (product_id, name, interval, amount, currency, created_at) "
                "VALUES (:pid, 'Mensal', 'month', 29.90, 'BRL', NOW())"
            ),
            {"pid": product_id},
        )
        await conn.execute(
            text(
                "INSERT INTO billing_price_plans (product_id, name, interval, amount, currency, created_at) "
                "VALUES (:pid, 'Anual', 'year', 299.00, 'BRL', NOW())"
            ),
            {"pid": product_id},
        )
    print("OK. Produto 'Hospedagem site estático regenciada' criado com planos Mensal (R$ 29,90) e Anual (R$ 299,00).")


if __name__ == "__main__":
    asyncio.run(main())
