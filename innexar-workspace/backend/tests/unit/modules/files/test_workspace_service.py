"""Unit tests for FilesWorkspaceService."""

from unittest.mock import AsyncMock, patch

import pytest
from app.models.customer import Customer
from app.modules.files.models import ProjectFile
from app.modules.files.workspace_service import FilesWorkspaceService
from app.modules.projects.models import Project
from sqlalchemy.ext.asyncio import AsyncSession


@pytest.mark.asyncio
async def test_list_files_project_not_found(db_session: AsyncSession) -> None:
    """List files for non-existent project returns None."""
    svc = FilesWorkspaceService(db_session)
    result = await svc.list_files(99999)
    assert result is None


@pytest.mark.asyncio
async def test_list_files_project_exists_returns_list(db_session: AsyncSession) -> None:
    """List files for existing project returns list from service."""
    cust = Customer(org_id="innexar", name="C", email="f@example.com")
    db_session.add(cust)
    await db_session.flush()
    proj = Project(customer_id=cust.id, name="P", status="active")
    db_session.add(proj)
    await db_session.flush()
    await db_session.refresh(proj)

    with patch(
        "app.modules.files.workspace_service.list_project_files",
        new_callable=AsyncMock,
        return_value=[],
    ):
        svc = FilesWorkspaceService(db_session)
        result = await svc.list_files(proj.id)
    assert result is not None
    assert result == []


@pytest.mark.asyncio
async def test_list_files_returns_files(db_session: AsyncSession) -> None:
    """List files returns list of ProjectFile from list_project_files."""
    cust = Customer(org_id="innexar", name="C", email="f2@example.com")
    db_session.add(cust)
    await db_session.flush()
    proj = Project(customer_id=cust.id, name="P", status="active")
    db_session.add(proj)
    await db_session.flush()
    await db_session.refresh(proj)
    pf = ProjectFile(
        project_id=proj.id,
        customer_id=cust.id,
        path_key="projects/1/abc",
        filename="f.txt",
        content_type="text/plain",
        size=10,
    )
    db_session.add(pf)
    await db_session.flush()
    await db_session.refresh(pf)

    with patch(
        "app.modules.files.workspace_service.list_project_files",
        new_callable=AsyncMock,
        return_value=[pf],
    ):
        svc = FilesWorkspaceService(db_session)
        result = await svc.list_files(proj.id)
    assert result is not None
    assert len(result) == 1
    assert result[0].filename == "f.txt"


@pytest.mark.asyncio
async def test_get_download_project_not_found(db_session: AsyncSession) -> None:
    """Get download for non-existent project returns None."""
    svc = FilesWorkspaceService(db_session)
    result = await svc.get_download(99999, 1)
    assert result is None


@pytest.mark.asyncio
async def test_get_download_file_not_found(db_session: AsyncSession) -> None:
    """Get download when file does not exist returns None."""
    cust = Customer(org_id="innexar", name="C", email="d@example.com")
    db_session.add(cust)
    await db_session.flush()
    proj = Project(customer_id=cust.id, name="P", status="active")
    db_session.add(proj)
    await db_session.flush()
    await db_session.refresh(proj)

    with patch(
        "app.modules.files.workspace_service.get_project_file",
        new_callable=AsyncMock,
        return_value=None,
    ):
        svc = FilesWorkspaceService(db_session)
        result = await svc.get_download(proj.id, 99999)
    assert result is None


@pytest.mark.asyncio
async def test_get_download_success(db_session: AsyncSession) -> None:
    """Get download returns (content, content_type, filename)."""
    cust = Customer(org_id="innexar", name="C", email="d2@example.com")
    db_session.add(cust)
    await db_session.flush()
    proj = Project(customer_id=cust.id, name="P", status="active")
    db_session.add(proj)
    await db_session.flush()
    await db_session.refresh(proj)
    pf = ProjectFile(
        project_id=proj.id,
        customer_id=cust.id,
        path_key="projects/1/xyz",
        filename="doc.pdf",
        content_type="application/pdf",
        size=100,
    )
    db_session.add(pf)
    await db_session.flush()
    await db_session.refresh(pf)

    with (
        patch(
            "app.modules.files.workspace_service.get_project_file",
            new_callable=AsyncMock,
            return_value=pf,
        ),
        patch(
            "app.modules.files.workspace_service.get_file_content",
            new_callable=AsyncMock,
            return_value=(b"pdf-content", "application/pdf"),
        ),
    ):
        svc = FilesWorkspaceService(db_session)
        result = await svc.get_download(proj.id, pf.id)
    assert result is not None
    content, content_type, filename = result
    assert content == b"pdf-content"
    assert content_type == "application/pdf"
    assert filename == "doc.pdf"
