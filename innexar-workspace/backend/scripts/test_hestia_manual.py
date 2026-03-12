#!/usr/bin/env python3
"""
Teste manual da API Hestia com access_key e secret_key.

Uso 1 – credenciais do banco (rodar dentro do container):
  docker exec innexar-workspace-backend python3 /app/scripts/test_hestia_manual.py

Uso 2 – credenciais por variáveis de ambiente:
  HESTIA_BASE_URL=https://hosting.innexar.com.br:8083 \\
  HESTIA_ACCESS_KEY=ID_DA_CHAVE \\
  HESTIA_SECRET_KEY=CHAVE_SECRETA \\
  python3 scripts/test_hestia_manual.py
"""
import asyncio
import json
import os
import sys

# Add app to path when run from repo root or scripts/
_script_dir = os.path.dirname(os.path.abspath(__file__))
_root = os.path.dirname(_script_dir)
if _root not in sys.path:
    sys.path.insert(0, _root)

try:
    import httpx
except ImportError:
    print("Instale: pip install httpx")
    sys.exit(1)


async def load_hestia_from_db() -> tuple[str, str, str] | None:
    """Carrega base_url, access_key, secret_key da integração Hestia no banco (SQL bruto para evitar ORM)."""
    try:
        from sqlalchemy import text
        from sqlalchemy.ext.asyncio import create_async_engine
        from app.core.config import settings
        from app.core.encryption import decrypt_value
    except ImportError as e:
        print("Não foi possível carregar app (use variáveis de ambiente):", e)
        return None
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        r = await conn.execute(
            text(
                "SELECT value_encrypted FROM integration_configs "
                "WHERE provider = 'hestia' AND key = 'api_credentials' LIMIT 1"
            )
        )
        row = r.fetchone()
    if not row or not row[0]:
        return None
    plain = decrypt_value(row[0])
    if not plain:
        return None
    data = json.loads(plain)
    base_url = (data.get("base_url") or "").strip().rstrip("/")
    access_key = (data.get("access_key") or "").strip()
    secret_key = (data.get("secret_key") or "").strip()
    if base_url and access_key and secret_key:
        return (base_url, access_key, secret_key)
    return None


def run_test(base_url: str, access_key: str, secret_key: str) -> None:
    api_url = f"{base_url.rstrip('/')}/api/"
    payload = {
        "hash": f"{access_key}:{secret_key}",
        "cmd": "v-list-users",
        "returncode": "yes",
    }
    print("URL:", api_url)
    print("Payload (hash mascarado):", {**payload, "hash": "***:***"})
    print()

    with httpx.Client(timeout=30.0, verify=False) as client:
        resp = client.post(api_url, data=payload)
    hestia_code = resp.headers.get("hestia-exit-code", "")
    print("Status:", resp.status_code)
    print("Headers (resposta):", dict(resp.headers))
    if hestia_code:
        # Hestia return codes: 9=E_PASSWORD (wrong creds), 10=E_FORBIDEN (no permission)
        print("hestia-exit-code:", hestia_code, "->", "E_PASSWORD (credenciais?)" if hestia_code == "9" else "E_FORBIDEN (permissão?)" if hestia_code == "10" else "")
    print("Body (raw):", resp.text[:2000] if resp.text else "(vazio)")

    if resp.status_code == 401:
        print()
        print("--- 401 Unauthorized ---")
        if hestia_code == "10":
            print("Código 10 = E_FORBIDEN: a chave não tem permissão para este comando.")
            print("Solução: crie a chave como admin com permissão total: no servidor Hestia (SSH):")
            print("  v-add-access-key 'admin' '*' 'workspace' json")
            print("Use o ID e a Chave Secreta gerados na integração.")
        elif hestia_code == "9":
            print("Código 9 = E_PASSWORD: Access key ou Secret key incorretos. Confira em User → API.")
        else:
            print("1. IP do servidor na whitelist? Hestia: Server → API (ou :allow-all).")
            print("2. Access key / Secret key corretos? User → API.")
            print("3. Chave com permissão para v-list-users? v-add-access-key 'admin' '*' comentario json")
        sys.exit(1)
    if resp.status_code != 200:
        sys.exit(1)
    try:
        data = resp.json()
        print("JSON (resumo):", data)
    except Exception as e:
        print("Parse JSON:", e)
    print("OK")


async def main() -> None:
    base_url = (os.environ.get("HESTIA_BASE_URL") or "").strip().rstrip("/")
    access_key = (os.environ.get("HESTIA_ACCESS_KEY") or "").strip()
    secret_key = (os.environ.get("HESTIA_SECRET_KEY") or "").strip()

    if not base_url or not access_key or not secret_key:
        creds = await load_hestia_from_db()
        if creds:
            base_url, access_key, secret_key = creds
            print("Credenciais carregadas do banco (integração Hestia).")
        else:
            print("Defina: HESTIA_BASE_URL, HESTIA_ACCESS_KEY, HESTIA_SECRET_KEY")
            print("Ou rode dentro do container para usar as credenciais do banco.")
            sys.exit(1)

    run_test(base_url, access_key, secret_key)


if __name__ == "__main__":
    asyncio.run(main())
