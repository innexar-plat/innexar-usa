#!/usr/bin/env python3
"""Update Hestia integration base_url in DB. Uses raw SQL to avoid ORM model loading."""
import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.core.encryption import decrypt_value, encrypt_value


async def main() -> None:
    new_base_url = "https://hosting.innexar.com.br:8083"
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        r = await conn.execute(
            text(
                "SELECT id, value_encrypted FROM integration_configs "
                "WHERE provider = 'hestia' AND key = 'api_credentials' LIMIT 1"
            )
        )
        row = r.fetchone()
        if not row:
            print("Config Hestia não encontrada.")
            return
        id_, value_encrypted = row[0], row[1]
        plain = decrypt_value(value_encrypted) if value_encrypted else None
        if not plain:
            print("Falha ao descriptografar.")
            return
        data = json.loads(plain)
        data["base_url"] = new_base_url.rstrip("/")
        new_value = json.dumps(data)
        enc = encrypt_value(new_value)
        if not enc:
            print("Falha ao criptografar.")
            return
        await conn.execute(
            text("UPDATE integration_configs SET value_encrypted = :enc WHERE id = :id"),
            {"enc": enc, "id": id_},
        )
    print("OK. base_url atualizado para:", new_base_url)


if __name__ == "__main__":
    asyncio.run(main())
