#!/usr/bin/env python3
"""Atualiza credenciais Hestia no banco. Uso: HESTIA_BASE_URL=... HESTIA_ACCESS_KEY=... HESTIA_SECRET_KEY=... python3 scripts/update_hestia_credentials.py"""
import asyncio
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import settings
from app.core.encryption import encrypt_value


async def main() -> None:
    base_url = (os.environ.get("HESTIA_BASE_URL") or "").strip().rstrip("/")
    access_key = (os.environ.get("HESTIA_ACCESS_KEY") or "").strip()
    secret_key = (os.environ.get("HESTIA_SECRET_KEY") or "").strip()
    if not base_url or not access_key or not secret_key:
        print("Defina: HESTIA_BASE_URL, HESTIA_ACCESS_KEY, HESTIA_SECRET_KEY")
        sys.exit(1)
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    value = json.dumps({
        "base_url": base_url,
        "access_key": access_key,
        "secret_key": secret_key,
    })
    enc = encrypt_value(value)
    if not enc:
        print("Falha ao criptografar.")
        return
    async with engine.begin() as conn:
        r = await conn.execute(
            text(
                "SELECT id FROM integration_configs "
                "WHERE provider = 'hestia' AND key = 'api_credentials' LIMIT 1"
            )
        )
        row = r.fetchone()
        if not row:
            print("Config Hestia não encontrada. Crie a integração pelo Workspace primeiro.")
            return
        await conn.execute(
            text("UPDATE integration_configs SET value_encrypted = :enc WHERE id = :id"),
            {"enc": enc, "id": row[0]},
        )
    print("OK. Credenciais Hestia atualizadas no banco (base_url, access_key, secret_key).")


if __name__ == "__main__":
    asyncio.run(main())
