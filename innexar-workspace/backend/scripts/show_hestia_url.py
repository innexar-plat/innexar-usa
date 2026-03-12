#!/usr/bin/env python3
"""Read Hestia integration from DB, decrypt and print base_url (and port). Run from backend dir: python scripts/show_hestia_url.py"""
import asyncio
import json
import os
import sys

# Add app to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import select
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.core.encryption import decrypt_value
from app.core.config import settings
from app.models.integration_config import IntegrationConfig


async def main() -> None:
    engine = create_async_engine(
        settings.database_url,
        echo=False,
    )
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        r = await session.execute(
            select(IntegrationConfig).where(
                IntegrationConfig.provider == "hestia",
                IntegrationConfig.key == "api_credentials",
            ).limit(1)
        )
        row = r.scalar_one_or_none()
        if not row:
            print("Nenhuma config Hestia (provider=hestia, key=api_credentials) no banco.")
            return
        plain = decrypt_value(row.value_encrypted) if row.value_encrypted else None
        if not plain:
            print("Valor criptografado vazio ou falha ao descriptografar.")
            return
        try:
            data = json.loads(plain)
        except json.JSONDecodeError:
            print("Valor não é JSON válido.")
            return
        base_url = (data.get("base_url") or "").strip().rstrip("/")
        if not base_url:
            print("base_url não encontrado no JSON.")
            return
        print("base_url:", base_url)
        # Extract port if present (e.g. http://host:8080 or https://host:8083)
        if ":" in base_url:
            parts = base_url.split("/")[2]  # host:port
            if ":" in parts:
                port = parts.split(":")[-1]
                print("porta usada:", port)
            else:
                print("porta: (nenhuma na URL; padrão 80/443)")


if __name__ == "__main__":
    asyncio.run(main())
