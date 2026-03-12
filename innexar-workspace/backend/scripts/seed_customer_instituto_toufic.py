#!/usr/bin/env python3
"""Cria conta do cliente Instituto Laser Ocular Toufic Sleiman.

- Cliente: dados do contratante (CONTRATANTE da imagem).
- Contrato: Site R$ 799 (pago 25/02) + Hospedagem R$ 30/mês (Hestia, usuário já existe, site no ar).
- Próxima fatura hospedagem: 25/03/2026.

Cria: Customer, CustomerUser (portal), 2 assinaturas (site one_time + hospedagem mensal),
2 faturas pagas, ProvisioningRecord Hestia, Project (site concluído) com subscription_id.

Requer: tabela projects com subscription_id (migration c0d1e2f3a4b5). Rode: alembic upgrade head

Uso: python scripts/seed_customer_instituto_toufic.py
"""
from __future__ import annotations

import asyncio
import json
import secrets
import sys
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.core.security import hash_password

ORG_ID = "innexar"
CUSTOMER_NAME = "INSTITUTO LASER OCULAR TOUFIC SLEIMAN S/C LTDA."
CUSTOMER_EMAIL = "tsleiman@terra.com.br"
CUSTOMER_PHONE = "(11) 2955-8188"
CUSTOMER_WHATSAPP = "(11) 99734-7676"
# Endereço principal (Paraíso) + sede (Vila Maria) em JSON
CUSTOMER_ADDRESS = {
    "primary": {
        "street": "Praça Oswaldo Cruz",
        "number": "124",
        "complement": "Conj. 64",
        "neighborhood": "Paraíso",
        "city": "São Paulo",
        "state": "SP",
        "postal_code": "04004-070",
    },
    "secondary": {
        "street": "Av. Guilherme Cotching",
        "number": "738",
        "neighborhood": "Vila Maria",
        "city": "São Paulo",
        "state": "SP",
        "postal_code": "02113-010",
    },
}
PAID_DATE = datetime(2026, 2, 25, tzinfo=timezone.utc)
NEXT_DUE_DATE = datetime(2026, 3, 25, tzinfo=timezone.utc)
PRODUCT_HOSTING = "Hospedagem estática"
PRODUCT_SITE = "Site simples até 8 páginas (estático)"
HOSTING_AMOUNT = 30.00
SITE_AMOUNT = 799.00
HESTIA_USER = "toufic"
HESTIA_DOMAIN = "toufic.com.br"


async def main() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        # 1) Cliente
        r = await conn.execute(
            text("SELECT id FROM customers WHERE email = :email LIMIT 1"),
            {"email": CUSTOMER_EMAIL},
        )
        row = r.fetchone()
        if row:
            customer_id = row[0]
            await conn.execute(
                text(
                    "UPDATE customers SET name = :name, phone = :phone, address = CAST(:address AS jsonb), updated_at = NOW() WHERE id = :id"
                ),
                {
                    "id": customer_id,
                    "name": CUSTOMER_NAME,
                    "phone": f"{CUSTOMER_PHONE} / WhatsApp {CUSTOMER_WHATSAPP}",
                    "address": json.dumps(CUSTOMER_ADDRESS),
                },
            )
            print(f"Cliente atualizado: id={customer_id}")
        else:
            r = await conn.execute(
                text(
                    "INSERT INTO customers (org_id, name, email, phone, address, created_at, updated_at) "
                    "VALUES (:org, :name, :email, :phone, CAST(:address AS jsonb), NOW(), NOW()) RETURNING id"
                ),
                {
                    "org": ORG_ID,
                    "name": CUSTOMER_NAME,
                    "email": CUSTOMER_EMAIL,
                    "phone": f"{CUSTOMER_PHONE} / WhatsApp {CUSTOMER_WHATSAPP}",
                    "address": json.dumps(CUSTOMER_ADDRESS),
                },
            )
            customer_id = r.scalar_one()
            print(f"Cliente criado: id={customer_id}")

        # 2) CustomerUser (portal)
        r = await conn.execute(
            text("SELECT id FROM customer_users WHERE email = :email LIMIT 1"),
            {"email": CUSTOMER_EMAIL},
        )
        if r.fetchone():
            print("CustomerUser já existe para este e-mail.")
        else:
            initial_password = secrets.token_urlsafe(12)
            pwd_hash = hash_password(initial_password)
            await conn.execute(
                text(
                    "INSERT INTO customer_users (customer_id, email, password_hash, email_verified, created_at, updated_at) "
                    "VALUES (:cid, :email, :pwd, false, NOW(), NOW())"
                ),
                {"cid": customer_id, "email": CUSTOMER_EMAIL, "pwd": pwd_hash},
            )
            print(f"CustomerUser criado. Senha inicial (enviar ao cliente): {initial_password}")

        # 3) Produtos e planos
        r = await conn.execute(
            text(
                "SELECT p.id, pp.id FROM billing_products p "
                "JOIN billing_price_plans pp ON pp.product_id = p.id "
                "WHERE p.name = :name AND p.org_id = :org AND pp.interval = 'month' LIMIT 1"
            ),
            {"name": PRODUCT_HOSTING, "org": ORG_ID},
        )
        row = r.fetchone()
        if not row:
            print(f"ERRO: Produto '{PRODUCT_HOSTING}' com plano mensal não encontrado. Rode seed_products_catalog.py.")
            sys.exit(1)
        hosting_product_id, hosting_plan_id = row[0], row[1]

        r = await conn.execute(
            text(
                "SELECT p.id, pp.id FROM billing_products p "
                "JOIN billing_price_plans pp ON pp.product_id = p.id "
                "WHERE p.name = :name AND p.org_id = :org AND pp.interval = 'one_time' LIMIT 1"
            ),
            {"name": PRODUCT_SITE, "org": ORG_ID},
        )
        row = r.fetchone()
        if not row:
            print(f"ERRO: Produto '{PRODUCT_SITE}' com plano one_time não encontrado. Rode seed_products_catalog.py.")
            sys.exit(1)
        site_product_id, site_plan_id = row[0], row[1]

        # 4) Assinatura hospedagem (ativa, próxima fatura 25/03/2026)
        r = await conn.execute(
            text(
                "SELECT id FROM billing_subscriptions "
                "WHERE customer_id = :cid AND product_id = :pid LIMIT 1"
            ),
            {"cid": customer_id, "pid": hosting_product_id},
        )
        row = r.fetchone()
        if row:
            sub_hosting_id = row[0]
            await conn.execute(
                text(
                    "UPDATE billing_subscriptions SET status = 'active', start_date = :start, "
                    "next_due_date = :next_due, updated_at = NOW() WHERE id = :id"
                ),
                {"id": sub_hosting_id, "start": PAID_DATE, "next_due": NEXT_DUE_DATE},
            )
            print(f"Assinatura hospedagem já existia: id={sub_hosting_id}. Datas atualizadas.")
        else:
            r = await conn.execute(
                text(
                    "INSERT INTO billing_subscriptions "
                    "(customer_id, product_id, price_plan_id, status, start_date, next_due_date, created_at, updated_at) "
                    "VALUES (:cid, :pid, :ppid, 'active', :start, :next_due, NOW(), NOW()) RETURNING id"
                ),
                {
                    "cid": customer_id,
                    "pid": hosting_product_id,
                    "ppid": hosting_plan_id,
                    "start": PAID_DATE,
                    "next_due": NEXT_DUE_DATE,
                },
            )
            sub_hosting_id = r.scalar_one()
            print(f"Assinatura hospedagem criada: id={sub_hosting_id} (próxima fatura 25/03/2026)")

        # 5) Fatura hospedagem (primeiro mês paga 25/02)
        r = await conn.execute(
            text(
                "SELECT id FROM billing_invoices WHERE subscription_id = :sid AND status = 'paid' LIMIT 1"
            ),
            {"sid": sub_hosting_id},
        )
        if r.fetchone():
            print("Fatura de hospedagem (paga) já existe.")
        else:
            r = await conn.execute(
                text(
                    "INSERT INTO billing_invoices "
                    "(customer_id, subscription_id, status, due_date, paid_at, total, currency, line_items, created_at, updated_at) "
                    "VALUES (:cid, :sid, 'paid', :due, :paid_at, :total, 'BRL', CAST(:line AS jsonb), NOW(), NOW()) RETURNING id"
                ),
                {
                    "cid": customer_id,
                    "sid": sub_hosting_id,
                    "due": PAID_DATE,
                    "paid_at": PAID_DATE,
                    "total": HOSTING_AMOUNT,
                    "line": json.dumps([{"description": f"{PRODUCT_HOSTING} - Mensal", "amount": HOSTING_AMOUNT}]),
                },
            )
            inv_hosting_id = r.scalar_one()
            print(f"Fatura hospedagem (R$ {HOSTING_AMOUNT}) criada como paga: id={inv_hosting_id}")

        # 6) ProvisioningRecord Hestia (usuário já existe, site no ar)
        r = await conn.execute(
            text(
                "SELECT id FROM provisioning_records WHERE subscription_id = :sid AND provider = 'hestia' LIMIT 1"
            ),
            {"sid": sub_hosting_id},
        )
        if r.fetchone():
            print("ProvisioningRecord Hestia já vinculado.")
        else:
            await conn.execute(
                text(
                    "INSERT INTO provisioning_records "
                    "(subscription_id, provider, external_user, domain, site_url, panel_login, status, provisioned_at, created_at, updated_at) "
                    "VALUES (:sid, 'hestia', :user, :domain, :site_url, :user, 'provisioned', NOW(), NOW(), NOW())"
                ),
                {
                    "sid": sub_hosting_id,
                    "user": HESTIA_USER,
                    "domain": HESTIA_DOMAIN,
                    "site_url": f"https://{HESTIA_DOMAIN}",
                },
            )
            print(f"ProvisioningRecord Hestia: usuário '{HESTIA_USER}', domínio {HESTIA_DOMAIN}")

        # 7) Assinatura site (pagamento único)
        r = await conn.execute(
            text(
                "SELECT id FROM billing_subscriptions "
                "WHERE customer_id = :cid AND product_id = :pid LIMIT 1"
            ),
            {"cid": customer_id, "pid": site_product_id},
        )
        row = r.fetchone()
        if row:
            sub_site_id = row[0]
            print(f"Assinatura site já existia: id={sub_site_id}")
        else:
            r = await conn.execute(
                text(
                    "INSERT INTO billing_subscriptions "
                    "(customer_id, product_id, price_plan_id, status, start_date, created_at, updated_at) "
                    "VALUES (:cid, :pid, :ppid, 'active', :start, NOW(), NOW()) RETURNING id"
                ),
                {
                    "cid": customer_id,
                    "pid": site_product_id,
                    "ppid": site_plan_id,
                    "start": PAID_DATE,
                },
            )
            sub_site_id = r.scalar_one()
            print(f"Assinatura site (R$ 799) criada: id={sub_site_id}")

        # 8) Fatura site (paga 25/02)
        r = await conn.execute(
            text(
                "SELECT id FROM billing_invoices WHERE subscription_id = :sid AND status = 'paid' LIMIT 1"
            ),
            {"sid": sub_site_id},
        )
        if r.fetchone():
            print("Fatura site (paga) já existe.")
        else:
            r = await conn.execute(
                text(
                    "INSERT INTO billing_invoices "
                    "(customer_id, subscription_id, status, due_date, paid_at, total, currency, line_items, created_at, updated_at) "
                    "VALUES (:cid, :sid, 'paid', :due, :paid_at, :total, 'BRL', CAST(:line AS jsonb), NOW(), NOW()) RETURNING id"
                ),
                {
                    "cid": customer_id,
                    "sid": sub_site_id,
                    "due": PAID_DATE,
                    "paid_at": PAID_DATE,
                    "total": SITE_AMOUNT,
                    "line": json.dumps([{"description": f"{PRODUCT_SITE} - Pagamento único", "amount": SITE_AMOUNT}]),
                },
            )
            print(f"Fatura site (R$ {SITE_AMOUNT}) criada como paga: id={r.scalar_one()}")

        # 9) Project (site entregue) – vinculado à assinatura (subscription_id é parte do design)
        has_subscription_id = False
        r = await conn.execute(
            text(
                "SELECT 1 FROM information_schema.columns "
                "WHERE table_schema = 'public' AND table_name = 'projects' AND column_name = 'subscription_id' LIMIT 1"
            ),
        )
        if r.fetchone():
            has_subscription_id = True

        if has_subscription_id:
            r = await conn.execute(
                text("SELECT id FROM projects WHERE subscription_id = :sid LIMIT 1"),
                {"sid": sub_site_id},
            )
            if r.fetchone():
                print("Projeto já vinculado à assinatura do site.")
            else:
                r = await conn.execute(
                    text(
                        "INSERT INTO projects (org_id, customer_id, name, status, subscription_id, created_at, updated_at) "
                        "VALUES (:org, :cid, :name, 'projeto_concluido', :sid, NOW(), NOW()) RETURNING id"
                    ),
                    {
                        "org": ORG_ID,
                        "cid": customer_id,
                        "name": f"Site {CUSTOMER_NAME[:50]}",
                        "sid": sub_site_id,
                    },
                )
                print(f"Projeto criado (subscription_id={sub_site_id}): id={r.scalar_one()}")
        else:
            r = await conn.execute(
                text("SELECT id FROM projects WHERE customer_id = :cid ORDER BY id DESC LIMIT 1"),
                {"cid": customer_id},
            )
            if r.fetchone():
                print("Projeto já existe para este cliente (tabela projects sem coluna subscription_id).")
            else:
                r = await conn.execute(
                    text(
                        "INSERT INTO projects (org_id, customer_id, name, status, created_at, updated_at) "
                        "VALUES (:org, :cid, :name, 'projeto_concluido', NOW(), NOW()) RETURNING id"
                    ),
                    {
                        "org": ORG_ID,
                        "cid": customer_id,
                        "name": f"Site {CUSTOMER_NAME[:50]}",
                    },
                )
                print(f"Projeto criado: id={r.scalar_one()} (sem subscription_id – rode: alembic upgrade head)")

    print("Concluído: cliente, assinaturas, faturas, Hestia e projeto associados.")


if __name__ == "__main__":
    asyncio.run(main())
