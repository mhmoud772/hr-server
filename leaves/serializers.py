from rest_framework import serializers

from .models import (
    AgeLeaveLaw,
    LeaveBalance,
    LeaveDay,
    LeaveLaw,
    LeaveRequest,
    LeaveType,
)


class DisplayFieldsMixin:
    display = serializers.SerializerMethodField()

    def get_display(self, obj):
        return str(obj)


class LeaveTypeSerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'


class LeaveLawSerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    employee_type_names = serializers.SerializerMethodField()
    marital_status_names = serializers.SerializerMethodField()

    class Meta:
        model = LeaveLaw
        fields = '__all__'

    def get_employee_type_names(self, obj):
        return [str(employee_type) for employee_type in obj.employee_type_is_given.all()]

    def get_marital_status_names(self, obj):
        return [str(status) for status in obj.employee_marital_status_is_given.all()]


class AgeLeaveLawSerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    leave_law_name = serializers.SerializerMethodField()

    class Meta:
        model = AgeLeaveLaw
        fields = '__all__'

    def get_leave_law_name(self, obj):
        return str(obj.leave_law)


class LeaveDaySerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    type_date_name = serializers.CharField(source='get_type_date_display', read_only=True)

    class Meta:
        model = LeaveDay
        fields = '__all__'


class LeaveBalanceSerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)

    class Meta:
        model = LeaveBalance
        fields = '__all__'


class LeaveRequestSerializer(DisplayFieldsMixin, serializers.ModelSerializer):
    employee_name = serializers.CharField(source='employee.name', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    status_name = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = '__all__'
