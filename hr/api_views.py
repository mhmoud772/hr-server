from django.contrib.auth import get_user_model
from django.contrib.auth.models import Group
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAdminUser

from .models import (
    Attendance,
    DataResptions,
    Day,
    DeviceFigerPrint,
    EducationalLevel,
    Employee,
    EmployeeFingerPrint,
    Job,
    JobTitle,
    LawFingerPrinter,
    MaritalStatus,
    OrganizationalStructure,
    Shift,
    TypeOfEmployee,
)
from .serializers import (
    AttendanceSerializer,
    DataResptionsSerializer,
    DaySerializer,
    DeviceFigerPrintSerializer,
    EducationalLevelSerializer,
    EmployeeFingerPrintSerializer,
    EmployeeSerializer,
    JobSerializer,
    JobTitleSerializer,
    LawFingerPrinterSerializer,
    MaritalStatusSerializer,
    OrganizationalStructureSerializer,
    ShiftSerializer,
    TypeOfEmployeeSerializer,
    UserSerializer,
    GroupSerializer,
)

User = get_user_model()


class BaseModelViewSet(viewsets.ModelViewSet):
    filter_backends = (filters.SearchFilter, filters.OrderingFilter)
    ordering = ('-id',)


class TypeOfEmployeeViewSet(BaseModelViewSet):
    queryset = TypeOfEmployee.objects.all()
    serializer_class = TypeOfEmployeeSerializer
    search_fields = ('type_of_employee',)


class MaritalStatusViewSet(BaseModelViewSet):
    queryset = MaritalStatus.objects.all()
    serializer_class = MaritalStatusSerializer
    search_fields = ('marital_status',)


class OrganizationalStructureViewSet(BaseModelViewSet):
    queryset = OrganizationalStructure.objects.all()
    serializer_class = OrganizationalStructureSerializer
    search_fields = ('name', 'descriptions')


class JobTitleViewSet(BaseModelViewSet):
    queryset = JobTitle.objects.all()
    serializer_class = JobTitleSerializer
    search_fields = ('name', 'tesk')


class EducationalLevelViewSet(BaseModelViewSet):
    queryset = EducationalLevel.objects.all()
    serializer_class = EducationalLevelSerializer
    search_fields = ('name',)


class EmployeeViewSet(BaseModelViewSet):
    queryset = Employee.objects.select_related(
        'educational_level',
        'type_of_employee',
        'marital_status',
    ).all()
    serializer_class = EmployeeSerializer
    search_fields = ('name', 'number_employee', 'email', 'phone')
    filterset_fields = ('active', 'type_of_employee', 'educational_level', 'marital_status')


class JobViewSet(BaseModelViewSet):
    queryset = Job.objects.select_related('employee', 'organizational_structure', 'JobTitle').all()
    serializer_class = JobSerializer
    search_fields = ('employee__name', 'organizational_structure__name', 'JobTitle__name')
    filterset_fields = ('employee', 'organizational_structure', 'JobTitle')


class DeviceFigerPrintViewSet(BaseModelViewSet):
    queryset = DeviceFigerPrint.objects.all()
    serializer_class = DeviceFigerPrintSerializer
    search_fields = ('name', 'location', 'ip_address')
    filterset_fields = ('is_active',)


class EmployeeFingerPrintViewSet(BaseModelViewSet):
    queryset = EmployeeFingerPrint.objects.select_related('employee', 'device_figer_print').all()
    serializer_class = EmployeeFingerPrintSerializer
    search_fields = ('employee__name', 'id_users', 'device_figer_print__name')
    filterset_fields = ('employee', 'device_figer_print')


class DataResptionsViewSet(BaseModelViewSet):
    queryset = DataResptions.objects.select_related('device_finger_print').all()
    serializer_class = DataResptionsSerializer
    search_fields = ('user_id', 'status', 'device_finger_print__name')
    filterset_fields = ('device_finger_print', 'status')


class DayViewSet(BaseModelViewSet):
    queryset = Day.objects.all()
    serializer_class = DaySerializer
    search_fields = ('day',)


class ShiftViewSet(BaseModelViewSet):
    queryset = Shift.objects.prefetch_related('days', 'employee').all()
    serializer_class = ShiftSerializer
    search_fields = ('name', 'employee__name')
    filterset_fields = ('days', 'employee')


class AttendanceViewSet(BaseModelViewSet):
    queryset = Attendance.objects.select_related('employee').all()
    serializer_class = AttendanceSerializer
    search_fields = ('employee__name', 'note')
    filterset_fields = ('employee', 'date', 'is_present', 'is_present1')

    def get_queryset(self):
        queryset = super().get_queryset()
        date = self.request.query_params.get('date')
        month = self.request.query_params.get('month')
        status = self.request.query_params.get('is_present1')

        if date:
            queryset = queryset.filter(date=date)
        if month:
            queryset = queryset.filter(date__startswith=month)
        if status:
            queryset = queryset.filter(is_present1=status)

        return queryset


class LawFingerPrinterViewSet(BaseModelViewSet):
    queryset = LawFingerPrinter.objects.select_related('shift').all()
    serializer_class = LawFingerPrinterSerializer
    search_fields = ('name', 'shift__name')
    filterset_fields = ('shift',)


class UserViewSet(BaseModelViewSet):
    permission_classes = (IsAdminUser,)
    queryset = User.objects.all()
    serializer_class = UserSerializer
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)


class GroupViewSet(BaseModelViewSet):
    permission_classes = (IsAdminUser,)
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    search_fields = ('name',)
    ordering = ('name',)


from django.contrib.auth.hashers import check_password
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    old_password = request.data.get('old_password')
    new_password = request.data.get('new_password')
    confirm_password = request.data.get('confirm_password')

    if not old_password or not new_password or not confirm_password:
        return Response(
            {'detail': 'جميع الحقول مطلوبة'},
            status=400,
        )

    if new_password != confirm_password:
        return Response(
            {'detail': 'كلمة المرور الجديدة وتأكيدها غير متطابقين'},
            status=400,
        )

    if len(new_password) < 6:
        return Response(
            {'detail': 'كلمة المرور يجب ألا تقل عن 6 أحرف'},
            status=400,
        )

    if not check_password(old_password, request.user.password):
        return Response(
            {'detail': 'كلمة المرور الحالية غير صحيحة'},
            status=400,
        )

    request.user.set_password(new_password)
    request.user.save()

    return Response({'detail': 'تم تغيير كلمة المرور بنجاح'})

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def system_status(request):
    """
    Returns system status, specifically whether basic setup is completed.
    Setup is considered completed if there is at least one Employee or OrganizationalStructure.
    """
    is_setup_completed = Employee.objects.exists() or OrganizationalStructure.objects.exists()
    return Response({
        "setup_completed": is_setup_completed
    })

from django.db.models import Q
from leaves.models import LeaveRequest

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def global_search(request):
    """
    Global search across employees, structures, and leave requests.
    Returns unified format: { type, title, subtitle, href }
    """
    term = request.query_params.get('q', '').strip()
    if len(term) < 2:
        return Response([])

    results = []

    # Search Employees
    employees = Employee.objects.filter(
        Q(name__icontains=term) |
        Q(number_employee__icontains=term) |
        Q(phone__icontains=term) |
        Q(email__icontains=term)
    )[:5]
    for emp in employees:
        results.append({
            'type': 'موظف',
            'title': emp.name,
            'subtitle': str(emp.number_employee or emp.phone or 'موظف'),
            'href': '/workflows/employees',
        })

    # Search Organizational Structures
    structures = OrganizationalStructure.objects.filter(
        Q(name__icontains=term)
    )[:3]
    for struct in structures:
        results.append({
            'type': 'هيكل',
            'title': struct.name,
            'subtitle': 'الهيكل التنظيمي',
            'href': '/groups/companySetup',
        })

    # Search Leave Requests
    leaves = LeaveRequest.objects.filter(
        Q(employee__name__icontains=term) |
        Q(leave_type__name__icontains=term) |
        Q(start_day__icontains=term)
    )[:5]
    for leave in leaves:
        results.append({
            'type': 'إجازة',
            'title': leave.employee.name if leave.employee else 'طلب إجازة',
            'subtitle': f'إجازة {leave.start_day}',
            'href': '/workflows/leave-approvals',
        })

    return Response(results)
