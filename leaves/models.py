from django.db import models
from django.utils.translation import gettext as _
from hr.models import TypeOfEmployee , MaritalStatus , Employee
from django.urls import reverse 
from django.core.exceptions import ValidationError

# Create your models here.
def validate_deportation(vlaue):
    if vlaue not in range(0,101):
        raise ValidationError(_("خطاء النسبة لا يكمن ان تكون اكبر من 100 او اصغر من 0"))

class TypeDate(models.IntegerChoices):
    HIJRI = 1,_('الهجري')
    GREGORIAN = 2,_('الميلادي')


class StatusRequest(models.IntegerChoices):
    Pending = 1,_('في الانتظار')
    Approved = 2,_('مقبول')
    Rejected = 3,_('مرفوضة')


class LeaveType(models.Model):
    name = models.CharField(_("الاسم"), max_length=50)
    descrptions = models.TextField(_("شرح الاجازة"))
    minimum_request = models.IntegerField(_("الايام التي يتم طلب الاجازة قبلها"))
    due = models.BooleanField(_("إجازاة لا تظهر في الطلبات"))
    create_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)
    update_at = models.DateTimeField(_("تاريخ التعديل"), auto_now=True)
    class Meta:
        verbose_name = _("نوع الاجازة")
        verbose_name_plural = _("انواع الاجازات")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("LeaveType_detail", kwargs={"pk": self.pk})

class LeaveLaw(models.Model):
    leave_type = models.ForeignKey(LeaveType, verbose_name=_("انواع الاجازة"), on_delete=models.CASCADE)
    employee_type_is_given = models.ManyToManyField(TypeOfEmployee, verbose_name=_("نوع الموظف"))
    employee_marital_status_is_given = models.ManyToManyField(MaritalStatus, verbose_name=_("الحالة الاجتماعية"))
    # start = models.IntegerField(_("بعد كم يوم تعطى"))
    # balance = models.IntegerField(_("كم الرصيد"))
    # calculation = models.DecimalField(_("كم ساعة في اليوم "), max_digits=5, decimal_places=2)
    # deportation = models.IntegerField(_("نسبة الترحيل"))
    create_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)
    update_at = models.DateTimeField(_("تاريخ التعديل"), auto_now=True)
    class Meta:
        verbose_name = _("قانوان الاجازة")
        verbose_name_plural = _("قوانين الاجازات")

    def __str__(self):
        return self.leave_type.name

    def get_absolute_url(self):
        return reverse("LeaveLaw_detail", kwargs={"pk": self.pk})

class AgeLeaveLaw(models.Model):
    leave_law = models.ForeignKey(LeaveLaw, verbose_name=_("القانون"), on_delete=models.CASCADE)
    age = models.PositiveIntegerField(_("اصغر من العمر"))
    start = models.PositiveIntegerField(_("تعطى بعد كم يوم دوام"))
    balance = models.PositiveIntegerField(_("رصيد الاجازة"))
    calculation = models.TimeField(_("كم ساعة في اليوم دوام "), auto_now=False, auto_now_add=False,blank=True,null=True)
    deportation = models.PositiveIntegerField(_("نسبة الترحيل"),default=0 ,validators=[validate_deportation])
    create_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)
    update_at = models.DateTimeField(_("تاريخ التعديل"), auto_now=True)
    
    class Meta:
        verbose_name = _("القوانين الخاصة بعمر الموظف")
        verbose_name_plural = _("القوانين الخاصة بعمر الموظف")

    def __str__(self):
        return str(self.age)

    def get_absolute_url(self):
        return reverse("AgeLeaveLaw_detail", kwargs={"pk": self.pk})

class LeaveDay(models.Model):
    leave_type = models.ForeignKey(LeaveType, verbose_name=_("نوع الاجازة"), on_delete=models.CASCADE)
    name = models.CharField(_("الاسم"), max_length=50)
    annual = models.BooleanField(_("كل سنه"))
    day = models.IntegerField(_("اليوم"))
    month = models.IntegerField(_("الشهر"))
    type_date = models.IntegerField(_("نوع التاريخ"),choices=TypeDate.choices,default=1)
    create_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)
    update_at = models.DateTimeField(_("تاريخ التعديل"), auto_now=True)
    class Meta:
        verbose_name = _("يوم الاجازة")
        verbose_name_plural = _("ايام الاجازة")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("LeaveDay_detail", kwargs={"pk": self.pk})


class LeaveBalance(models.Model):

    employee = models.ForeignKey(Employee, verbose_name=_("الموظف"), on_delete=models.CASCADE)
    leave_type = models.ForeignKey(LeaveType, verbose_name=_("نوع الاجازة"), on_delete=models.CASCADE)
    balance = models.DecimalField(_("الرصيد"), max_digits=5, decimal_places=2)
    create_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)
    update_at = models.DateTimeField(_("تاريخ التعديل"), auto_now=True)

    class Meta:
        verbose_name = _("رصيد الموظف")
        verbose_name_plural = _("ارصدة الموظفين")

    def __str__(self):
        return self.employee.name

    def get_absolute_url(self):
        return reverse("LeaveBalance_detail", kwargs={"pk": self.pk})


class LeaveRequest(models.Model):
    employee = models.ForeignKey(Employee, verbose_name=_("الموظف"), on_delete=models.CASCADE)
    leave_type = models.ForeignKey(LeaveType, verbose_name=_("نوع الاجازة"), on_delete=models.CASCADE)
    start_day = models.DateField(_("تاريخ البداية"), auto_now=False, auto_now_add=False)
    end_day = models.DateField(_("تاريخ النهائية"), auto_now=False, auto_now_add=False)
    status = models.IntegerField(_("حالة الطلب"), choices=StatusRequest.choices, default=1)
    create_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)
    update_at = models.DateTimeField(_("تاريخ التعديل"), auto_now=True)
    class Meta:
        verbose_name = _("طلب الاجازة")
        verbose_name_plural = _("طلابات الاجازة")

    def __str__(self):
        return self.employee.name

    def get_absolute_url(self):
        return reverse("LeaveRequest_detail", kwargs={"pk": self.pk})