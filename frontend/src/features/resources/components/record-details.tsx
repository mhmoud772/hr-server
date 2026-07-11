import { SlideOver } from '@/components/ui/slide-over'
import type { ResourceRecord } from '@/features/resources/api'

type RecordDetailsProps = {
  onClose: () => void
  open: boolean
  record: ResourceRecord | null
  title: string
}

function formatValue(value: unknown) {
  if (value === null || value === undefined || value === '') {
    return '-'
  }

  if (typeof value === 'boolean') {
    return value ? 'نعم' : 'لا'
  }

  if (Array.isArray(value)) {
    return value.length ? value.join('، ') : '-'
  }

  if (typeof value === 'object') {
    return JSON.stringify(value)
  }

  return String(value)
}

const ARABIC_DICTIONARY: Record<string, string> = {
  id: 'المعرف',
  username: 'اسم المستخدم',
  first_name: 'الاسم الأول',
  last_name: 'الاسم الأخير',
  full_name: 'الاسم الكامل',
  email: 'البريد الإلكتروني',
  is_active: 'حالة الحساب',
  active: 'حالة الحساب',
  is_staff: 'صلاحيات إدارية',
  is_superuser: 'صلاحيات مطلقة',
  created_at: 'تاريخ الإنشاء',
  updated_at: 'تاريخ التحديث',
  create_at: 'تاريخ الإنشاء',
  update_at: 'تاريخ التحديث',
  phone: 'رقم الهاتف',
  phone1: 'رقم هاتف إضافي',
  address: 'العنوان',
  role: 'الدور',
  status: 'الحالة',
  status_name: 'الحالة',
  password: 'كلمة المرور',
  name: 'الاسم',
  description: 'الوصف',
  title: 'العنوان',
  date: 'التاريخ',
  type: 'النوع',
  note: 'ملاحظات',
  cv: 'السيرة الذاتية',
  id_card: 'رقم الهوية',
  date_of_birth: 'تاريخ الميلاد',
  data_of_birth: 'تاريخ الميلاد',
  basic_salary: 'الراتب الأساسي',
  secondary_salary: 'الراتب الإضافي / البدلات',
  number_employee: 'الرقم الوظيفي',
  marital_status: 'الحالة الاجتماعية (معرف)',
  marital_status_name: 'الحالة الاجتماعية',
  type_of_employee: 'نوع الموظف (معرف)',
  type_of_employee_name: 'نوع الموظف',
  educational_level: 'المستوى التعليمي (معرف)',
  educational_level_name: 'المستوى التعليمي',
  employee: 'الموظف (معرف)',
  employee_name: 'اسم الموظف',
  time_in: 'وقت الدخول',
  time_out: 'وقت الخروج',
  is_present: 'حالة الحضور',
  is_present1: 'حالة الحضور (معرف)',
}

function formatKey(key: string) {
  // Normalize key: lowercase and replace spaces with underscores
  const normalizedKey = key.toLowerCase().replace(/ /g, '_')

  // Check if we have an Arabic translation for this key
  if (ARABIC_DICTIONARY[normalizedKey]) {
    return ARABIC_DICTIONARY[normalizedKey]
  }

  // Fallback: Convert snake_case or camelCase to Capitalized Words
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase())
}

export function RecordDetails({ onClose, open, record, title }: RecordDetailsProps) {
  if (!open || !record) {
    return null
  }

  return (
    <SlideOver
      isOpen={open}
      onClose={onClose}
      title={title}
      description="تفاصيل ومعلومات السجل الكاملة"
      className="sm:w-[500px]"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Object.entries(record).map(([key, value]) => {
          const strValue = formatValue(value)
          const isLongValue = strValue.length > 40
          const isBoolean = typeof value === 'boolean'

          return (
            <div
              className={`flex flex-col gap-1.5 rounded-2xl border border-primary/5 bg-background/50 p-4 shadow-sm ring-1 ring-black/5 backdrop-blur-md transition-colors hover:bg-background/80 dark:bg-secondary/30 dark:ring-white/5 ${
                isLongValue ? 'sm:col-span-2' : ''
              }`}
              key={key}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {formatKey(key)}
              </span>

              {isBoolean ? (
                <span
                  className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    value
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {strValue}
                </span>
              ) : (
                <span className="break-words text-sm font-semibold text-foreground">
                  {strValue}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </SlideOver>
  )
}
