from django.shortcuts import render
from .serializers import DeviceFigerPrintSerializer , DeviceFigerPrint , DataResptions , DataResptionsSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

class DataResptionsView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = DataResptionsSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Data received"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DeviceFigerPrintView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        device_fingerprints = DeviceFigerPrint.objects.all()
        serializer = DeviceFigerPrintSerializer(device_fingerprints,many=True)
        return Response({"data":serializer.data},status=status.HTTP_200_OK)


# import datetime
# from datetime import timedelta
# from django.utils import timezone
# from django.db.models import Max

# from hr.models import (
#     Employee, Shift, DataResptions, Attendance, LawFingerPrinter, 
#     AttendanceStatus, EmployeeFingerPrint
# )

# Attendance.objects.all().delete()
# print("--- بدء سكربت معالجة الحضور والانصراف ---")

# start_date = datetime.date(2025, 8, 1)
# end_date = timezone.now().date()

# if start_date > end_date:
#     print(f"... تاريخ البدء المحدد ({start_date}) هو في المستقبل. لا توجد أيام للمعالجة ...")
# else:
#     print(f"*** ستبدأ المعالجة من تاريخ {start_date} إلى {end_date} (تاريخ بدء ثابت) ***")
    
#     num_days = (end_date - start_date).days + 1
#     dates_to_process = [start_date + timedelta(days=i) for i in range(num_days)]

#     for processing_date in dates_to_process:
#         print(f"\n--- جاري معالجة تاريخ: {processing_date} ---")
#         day_str = processing_date.strftime('%a').lower()[:3]
        
#         employees_on_duty = Employee.objects.filter(active=True, shift__days__day=day_str).distinct()

#         if not employees_on_duty.exists():
#             print("  لا يوجد موظفون لديهم دوام في هذا اليوم.")
#             continue

#         for employee in employees_on_duty:
#             shift = employee.shift_set.filter(days__day=day_str).first()
#             if not shift: continue

#             try:
#                 law = LawFingerPrinter.objects.get(shift=shift)
#             except LawFingerPrinter.DoesNotExist:
#                 print(f"  [تحذير] لا توجد قوانين للموظف '{employee.name}'. سيتم تخطيه.")
#                 continue

#             fingerprint_ids = employee.employeefingerprint_set.values_list('id_users', flat=True)
#             if not fingerprint_ids.exists():
#                 Attendance.objects.update_or_create(
#                     employee=employee, date=processing_date,
#                     defaults={'is_present': False, 'is_present1': AttendanceStatus.ABSENT, 'note': 'غائب (لا يوجد رقم بصمة مسجل)'}
#                 )
#                 continue

#             logs = DataResptions.objects.filter(
#                 user_id__in=fingerprint_ids,
#                 timestamp__date=processing_date
#             ).order_by('timestamp')
            
#             time_in, time_out = None, None
#             is_present = False
#             status = AttendanceStatus.ABSENT
#             note = "غائب (لم يتم تسجيل أي بصمة)"

#             if logs.exists():
#                 print(f"  - يعالج الموظف: {employee.name} (وجدت {logs.count()} بصمة)")
                
#                 shift_start_dt = timezone.make_aware(datetime.datetime.combine(processing_date, shift.start_time))
#                 shift_end_dt = timezone.make_aware(datetime.datetime.combine(processing_date, shift.end_time))
                
#                 grace_period_end_dt = shift_start_dt + law.entry_grace_period
#                 absent_threshold_dt = grace_period_end_dt + law.consider_absent_if_late_by
#                 early_leave_threshold_dt = shift_end_dt - law.early_departure_allowance

#                 notes_list = []
                
#                 if logs.count() == 1:
#                     single_log_dt = logs.first().timestamp
#                     is_entry_punch = abs(single_log_dt - shift_start_dt) < abs(single_log_dt - shift_end_dt)

#                     if is_entry_punch:
#                         time_in = single_log_dt.time()
                        
#                         if law.consider_absent_if_late_by > timedelta(0) and single_log_dt > absent_threshold_dt:
#                             status = AttendanceStatus.ABSENT
#                             is_present = False
#                             note = "غائب لتجاوز حد التأخير المسموح به (بصمة واحدة)"
#                         else:
#                             status = AttendanceStatus.MISSING_EXIT
#                             note = "تم تسجيل بصمة دخول فقط"
#                             is_present = True
#                     else:
#                         time_out = single_log_dt.time()
#                         if law.deduct_for_missing_check_in:
#                             status = AttendanceStatus.ABSENT
#                             note = "غائب (بسبب عدم وجود بصمة دخول حسب القانون)"
#                         else:
#                             status = AttendanceStatus.MISSING_ENTRY
#                             note = "تم تسجيل بصمة خروج فقط"
#                             is_present = True
#                 else:
#                     first_log_dt = logs.first().timestamp
#                     last_log_dt = logs.last().timestamp
#                     time_in = first_log_dt.time()
#                     time_out = last_log_dt.time()
                    
#                     is_present = True
#                     status = AttendanceStatus.PRESENT

#                     if law.consider_absent_if_late_by > timedelta(0) and first_log_dt > absent_threshold_dt:
#                         status = AttendanceStatus.ABSENT
#                         is_present = False
#                         notes_list.append(f"غائب لتجاوز حد التأخير المسموح به")
#                     else:
#                         if first_log_dt > grace_period_end_dt:
#                             status = AttendanceStatus.LATE
#                             notes_list.append("متأخر")
                        
#                         if last_log_dt < early_leave_threshold_dt:
#                             if status == AttendanceStatus.PRESENT:
#                                 status = AttendanceStatus.EARLY_LEAVE
#                             notes_list.append("خرج مبكر")

#                     note = " | ".join(notes_list) if notes_list else "حاضر"

#             Attendance.objects.update_or_create(
#                 employee=employee, date=processing_date,
#                 defaults={'time_in': time_in, 'time_out': time_out, 'is_present': is_present, 'is_present1': status, 'note': note}
#             )

# print("\n*** تمت عملية المعالجة بنجاح! ***")


# =================== ابدأ النسخ من هنا ===================

# import datetime
# from datetime import timedelta
# from django.utils import timezone

# # 1. استيراد النماذج (Models) المطلوبة
# from hr.models import (
#     Employee, Shift, DataResptions, Attendance, LawFingerPrinter, 
#     AttendanceStatus, EmployeeFingerPrint
# )

# # 2. تعريف دالة تحتوي على منطق المعالجة لموظف واحد في يوم واحد
# # (هذه هي نفس دالة process_employee_attendance ولكن تم تعديلها لتعمل هنا)
# def process_employee_logic(employee, processing_date, day_str):
#     shift = employee.shift_set.filter(days__day=day_str).first()
#     if not shift:
#         return

#     try:
#         law = LawFingerPrinter.objects.get(shift=shift)
#     except LawFingerPrinter.DoesNotExist:
#         print(f"  [تحذير] لا توجد قوانين للموظف '{employee.name}'. سيتم تخطيه.")
#         return

#     is_night_shift = shift.end_time < shift.start_time
#     shift_start_dt = timezone.make_aware(datetime.datetime.combine(processing_date, shift.start_time))
    
#     if is_night_shift:
#         next_day = processing_date + timedelta(days=1)
#         shift_end_dt = timezone.make_aware(datetime.datetime.combine(next_day, shift.end_time))
#     else:
#         shift_end_dt = timezone.make_aware(datetime.datetime.combine(processing_date, shift.end_time))

#     fingerprint_ids = employee.employeefingerprint_set.values_list('id_users', flat=True)
#     if not fingerprint_ids.exists():
#         Attendance.objects.update_or_create(
#             employee=employee, date=processing_date,
#             defaults={'is_present': False, 'is_present1': AttendanceStatus.ABSENT, 'note': 'غائب (لا يوجد رقم بصمة مسجل)'}
#         )
#         return

#     logs = DataResptions.objects.filter(
#         user_id__in=fingerprint_ids,
#         timestamp__range=(shift_start_dt, shift_end_dt)
#     ).order_by('timestamp')
    
#     time_in, time_out, is_present, status, note = None, None, False, AttendanceStatus.ABSENT, "غائب (لم يتم تسجيل أي بصمة)"

#     if logs.exists():
#         print(f"  - يعالج الموظف: {employee.name} (وجدت {logs.count()} بصمة)")
        
#         grace_period_end_dt = shift_start_dt + law.entry_grace_period
#         absent_threshold_dt = grace_period_end_dt + law.consider_absent_if_late_by
#         early_leave_threshold_dt = shift_end_dt - law.early_departure_allowance
#         notes_list = []
        
#         if logs.count() == 1:
#             single_log_dt = logs.first().timestamp
#             is_entry_punch = abs(single_log_dt - shift_start_dt) < abs(single_log_dt - shift_end_dt)
#             if is_entry_punch:
#                 time_in = single_log_dt.time()
#                 if law.consider_absent_if_late_by > timedelta(0) and single_log_dt > absent_threshold_dt:
#                     status, is_present, note = AttendanceStatus.ABSENT, False, "غائب لتجاوز حد التأخير (بصمة واحدة)"
#                 else:
#                     status, is_present, note = AttendanceStatus.MISSING_EXIT, True, "تم تسجيل بصمة دخول فقط"
#             else:
#                 time_out = single_log_dt.time()
#                 if law.deduct_for_missing_check_in:
#                     status, note = AttendanceStatus.ABSENT, "غائب (لعدم وجود بصمة دخول)"
#                 else:
#                     status, is_present, note = AttendanceStatus.MISSING_ENTRY, True, "تم تسجيل بصمة خروج فقط"
#         else:
#             first_log_dt, last_log_dt = logs.first().timestamp, logs.last().timestamp
#             time_in, time_out, is_present, status = first_log_dt.time(), last_log_dt.time(), True, AttendanceStatus.PRESENT
#             if law.consider_absent_if_late_by > timedelta(0) and first_log_dt > absent_threshold_dt:
#                 status, is_present = AttendanceStatus.ABSENT, False
#                 notes_list.append("غائب لتجاوز حد التأخير المسموح به")
#             else:
#                 if first_log_dt > grace_period_end_dt:
#                     status = AttendanceStatus.LATE
#                     notes_list.append("متأخر")
#                 if last_log_dt < early_leave_threshold_dt:
#                     if status == AttendanceStatus.PRESENT: status = AttendanceStatus.EARLY_LEAVE
#                     notes_list.append("خرج مبكر")
#             note = " | ".join(notes_list) if notes_list else "حاضر"

#     Attendance.objects.update_or_create(
#         employee=employee, date=processing_date,
#         defaults={'time_in': time_in, 'time_out': time_out, 'is_present': is_present, 'is_present1': status, 'note': note}
#     )

# # 3. الكود الرئيسي الذي سيتم تنفيذه
# # (هذا هو منطق دالة handle ولكن تم تعديله ليعمل هنا)
# print("\n*** ستبدأ المعالجة لآخر 20 يومًا ***\n")

# today = timezone.now().date()
# # سنمر على آخر 20 يومًا (من الأمس وحتى 20 يومًا مضت)
# for i in range(1, 10):
#     processing_date = today - timedelta(days=i)
#     day_str = processing_date.strftime('%a').lower()[:3]
    
#     print(f"--- جاري معالجة تاريخ: {processing_date.strftime('%Y-%m-%d')} ---")
    
#     # جلب جميع الموظفين الذين لديهم دوام في هذا اليوم
#     employees_to_process = Employee.objects.filter(active=True, shift__days__day=day_str).distinct()
    
#     if not employees_to_process.exists():
#         print("  لم يتم العثور على موظفين للمعالجة في هذا اليوم.")
#         continue # انتقل إلى اليوم التالي
        
#     print(f"  تم العثور على {employees_to_process.count()} موظف للمعالجة.")
    
#     # المرور على كل موظف وتنفيذ منطق المعالجة
#     for employee in employees_to_process:
#         process_employee_logic(employee, processing_date, day_str)

# print("\n*** تمت عملية المعالجة بنجاح! ***")


# =================== انتهى النسخ هنا ===================