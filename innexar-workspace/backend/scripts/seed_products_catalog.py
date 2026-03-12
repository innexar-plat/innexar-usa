#!/usr/bin/env python3
"""Seed produtos e planos de preço do catálogo Innexar.

Inclui:
- Hospedagem (estática, aplicação web, com/sem manutenção) – mensal
- Sites por assinatura (Site Essencial/Completo já existem em seed_products_site_venda)
- Sites avulsos (até 8 páginas, completo com agendamento/blog) – pagamento único
- Criação de aplicativos (valor base) – pagamento único
- Sugestões: landing page, manutenção avulsa, consultoria

Uso: python scripts/seed_products_catalog.py
"""
from __future__ import annotations

import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings

ORG_ID = "innexar"

# (name, description, amount, interval, provisioning_type, hestia_package)
PRODUCTS: list[tuple[str, str, float, str, str | None, str | None]] = [
    # Hospedagem – mensal (recurring)
    (
        "Hospedagem estática",
        "Hospedagem para site estático: domínio, SSL, painel Hestia. Ideal para landing pages e sites institucionais.",
        30.00,
        "month",
        "hestia_hosting",
        "default",
    ),
    (
        "Hospedagem aplicação web simples",
        "Hospedagem para aplicação web (PHP/Node simples): domínio, SSL, painel Hestia.",
        50.00,
        "month",
        "hestia_hosting",
        "default",
    ),
    (
        "Hospedagem estática + manutenção mensal",
        "Hospedagem estática com manutenção mensal inclusa: atualizações de conteúdo e suporte.",
        100.00,
        "month",
        "hestia_hosting",
        "default",
    ),
    (
        "Hospedagem aplicação web simples + manutenção mensal",
        "Hospedagem para aplicação web com manutenção mensal inclusa.",
        140.00,
        "month",
        "hestia_hosting",
        "default",
    ),
    # Sites avulsos – pagamento único (one_time)
    (
        "Site simples até 8 páginas (estático)",
        "Site institucional estático até 8 páginas: design responsivo, SEO básico, hospedagem e SSL. Entrega em até 10 dias.",
        799.00,
        "one_time",
        "site_delivery",
        None,
    ),
    (
        "Site completo com agendamento e blog",
        "Site completo com blog, sistema de agendamento, painel administrativo e SEO. Entrega em até 15 dias.",
        1300.00,
        "one_time",
        "site_delivery",
        None,
    ),
    (
        "Criação de aplicativos (valor base)",
        "Desenvolvimento de aplicativo sob medida. Valor base; escopo definido em briefing e orçamento.",
        5000.00,
        "one_time",
        None,
        None,
    ),
    # Sugestões – pagamento único
    (
        "Landing page sob medida",
        "Landing page profissional para campanhas, lançamentos ou captação de leads. Design exclusivo e responsivo.",
        499.00,
        "one_time",
        "site_delivery",
        None,
    ),
    (
        "Manutenção avulsa",
        "Manutenção pontual: correções, pequenas alterações ou suporte técnico em site já entregue.",
        150.00,
        "one_time",
        None,
        None,
    ),
    (
        "Consultoria / Discovery",
        "Sessão de descoberta e planejamento: definição de escopo, requisitos e roadmap para seu projeto digital.",
        800.00,
        "one_time",
        None,
        None,
    ),
]


async def main() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        # Sync sequences so INSERT gets next available id (avoids duplicate key if table had manual ids)
        await conn.execute(
            text(
                "SELECT setval(pg_get_serial_sequence('billing_products', 'id'), "
                "(SELECT COALESCE(MAX(id), 0) FROM billing_products))"
            )
        )
        await conn.execute(
            text(
                "SELECT setval(pg_get_serial_sequence('billing_price_plans', 'id'), "
                "(SELECT COALESCE(MAX(id), 0) FROM billing_price_plans))"
            )
        )
        for name, desc, amount, interval, prov_type, hestia_pkg in PRODUCTS:
            r = await conn.execute(
                text(
                    "SELECT id FROM billing_products WHERE name = :name AND org_id = :org LIMIT 1"
                ),
                {"name": name, "org": ORG_ID},
            )
            if r.fetchone():
                print(f"Produto '{name}' já existe.")
                continue
            await conn.execute(
                text(
                    "INSERT INTO billing_products (org_id, name, description, is_active, provisioning_type, hestia_package, created_at, updated_at) "
                    "VALUES (:org, :name, :desc, true, :prov_type, :hestia_pkg, NOW(), NOW())"
                ),
                {
                    "org": ORG_ID,
                    "name": name,
                    "desc": desc,
                    "prov_type": prov_type,
                    "hestia_pkg": hestia_pkg,
                },
            )
            r = await conn.execute(
                text(
                    "SELECT id FROM billing_products WHERE name = :name AND org_id = :org LIMIT 1"
                ),
                {"name": name, "org": ORG_ID},
            )
            row = r.fetchone()
            if not row:
                print(f"Erro ao obter id do produto '{name}'.")
                continue
            product_id = row[0]
            plan_name = "Mensal" if interval == "month" else "Pagamento único"
            await conn.execute(
                text(
                    "INSERT INTO billing_price_plans (product_id, name, interval, amount, currency, created_at) "
                    "VALUES (:pid, :plan_name, :interval, :amount, 'BRL', NOW())"
                ),
                {
                    "pid": product_id,
                    "plan_name": plan_name,
                    "interval": interval,
                    "amount": amount,
                },
            )
            print(f"OK. '{name}' – R$ {amount:.2f} ({interval}).")
    print("Seed concluído: catálogo de produtos e planos criado.")


if __name__ == "__main__":
    asyncio.run(main())
