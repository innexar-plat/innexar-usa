"""In-memory storage backend for tests (no MinIO required)."""

from app.core.storage.base import StorageBackend


class FakeStorageBackend(StorageBackend):
    """In-memory dict storage for testing upload/download/delete."""

    def __init__(self) -> None:
        self._store: dict[str, tuple[bytes, str | None]] = {}

    async def put(
        self, key: str, body: object, content_type: str | None = None
    ) -> None:
        if isinstance(body, bytes):
            content = body
        else:
            content = body.read() if hasattr(body, "read") else bytes(body)
        self._store[key] = (content, content_type)

    async def get(self, key: str) -> tuple[bytes, str | None]:
        if key not in self._store:
            raise FileNotFoundError(key)
        return self._store[key]

    async def list_prefix(self, prefix: str) -> list[str]:
        return [k for k in self._store if k.startswith(prefix)]

    async def delete(self, key: str) -> None:
        self._store.pop(key, None)

    async def ensure_bucket_exists(self) -> None:
        pass
