"""Shared helpers for portal routers."""

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.projects.models import Project


async def get_customer_project(
    db: AsyncSession, project_id: int, customer_id: int
) -> Project:
    """Get a project that belongs to the customer, or raise 404."""
    r = await db.execute(
        select(Project).where(
            Project.id == project_id, Project.customer_id == customer_id
        )
    )
    project = r.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Projeto não encontrado")
    return project
