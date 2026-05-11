from django.db import models
from mptt.models import MPTTModel, TreeForeignKey
from phone_field import PhoneField
from django.utils.translation import gettext as _
from django.urls import reverse
from datetime import timedelta
# Create your models here.

class AttendanceStatus(models.IntegerChoices):
    PRESENT = 1, _('حاضر')
    LATE = 2, _('متأخر')
    EARLY_LEAVE = 3, _('خرج مبكر')
    ABSENT = 4, _('غائب')
    MISSING_ENTRY = 5, _('بدون دخول')
    MISSING_EXIT = 6, _('بدون خروج')
    VACATION = 7, _('إجازة')
    OVERTIME = 8, _('عمل إضافي')

class TypeOfEmployee(models.Model):
    type_of_employee = models.CharField(_("نوع التوظيف"), max_length=50,choices=[
            ('1' , _('موظف')),
            ('2' , _('متعاقد')),
            ('3' ,_('يومي'))
    ]
    , unique=True)

    class Meta:
        verbose_name = _("نوع التوظيف")
        verbose_name_plural = _("انواع التوظيف")

    def __str__(self):
        return self.get_type_of_employee_display()

    def get_absolute_url(self):
        return reverse("TypeOfEmployee_detail", kwargs={"pk": self.pk})

class MaritalStatus(models.Model):
    marital_status = models.CharField(_("الحالة الاجتماعية"), max_length=50,choices=[
        ('1',_('متزوج')),
        ('2',_('عازب')),
    ],unique=True)
    class Meta:
        verbose_name = _("الحالة الاجتماعية")
        verbose_name_plural = _("الحالات الاجتماعية")

    def __str__(self):
        return self.get_marital_status_display()

    def get_absolute_url(self):
        return reverse("MaritalStatus_detail", kwargs={"pk": self.pk})

class OrganizationalStructure(MPTTModel):
    name = models.CharField(_("الاسم"),max_length=50)
    descriptions = models.TextField(_("وصف الادارة"))
    parent = TreeForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children')
    create_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)
    update_at = models.DateTimeField(_("تاريخ التعديل"), auto_now=True)
    class MPTTMeta:
        order_insertion_by = ['name']
        verbose_name = _("الهيكل الاداري")
        verbose_name_plural = _("الهيكل الاداري")

    class Meta:
        verbose_name = _("الهيكل الاداري")
        verbose_name_plural = _("الهيكل الاداري")

    def __str__(self):
        return self.name

class JobTitle(models.Model):
    name = models.CharField(_("المسمى الموظفي"), max_length=50)
    tesk = models.TextField(_("شرح عن المهام الوظفية"))
    create_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)
    update_at = models.DateTimeField(_("تاريخ التعديل"), auto_now=True)
    class Meta:
        verbose_name = _("المسمى الموظفي")
        verbose_name_plural = _("المسميات الموظفية")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("JobTitle_detail", kwargs={"pk": self.pk})

class EducationalLevel(models.Model):

    name = models.CharField(_("اسم"), max_length=50)
    create_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)
    update_at = models.DateTimeField(_("تاريخ التعديل"), auto_now=True)
    class Meta:
        verbose_name = _("المستوى التعليمي")
        verbose_name_plural = _("المستويات التعلمية")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("EducationalLevel_detail", kwargs={"pk": self.pk})


class Employee(models.Model):
    name = models.CharField(_("الاسم"), max_length=50)
    address = models.CharField(_("العنوان"), max_length=50)
    phone = PhoneField(_("رقم الهاتف"),)
    number_employee = models.CharField(_("رقم الموظف"), max_length=50, unique=True , null=True , blank=True)
    educational_level = models.ForeignKey(EducationalLevel, verbose_name=_("المستوى التعليم"), on_delete=models.CASCADE)
    phone1 = PhoneField(_("رقم الهاتف الثاني"),blank=True)
    type_of_employee = models.ForeignKey(TypeOfEmployee, verbose_name=_("نوع التوظيف"), on_delete=models.CASCADE)
    marital_status = models.ForeignKey(MaritalStatus, verbose_name=_("نوع الحالة"), on_delete=models.CASCADE)
    email = models.EmailField(_("البريد الالكتروني"), max_length=254, blank=True, null=True)
    basic_salary = models.DecimalField(_("الراتب الاساسي"), max_digits=10, decimal_places=2)
    secondary_salary = models.DecimalField(_("الراتب الثانوي"), max_digits=10, decimal_places=2)
    active = models.BooleanField(_("نشط"),default=True)
    data_of_birth = models.DateField(_("تاريخ الميلاد"), auto_now=False, auto_now_add=False ,blank=True ,null=True)
    id_card = models.ImageField(_("البطاقة الشخصية"), upload_to='images/id_card',null=True, blank=True)
    cv = models.FileField(_("السيرة الذاتية"), upload_to="file/cv", max_length=100,null=True, blank=True)
    note = models.TextField(_("ملاحظة"),blank=True)
    create_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)
    update_at = models.DateTimeField(_("تاريخ التعديل"), auto_now=True)

    class Meta:
        verbose_name = _("الموظف")
        verbose_name_plural = _("الموظفين")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("Employee_detail", kwargs={"pk": self.pk})

class Job(models.Model):
    employee = models.ForeignKey(Employee, verbose_name=_("الموظف"), on_delete=models.CASCADE)
    organizational_structure = models.ForeignKey(OrganizationalStructure, verbose_name=_("الادارة"), on_delete=models.CASCADE)
    JobTitle = models.ForeignKey(JobTitle, verbose_name=_("المسمى الموظفي"), on_delete=models.CASCADE)
    create_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)
    update_at = models.DateTimeField(_("تاريخ التعديل"), auto_now=True)

    class Meta:
        verbose_name = _("الوظفية")
        verbose_name_plural = _("الوظيفة")

    def __str__(self):
        return f"{self.employee} ++ {self.organizational_structure} ++ {self.JobTitle}"

    def get_absolute_url(self):
        return reverse("Job_detail", kwargs={"pk": self.pk})

############################## drive_finger ##########################
class DeviceFigerPrint(models.Model):

    name = models.CharField(_("اسم الجهاز"), max_length=50)
    location = models.CharField(_("مكان العمل"), max_length=50)
    ip_address = models.GenericIPAddressField(_("عنوان الايبي حق البصمة"), protocol="both", unpack_ipv4=False , unique=True)
    port = models.IntegerField(_("المنفذ البصمة "))
    is_active = models.BooleanField(_("فعلية البصمة"), help_text="هل يجب على النظام سحب بيانات الحضور من هذا الجهاز؟", default=True)
    password = models.CharField(_("كلمة السر للجهاز"), max_length=50 , blank=True , null=True)
    create_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)
    update_at = models.DateTimeField(_("تاريخ التعديل"), auto_now=True)
    class Meta:
        verbose_name = _("جهاز البصمة")
        verbose_name_plural = _("اجهزة البصمة")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("DeviceFigerPrint_detail", kwargs={"pk": self.pk})

class EmployeeFingerPrint(models.Model):

    employee = models.ForeignKey(Employee, verbose_name=_("الموظف"), on_delete=models.CASCADE)
    device_figer_print = models.ForeignKey(DeviceFigerPrint, verbose_name=_("جهاز البصمة"), on_delete=models.CASCADE)
    id_users = models.IntegerField(_("رقم الموظف في البصمة"))
    create_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)
    update_at = models.DateTimeField(_("تاريخ التعديل"), auto_now=True)

    class Meta:
        verbose_name = _("بصمة الموظف")
        verbose_name_plural = _("بصمات الموضفين")

    def __str__(self):
        return self.employee.name

    def get_absolute_url(self):
        return reverse("EmployeeFingerPrint_detail", kwargs={"pk": self.pk})

class DataResptions(models.Model):
    device_finger_print = models.ForeignKey(DeviceFigerPrint, verbose_name=_("جهاز البصمة"), on_delete=models.CASCADE)
    user_id = models.IntegerField(_("رقم البصمة "))
    timestamp = models.DateTimeField(_("الوقت والتاريخ"), auto_now=False, auto_now_add=False)
    status = models.CharField(_("حالة الدخول او الخروج"), max_length=50)
    create_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)
    update_at = models.DateTimeField(_("تاريخ التعديل"), auto_now=True)
    class Meta:
        verbose_name = _("استقبال البيانات")
        verbose_name_plural = _("استقبال البيانات")

    def __str__(self):
        return self.device_finger_print.name

    def get_absolute_url(self):
        return reverse("DataResptions_detail", kwargs={"pk": self.pk})


############################### Shit #################################


class Day(models.Model):
    day = models.CharField(max_length=3, choices=[
        ('sat', _("السبت")),
        ('sun', _("الأحد")),
        ('mon', _("الإثنين")),
        ('tue', _("الثلاثاء")),
        ('wed', _("الأربعاء")),
        ('thu', _("الخميس")),
        ('fri', _("الجمعة")),
    ], unique=True)

    def __str__(self):
        return self.get_day_display()
    class Meta:
        verbose_name = _("يوم")
        verbose_name_plural = _("الايام")

class Shift(models.Model):
    name = models.CharField(_("اسم الفترة"), max_length=50)
    start_time = models.TimeField(_("بداية الوقت"), auto_now=False, auto_now_add=False)
    end_time = models.TimeField(_("نهائية الوقت"), auto_now=False, auto_now_add=False)
    days = models.ManyToManyField(Day, verbose_name=_("الايام"))
    employee = models.ManyToManyField(Employee, verbose_name=_("الموظفين"))
    create_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)
    update_at = models.DateTimeField(_("تاريخ التعديل"), auto_now=True)

    class Meta:
        verbose_name = _("فترة الدوام")
        verbose_name_plural = _("فترات الدوام")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("Shift_detail", kwargs={"pk": self.pk})


class Attendance(models.Model):
    employee = models.ForeignKey(Employee, verbose_name=_("الموظف"), on_delete=models.CASCADE)
    date = models.DateField(_("تاريخ اليوم"), auto_now=False, auto_now_add=False)
    time_in = models.TimeField(_("ساعة الدخول"), auto_now=False, auto_now_add=False, blank=True, null=True)
    time_out = models.TimeField(_("ساعة الخروج"), auto_now=False, auto_now_add=False, blank=True, null=True)
    is_present = models.BooleanField(_("حاضر "),default=False)
    is_present1 = models.PositiveIntegerField(_("الحالة"), choices=AttendanceStatus.choices, default=AttendanceStatus.ABSENT,blank=True, null=True)
    note = models.TextField(_("ملاحظة"),blank=True)
    create_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)
    update_at = models.DateTimeField(_("تاريخ التعديل"), auto_now=True)


    class Meta:
        verbose_name = _("الحضور")
        verbose_name_plural = _("الحاضرين")

    def __str__(self):
        return f'self.employee'

    def get_absolute_url(self):
        return reverse("Attendance_detail", kwargs={"pk": self.pk})

class LawFingerPrinter(models.Model):
    name = models.CharField(_("اسم القانون"), max_length=50)
    shift = models.OneToOneField(Shift, verbose_name=_("فترة الدوام"), on_delete=models.CASCADE)
    entry_grace_period = models.DurationField(_("فترة السماح عند الحضور (بالدقائق)"), default=timedelta(minutes=0), help_text=_("الوقت المسموح به للتأخير بعد بداية الدوام الرسمي دون احتساب تأخير."))
    consider_absent_if_late_by = models.DurationField(_("(بالدقائق)اعتبار الموظف غائبًا إذا تأخر لأكثر من"), default=timedelta(minutes=0), help_text=_("إذا تجاوز تأخير الموظف هذه المدة، يتم تسجيله كـ (غياب) بدلاً من (تأخير)."))
    early_departure_allowance = models.DurationField(_("فترة السماح عند الانصراف المبكر (بالدقائق)"), default=timedelta(minutes=0),help_text=_("الوقت المسموح به للموظف بالانصراف قبل نهاية الدوام الرسمي."))
    last_time_for_calculating_entry_time = models.DurationField(_("آخر وقت، وقت لحساب وقت الدخول (بالدقائق)"), default=timedelta(minutes=0), help_text=_("إذا وصل الموظف قبل هذا الوقت من بداية الدوام الرسمي، يتم تسجيل وقت الدخول ."))
    last_time_for_calculating_entry_out = models.DurationField(_("آخر وقت، وقت لحساب وقت الخروج (بالدقائق)"), default=timedelta(minutes=0), help_text=_("إذا غادر الموظف بعد هذا الوقت من نهاية الدوام الرسمي، يتم تسجيل وقت الخروج ."))
    deduct_for_missing_check_in = models.BooleanField(_("احتساب غياب عند نسيان بصمة الدخول؟"), default=True,help_text=_("إذا كان لدى الموظف بصمة خروج فقط، هل يتم اعتباره غائبًا؟"))
    deduct_for_missing_check_out = models.BooleanField(_("تطبيق إجراء عند نسيان بصمة الخروج؟"),default=True,help_text=_("إذا كان لدى الموظف بصمة دخول فقط، هل يتم تجاهل بصمة الخروج أو تطبيق إجراء معين؟"))
    create_at = models.DateTimeField(_("تاريخ الانشاء"), auto_now_add=True)
    update_at = models.DateTimeField(_("تاريخ التعديل"), auto_now=True)

    class Meta:
        verbose_name = _("قانون البصمة")
        verbose_name_plural = _("قوانين البصمة")

    def __str__(self):
        return self.name

    def get_absolute_url(self):
        return reverse("LawFingerPrinter_detail", kwargs={"pk": self.pk})