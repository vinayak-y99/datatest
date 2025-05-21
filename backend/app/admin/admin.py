# app/admin/admin.py
from fastapi import APIRouter
from app.admin.routes.login_routes import login_router  # Changed from router to login_router
from app.admin.routes.role_routes import role_router
from app.admin.routes.admin_routes import admin_router as admin_routes_router
from app.admin.routes.organization_routes import organization_router
from app.admin.routes.subscription_management import subscription_router
from app.admin.routes.audittrails_routes import audit_router

admin_router = APIRouter()

admin_router.include_router(login_router, prefix="/login")  # Use login_router
admin_router.include_router(role_router, prefix="/roles")
admin_router.include_router(admin_routes_router, prefix="/admins")
admin_router.include_router(organization_router, prefix="/organizations")
admin_router.include_router(subscription_router, prefix="/subscriptions")
admin_router.include_router(audit_router, prefix="/audits")

__all__ = ["admin_router"]