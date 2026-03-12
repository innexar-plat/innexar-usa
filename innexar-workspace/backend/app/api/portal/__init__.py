"""Portal API: customer-only routes (assembled from sub-routers)."""

from fastapi import APIRouter

from app.api.portal import me, me_dashboard, project_activity, projects, requests

router = APIRouter()
router.include_router(me.router, tags=["portal"])
router.include_router(me_dashboard.router, tags=["portal"])
router.include_router(projects.router, tags=["portal"])
router.include_router(project_activity.router, tags=["portal"])
router.include_router(requests.router, tags=["portal"])
