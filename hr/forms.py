from django import forms
from django.utils import timezone

class MonthlyReportForm(forms.Form):
    MONTH_CHOICES = [
        (1, 'يناير'), (2, 'فبراير'), (3, 'مارس'), (4, 'أبريل'),
        (5, 'مايو'), (6, 'يونيو'), (7, 'يوليو'), (8, 'أغسطس'),
        (9, 'سبتمبر'), (10, 'أكتوبر'), (11, 'نوفمبر'), (12, 'ديسمبر'),
    ]
    
    current_year = timezone.now().year
    YEAR_CHOICES = [(y, y) for y in range(current_year - 5, current_year + 1)]

    month = forms.ChoiceField(label="الشهر", choices=MONTH_CHOICES, required=True)
    year = forms.ChoiceField(label="السنة", choices=YEAR_CHOICES, required=True, initial=current_year)