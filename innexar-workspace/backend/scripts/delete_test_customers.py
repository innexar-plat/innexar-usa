#!/usr/bin/env python3
"""Remove clientes de teste; mantém apenas INSTITUTO LASER OCULAR TOUFIC SLEIMAN S/C LTDA.
Critério de exclusão: email LIKE '%@test.innexar.com' OU name = 'Test Customer' OU name = 'Acme Corp'.
Uso: cd app && python ../scripts/delete_test_customers.py
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings

KEEP_NAME_CONTAINS = "INSTITUTO LASER OCULAR TOUFIC SLEIMAN"


async def main() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        # IDs a manter (cliente Toufic)
        r = await conn.execute(
            text(
                "SELECT id FROM customers WHERE name LIKE :pattern LIMIT 1"
            ),
            {"pattern": f"%{KEEP_NAME_CONTAINS}%"},
        )
        keep_row = r.fetchone()
        keep_id = keep_row[0] if keep_row else None

        # IDs a excluir: teste ou Acme, exceto o que vamos manter
        if keep_id is not None:
            r = await conn.execute(
                text("""
                    SELECT id, name, email FROM customers
                    WHERE (
                        email LIKE '%@test.innexar.com'
                        OR name = 'Test Customer'
                        OR name = 'Acme Corp'
                    )
                    AND id != :keep_id
                """),
                {"keep_id": keep_id},
            )
        else:
            r = await conn.execute(
                text("""
                    SELECT id, name, email FROM customers
                    WHERE (
                        email LIKE '%@test.innexar.com'
                        OR name = 'Test Customer'
                        OR name = 'Acme Corp'
                    )
                """),
            )
        to_delete = r.fetchall()

    if not to_delete:
        print("Nenhum cliente de teste encontrado para excluir.")
        await engine.dispose()
        return

    print(f"Mantendo cliente id={keep_id} (INSTITUTO LASER OCULAR TOUFIC SLEIMAN).")
    print(f"Excluindo {len(to_delete)} cliente(s) de teste:")
    for row in to_delete:
        print(f"  id={row[0]} name={row[1]} email={row[2]}")

    async with engine.begin() as conn:
        for (cid, _, _) in to_delete:
            # Ordem: provisioning_jobs -> payment_attempts -> invoices -> provisioning_records -> subscriptions -> customer_users -> customer
            await conn.execute(
                text("""
                    DELETE FROM billing_provisioning_jobs
                    WHERE subscription_id IN (SELECT id FROM billing_subscriptions WHERE customer_id = :cid)
                """),
                {"cid": cid},
            )
            await conn.execute(
                text("DELETE FROM billing_payment_attempts WHERE invoice_id IN (SELECT id FROM billing_invoices WHERE customer_id = :cid)"),
                {"cid": cid},
            )
            await conn.execute(text("DELETE FROM billing_invoices WHERE customer_id = :cid"), {"cid": cid})
            await conn.execute(
                text("""
                    DELETE FROM provisioning_records
                    WHERE subscription_id IN (SELECT id FROM billing_subscriptions WHERE customer_id = :cid)
                """),
                {"cid": cid},
            )
            await conn.execute(text("DELETE FROM billing_subscriptions WHERE customer_id = :cid"), {"cid": cid})
            await conn.execute(text("DELETE FROM customer_users WHERE customer_id = :cid"), {"cid": cid})
            await conn.execute(text("DELETE FROM customers WHERE id = :cid"), {"cid": cid})
            print(f"  Excluído customer id={cid}.")

    await engine.dispose()
    print("Concluído.")


if __name__ == "__main__":
    asyncio.run(main())
