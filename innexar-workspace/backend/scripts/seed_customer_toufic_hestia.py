#!/usr/bin/env python3
"""Cria cliente Instituto Toufic, assinatura de hospedagem (25/02/2026) e vincula usuário Hestia 'toufic'.
Uso: python scripts/seed_customer_toufic_hestia.py
Domínio usado no ProvisioningRecord: toufic.com.br (ajustar no Workspace se for outro).
"""
import asyncio
import json
import os
import sys
from datetime import datetime, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings

CUSTOMER_NAME = "INSTITUTO LASER OCULAR TOUFIC SLEIMAN S/C LTDA."
CUSTOMER_EMAIL = "tsleiman@terra.com.br"
CUSTOMER_PHONE = "(11) 2955-8188"
# Address for UI display (street, number, city, state, postal_code)
CUSTOMER_ADDRESS = {
    "street": "Av. Guilherme Cotching",
    "number": "738",
    "complement": "Vila Maria",
    "city": "São Paulo",
    "state": "SP",
    "postal_code": "02113-010",
}
PRODUCT_NAME = "Hospedagem site estático regenciada"
SUBSCRIPTION_START_DATE = datetime(2026, 2, 25, tzinfo=timezone.utc)
HESTIA_USERNAME = "toufic"
HESTIA_DOMAIN = "toufic.com.br"


async def main() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        # 1) Cliente já existe?
        r = await conn.execute(
            text("SELECT id FROM customers WHERE email = :email LIMIT 1"),
            {"email": CUSTOMER_EMAIL},
        )
        row = r.fetchone()
        if row:
            customer_id = row[0]
            print(f"Cliente já existe (id={customer_id}).")
        else:
            r = await conn.execute(
                text(
                    "INSERT INTO customers (org_id, name, email, phone, address, created_at, updated_at) "
                    "VALUES ('innexar', :name, :email, :phone, CAST(:address AS jsonb), NOW(), NOW()) "
                    "RETURNING id"
                ),
                {
                    "name": CUSTOMER_NAME,
                    "email": CUSTOMER_EMAIL,
                    "phone": CUSTOMER_PHONE,
                    "address": json.dumps(CUSTOMER_ADDRESS),
                },
            )
            customer_id = r.scalar_one()
            print(f"Cliente criado: id={customer_id}")

        # 2) Produto e plano de preço (hospedagem)
        r = await conn.execute(
            text(
                "SELECT p.id AS product_id, pp.id AS price_plan_id "
                "FROM billing_products p "
                "JOIN billing_price_plans pp ON pp.product_id = p.id "
                "WHERE p.name = :name AND p.org_id = 'innexar' LIMIT 1"
            ),
            {"name": PRODUCT_NAME},
        )
        row = r.fetchone()
        if not row:
            print("ERRO: Produto 'Hospedagem site estático regenciada' não encontrado. Rode seed_product_static_hosting.py antes.")
            sys.exit(1)
        product_id, price_plan_id = row[0], row[1]

        # 3) Assinatura já existe para este cliente+produto?
        r = await conn.execute(
            text(
                "SELECT id FROM billing_subscriptions "
                "WHERE customer_id = :cid AND product_id = :pid LIMIT 1"
            ),
            {"cid": customer_id, "pid": product_id},
        )
        row = r.fetchone()
        if row:
            subscription_id = row[0]
            print(f"Assinatura já existe: id={subscription_id}. Atualizando datas.")
            await conn.execute(
                text(
                    "UPDATE billing_subscriptions SET status = 'active', "
                    "start_date = :start_date, updated_at = NOW() WHERE id = :id"
                ),
                {"id": subscription_id, "start_date": SUBSCRIPTION_START_DATE},
            )
        else:
            # Use start_date only (next_due_date may not exist in older migrations)
            r = await conn.execute(
                text(
                    "INSERT INTO billing_subscriptions "
                    "(customer_id, product_id, price_plan_id, status, start_date, created_at, updated_at) "
                    "VALUES (:cid, :pid, :ppid, 'active', :start_date, NOW(), NOW()) "
                    "RETURNING id"
                ),
                {
                    "cid": customer_id,
                    "pid": product_id,
                    "ppid": price_plan_id,
                    "start_date": SUBSCRIPTION_START_DATE,
                },
            )
            subscription_id = r.scalar_one()
            print(f"Assinatura criada: id={subscription_id} (início 25/02/2026)")

        # 4) Já existe ProvisioningRecord hestia para esta assinatura?
        r = await conn.execute(
            text(
                "SELECT id FROM provisioning_records "
                "WHERE subscription_id = :sid AND provider = 'hestia' LIMIT 1"
            ),
            {"sid": subscription_id},
        )
        if r.fetchone():
            print("Usuário Hestia já vinculado a esta assinatura.")
        else:
            await conn.execute(
                text(
                    "INSERT INTO provisioning_records "
                    "(subscription_id, provider, external_user, domain, site_url, panel_login, status, provisioned_at, created_at, updated_at) "
                    "VALUES (:sid, 'hestia', :user, :domain, :site_url, :user, 'provisioned', NOW(), NOW(), NOW())"
                ),
                {
                    "sid": subscription_id,
                    "user": HESTIA_USERNAME,
                    "domain": HESTIA_DOMAIN,
                    "site_url": f"https://{HESTIA_DOMAIN}",
                },
            )
            print(f"Usuário Hestia '{HESTIA_USERNAME}' vinculado (domínio {HESTIA_DOMAIN}).")

    print("Concluído.")


if __name__ == "__main__":
    asyncio.run(main())
