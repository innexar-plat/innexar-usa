#!/usr/bin/env python3
"""Verify Stripe payment provider resolution and create_payment_link (no secrets logged).
Usage: from backend root, python scripts/test_stripe_key.py"""
import asyncio
import logging
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def main() -> None:
    """Check Stripe env and provider; do not log or print API key."""
    has_key = bool(os.environ.get("STRIPE_SECRET_KEY"))
    logger.info("STRIPE_SECRET_KEY present: %s", has_key)
    from app.core.database import AsyncSessionLocal
    from app.modules.billing.service import _get_payment_provider
    from app.providers.payments.stripe import StripeProvider

    async with AsyncSessionLocal() as db:
        provider = await _get_payment_provider(db, 1, "innexar", "USD")
        logger.info("Provider type: %s", type(provider).__name__)
        if isinstance(provider, StripeProvider):
            try:
                provider.create_payment_link(
                    1, 100, "USD", "http://success", "http://cancel"
                )
                logger.info("create_payment_link: success")
            except Exception as e:
                logger.warning("create_payment_link error: %s", repr(e))


if __name__ == "__main__":
    asyncio.run(main())
