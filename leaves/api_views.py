from rest_framework import filters, viewsets

from .models import (
    AgeLeaveLaw,
    LeaveBalance,
    LeaveDay,
    LeaveLaw,
    LeaveRequest,
    LeaveType,
)
from .serializers import (
    AgeLeaveLawSerializer,
    LeaveBalanceSerializer,
    LeaveDaySerializer,
    LeaveLawSerializer,
    LeaveRequestSerializer,
    LeaveTypeSerializer,
)


class BaseModelViewSet(viewsets.ModelViewSet):
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    ordering = ('-id',)


class LeaveTypeViewSet(BaseModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    search_fields = ('name', 'descrptions')
    filterset_fields = ('due',)


class LeaveLawViewSet(BaseModelViewSet):
    queryset = LeaveLaw.objects.select_related('leave_type').prefetch_related(
        'employee_type_is_given',
        'employee_marital_status_is_given',
    ).all()
    serializer_class = LeaveLawSerializer
    search_fields = ('leave_type__name',)
    filterset_fields = ('leave_type', 'employee_type_is_given', 'employee_marital_status_is_given')


class AgeLeaveLawViewSet(BaseModelViewSet):
    queryset = AgeLeaveLaw.objects.select_related('leave_law', 'leave_law__leave_type').all()
    serializer_class = AgeLeaveLawSerializer
    search_fields = ('leave_law__leave_type__name',)
    filterset_fields = ('leave_law',)


class LeaveDayViewSet(BaseModelViewSet):
    queryset = LeaveDay.objects.select_related('leave_type').all()
    serializer_class = LeaveDaySerializer
    search_fields = ('name', 'leave_type__name')
    filterset_fields = ('leave_type', 'annual', 'type_date')


class LeaveBalanceViewSet(BaseModelViewSet):
    queryset = LeaveBalance.objects.select_related('employee', 'leave_type').all()
    serializer_class = LeaveBalanceSerializer
    search_fields = ('employee__name', 'leave_type__name')
    filterset_fields = ('employee', 'leave_type')


class LeaveRequestViewSet(BaseModelViewSet):
    queryset = LeaveRequest.objects.select_related('employee', 'leave_type').all()
    serializer_class = LeaveRequestSerializer
    search_fields = ('employee__name', 'leave_type__name')
    filterset_fields = ('employee', 'leave_type', 'status', 'start_day', 'end_day')

    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get('status')

        if status:
            queryset = queryset.filter(status=status)

        return queryset
