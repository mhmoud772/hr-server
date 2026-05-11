from django.contrib.auth import get_user_model
from rest_framework import serializers
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

User = get_user_model()


class DisplayFieldsMixin:
    display = serializers.SerializerMethodField()

    def get_display(self, obj):
        return str(obj)


class DataResptionsSerializer(serializers.ModelSerializer):
    display = serializers.SerializerMethodField()
    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = DataResptions
        fields = '__all__'

    def get_display(self, obj):
        return str(obj)

    def get_employee_name(self, obj):
        fingerprint = EmployeeFingerPrint.objects.filter(id_users=obj.user_id).select_related('employee').first()
        return fingerprint.employee.name if fingerprint else None


class DeviceFigerPrintSerializer(serializers.ModelSerializer):
    display = serializers.SerializerMethodField()

    class Meta:
        model = DeviceFigerPrint
        fields = '__all__'

    def get_display(self, obj):
        return str(obj)


class TypeOfEmployeeSerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    class Meta:
        model = TypeOfEmployee
        fields = '__all__'


class MaritalStatusSerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    class Meta:
        model = MaritalStatus
        fields = '__all__'


class OrganizationalStructureSerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    class Meta:
        model = OrganizationalStructure
        fields = '__all__'


class JobTitleSerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    class Meta:
        model = JobTitle
        fields = '__all__'


class EducationalLevelSerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    class Meta:
        model = EducationalLevel
        fields = '__all__'


class EmployeeSerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    educational_level_name = serializers.CharField(source='educational_level.name', read_only=True)
    type_of_employee_name = serializers.SerializerMethodField()
    marital_status_name = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = '__all__'

    def get_type_of_employee_name(self, obj):
        return str(obj.type_of_employee)

    def get_marital_status_name(self, obj):
        return str(obj.marital_status)


class JobSerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    organizational_structure_name = serializers.CharField(source='organizational_structure.name', read_only=True)
    job_title_name = serializers.CharField(source='JobTitle.name', read_only=True)

    class Meta:
        model = Job
        fields = '__all__'


class EmployeeFingerPrintSerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    device_name = serializers.CharField(source='device_figer_print.name', read_only=True)

    class Meta:
        model = EmployeeFingerPrint
        fields = '__all__'


class DaySerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    day_name = serializers.CharField(source='get_day_display', read_only=True)

    class Meta:
        model = Day
        fields = '__all__'


class ShiftSerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    days_names = serializers.SerializerMethodField()
    employee_names = serializers.SerializerMethodField()

    class Meta:
        model = Shift
        fields = '__all__'

    def get_days_names(self, obj):
        return [day.get_day_display() for day in obj.days.all()]

    def get_employee_names(self, obj):
        return [employee.name for employee in obj.employee.all()]


class AttendanceSerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    status_name = serializers.CharField(source='get_is_present1_display', read_only=True)

    class Meta:
        model = Attendance
        fields = '__all__'


class LawFingerPrinterSerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    shift_name = serializers.CharField(source='shift.name', read_only=True)

    class Meta:
        model = LawFingerPrinter
        fields = '__all__'


class UserSerializer(serializers.ModelSerializer):
    display = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()
    password = serializers.CharField(
        allow_blank=True,
        required=False,
        style={'input_type': 'password'},
        write_only=True,
    )

    class Meta:
        model = User
        fields = (
            'id',
            'username',
            'password',
            'first_name',
            'last_name',
            'full_name',
            'email',
            'is_active',
            'is_staff',
            'is_superuser',
            'last_login',
            'date_joined',
            'display',
        )
        read_only_fields = ('last_login', 'date_joined')

    def get_display(self, obj):
        return obj.get_full_name() or obj.username

    def get_full_name(self, obj):
        return obj.get_full_name()

    def create(self, validated_data):
        password = validated_data.pop('password', '')
        user = User(**validated_data)

        if password:
            user.set_password(password)
        else:
            raise serializers.ValidationError({'password': 'كلمة المرور مطلوبة عند إنشاء مستخدم.'})

        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)

        for field, value in validated_data.items():
            setattr(instance, field, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance
