from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .api_views import (
    AttendanceViewSet,
    DataResptionsViewSet,
    DayViewSet,
    DeviceFigerPrintViewSet,
    EducationalLevelViewSet,
    EmployeeFingerPrintViewSet,
    EmployeeViewSet,
    JobTitleViewSet,
    JobViewSet,
    LawFingerPrinterViewSet,
    MaritalStatusViewSet,
    OrganizationalStructureViewSet,
    ShiftViewSet,
    TypeOfEmployeeViewSet,
    UserViewSet,
    GroupViewSet,
    change_password,
    system_status,
    global_search,
    org_tree,
    complete_setup,
)

router = DefaultRouter()
router.register('type-of-employees', TypeOfEmployeeViewSet)
router.register('marital-statuses', MaritalStatusViewSet)
router.register('organizational-structures', OrganizationalStructureViewSet)
router.register('job-titles', JobTitleViewSet)
router.register('educational-levels', EducationalLevelViewSet)
router.register('employees', EmployeeViewSet)
router.register('jobs', JobViewSet)
router.register('fingerprint-devices', DeviceFigerPrintViewSet)
router.register('employee-fingerprints', EmployeeFingerPrintViewSet)
router.register('fingerprint-logs', DataResptionsViewSet)
router.register('days', DayViewSet)
router.register('shifts', ShiftViewSet)
router.register('attendance', AttendanceViewSet)
router.register('fingerprint-laws', LawFingerPrinterViewSet)
router.register('users', UserViewSet)
router.register('groups', GroupViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('change-password/', change_password, name='change_password'),
    path('system-status/', system_status, name='system_status'),
    path('global-search/', global_search, name='global_search'),
    path('org-tree/', org_tree, name='org_tree'),
    path('complete-setup/', complete_setup, name='complete_setup'),
]
