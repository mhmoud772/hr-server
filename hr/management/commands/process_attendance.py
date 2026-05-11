import datetime
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone

from hr.models import (
    Employee, Shift, DataResptions, Attendance, LawFingerPrinter, 
    AttendanceStatus, EmployeeFingerPrint
)

class Command(BaseCommand):
    help = 'Processes attendance data. Can be run for all employees or a specific list.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--date',
            type=str,
            help='Process attendance for a specific date in YYYY-MM-DD format.'
        )
        parser.add_argument(
            '--employees',
            nargs='+',
            type=int,
            help='A list of specific employee IDs to process.'
        )

    def handle(self, *args, **options):
        if options['date']:
            processing_date_str = options['date']
            self.stdout.write(self.style.SUCCESS(f"*** ستبدأ المعالجة اليدوية لتاريخ: {processing_date_str} ***"))
        else:
            yesterday = timezone.now().date() - timedelta(days=1)
            processing_date_str = yesterday.strftime('%Y-%m-%d')
            self.stdout.write(self.style.SUCCESS(f"*** ستبدأ المعالجة التلقائية لتاريخ الأمس: {processing_date_str} ***"))
        
        processing_date = datetime.datetime.strptime(processing_date_str, '%Y-%m-%d').date()
        day_str = processing_date.strftime('%a').lower()[:3]

        if options['employees']:
            employee_ids = options['employees']
            employees_to_process = Employee.objects.filter(id__in=employee_ids)
            self.stdout.write(f"  - سيتم معالجة قائمة محددة من الموظفين (العدد: {employees_to_process.count()}).")
        else:
            employees_to_process = Employee.objects.filter(active=True, shift__days__day=day_str).distinct()
            self.stdout.write("  - سيتم معالجة جميع الموظفين الذين لديهم دوام اليوم.")

        if not employees_to_process.exists():
            self.stdout.write("  لم يتم العثور على موظفين للمعالجة وفقاً للشروط.")
            return

        for employee in employees_to_process:
            self.process_employee_attendance(employee, processing_date, day_str)

        self.stdout.write(self.style.SUCCESS("\n*** تمت عملية المعالجة بنجاح! ***"))

    def process_employee_attendance(self, employee, processing_date, day_str):
        shift = employee.shift_set.filter(days__day=day_str).first()
        if not shift:
            return

        try:
            law = LawFingerPrinter.objects.get(shift=shift)
        except LawFingerPrinter.DoesNotExist:
            self.stdout.write(self.style.WARNING(f"  [تحذير] لا توجد قوانين للموظف '{employee.name}'. سيتم تخطيه."))
            return

        is_night_shift = shift.end_time < shift.start_time
        shift_start_dt = timezone.make_aware(datetime.datetime.combine(processing_date, shift.start_time))
        
        if is_night_shift:
            next_day = processing_date + timedelta(days=1)
            shift_end_dt = timezone.make_aware(datetime.datetime.combine(next_day, shift.end_time))
        else:
            shift_end_dt = timezone.make_aware(datetime.datetime.combine(processing_date, shift.end_time))

        fingerprint_ids = employee.employeefingerprint_set.values_list('id_users', flat=True)
        if not fingerprint_ids.exists():
            Attendance.objects.update_or_create(
                employee=employee, date=processing_date,
                defaults={'is_present': False, 'is_present1': AttendanceStatus.ABSENT, 'note': 'غائب (لا يوجد رقم بصمة مسجل)'}
            )
            return

        logs = DataResptions.objects.filter(
            user_id__in=fingerprint_ids,
            timestamp__range=(shift_start_dt, shift_end_dt)
        ).order_by('timestamp')
        
        time_in, time_out, is_present, status, note = None, None, False, AttendanceStatus.ABSENT, "غائب (لم يتم تسجيل أي بصمة)"

        if logs.exists():
            self.stdout.write(f"  - يعالج الموظف: {employee.name} (وجدت {logs.count()} بصمة)")
            
            grace_period_end_dt = shift_start_dt + law.entry_grace_period
            absent_threshold_dt = grace_period_end_dt + law.consider_absent_if_late_by
            early_leave_threshold_dt = shift_end_dt - law.early_departure_allowance

            notes_list = []
            
            if logs.count() == 1:
                single_log_dt = logs.first().timestamp
                is_entry_punch = abs(single_log_dt - shift_start_dt) < abs(single_log_dt - shift_end_dt)

                if is_entry_punch:
                    time_in = single_log_dt.time()
                    if law.consider_absent_if_late_by > timedelta(0) and single_log_dt > absent_threshold_dt:
                        status, is_present, note = AttendanceStatus.ABSENT, False, "غائب لتجاوز حد التأخير (بصمة واحدة)"
                    else:
                        status, is_present, note = AttendanceStatus.MISSING_EXIT, True, "تم تسجيل بصمة دخول فقط"
                else:
                    time_out = single_log_dt.time()
                    if law.deduct_for_missing_check_in:
                        status, note = AttendanceStatus.ABSENT, "غائب (لعدم وجود بصمة دخول)"
                    else:
                        status, is_present, note = AttendanceStatus.MISSING_ENTRY, True, "تم تسجيل بصمة خروج فقط"
            else:
                first_log_dt, last_log_dt = logs.first().timestamp, logs.last().timestamp
                time_in, time_out, is_present, status = first_log_dt.time(), last_log_dt.time(), True, AttendanceStatus.PRESENT

                if law.consider_absent_if_late_by > timedelta(0) and first_log_dt > absent_threshold_dt:
                    status, is_present = AttendanceStatus.ABSENT, False
                    notes_list.append("غائب لتجاوز حد التأخير المسموح به")
                else:
                    if first_log_dt > grace_period_end_dt:
                        status = AttendanceStatus.LATE
                        notes_list.append("متأخر")
                    if last_log_dt < early_leave_threshold_dt:
                        if status == AttendanceStatus.PRESENT: status = AttendanceStatus.EARLY_LEAVE
                        notes_list.append("خرج مبكر")
                note = " | ".join(notes_list) if notes_list else "حاضر"

        Attendance.objects.update_or_create(
            employee=employee, date=processing_date,
            defaults={'time_in': time_in, 'time_out': time_out, 'is_present': is_present, 'is_present1': status, 'note': note}
        )


