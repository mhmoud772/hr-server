from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .api_views import (
    AgeLeaveLawViewSet,
    LeaveBalanceViewSet,
    LeaveDayViewSet,
    LeaveLawViewSet,
    LeaveRequestViewSet,
    LeaveTypeViewSet,
)

router = DefaultRouter()
router.register('leave-types', LeaveTypeViewSet)
router.register('leave-laws', LeaveLawViewSet)
router.register('age-leave-laws', AgeLeaveLawViewSet)
router.register('leave-days', LeaveDayViewSet)
router.register('leave-balances', LeaveBalanceViewSet)
router.register('leave-requests', LeaveRequestViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
