from django.contrib import admin
from .models import LeaveType , LeaveLaw , LeaveDay , LeaveRequest , LeaveBalance , AgeLeaveLaw
# Register your models here.
class AgeLeaveLawInline(admin.StackedInline):
    model = AgeLeaveLaw
    extra = 1
@admin.register(LeaveType)
class LeaveTypeAdmin(admin.ModelAdmin):
    list_display = ('name',)
@admin.register(LeaveLaw)
class LeaveLawAdmin(admin.ModelAdmin):
    list_display = ('leave_type',)
    inlines = [AgeLeaveLawInline]
@admin.register(LeaveDay)
class LeaveDayAdmin(admin.ModelAdmin):
    list_display = ('name',)
@admin.register(LeaveRequest)
class LeaveRequestAdmin(admin.ModelAdmin):
    list_display = ('employee',)
@admin.register(LeaveBalance)
class LeaveBalanceAdmin(admin.ModelAdmin):
    list_display = ('employee',)
