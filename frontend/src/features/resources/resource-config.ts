import {
  BriefcaseBusiness,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  ClipboardList,
  Contact,
  Fingerprint,
  GraduationCap,
  Landmark,
  Network,
  KeyRound,
  Scale,
  ShieldCheck,
  Timer,
  Users,
  type LucideIcon,
} from 'lucide-react'

export type ResourceColumn = {
  key: string
  label: string
}

export type ResourceField = {
  key: string
  label: string
  type:
    | 'text'
    | 'email'
    | 'number'
    | 'decimal'
    | 'date'
    | 'time'
    | 'datetime-local'
    | 'textarea'
    | 'password'
    | 'checkbox'
    | 'select'
    | 'multiselect'
  required?: boolean
  options?: Array<{ label: string; value: string | number }>
  relation?: string
  placeholder?: string
}

export type ResourceConfig = {
  key: string
  title: string
  description: string
  endpoint: string
  path: string
  group: 'operations' | 'companySetup' | 'timeSetup' | 'system'
  icon: LucideIcon
  columns: ResourceColumn[]
  formFields: ResourceField[]
}

export const resourceGroups = {
  operations: 'العمليات اليومية',
  companySetup: 'إعدادات المنشأة',
  timeSetup: 'الدوام والإجازات',
  system: 'النظام والأجهزة',
} as const

export const resourceGroupMeta: Record<
  keyof typeof resourceGroups,
  {
    description: string
    icon: LucideIcon
    path: string
  }
> = {
  operations: {
    description: 'الموظفون، الحضور، الإجازات والأرصدة.',
    icon: BriefcaseBusiness,
    path: '/groups/operations',
  },
  companySetup: {
    description: 'الهيكل الإداري، الوظائف وأنواع التوظيف.',
    icon: Building2,
    path: '/groups/companySetup',
  },
  timeSetup: {
    description: 'فترات الدوام، قوانين الإجازات، والأيام.',
    icon: CalendarClock,
    path: '/groups/timeSetup',
  },
  system: {
    description: 'أجهزة البصمة، المستخدمون والصلاحيات.',
    icon: ShieldCheck,
    path: '/groups/system',
  },
}


export const resources: ResourceConfig[] = [
  {
    key: 'employees',
    title: 'الموظفون',
    description: 'قائمة الموظفين الأساسية وبياناتهم الوظيفية.',
    endpoint: '/employees/',
    path: '/resources/employees',
    group: 'operations',
    icon: Users,
    columns: [
      { key: 'name', label: 'الاسم' },
      { key: 'number_employee', label: 'رقم الموظف' },
      { key: 'educational_level_name', label: 'المستوى' },
      { key: 'type_of_employee_name', label: 'نوع التوظيف' },
      { key: 'phone', label: 'الهاتف' },
      { key: 'active', label: 'نشط' },
    ],
    formFields: [
      { key: 'name', label: 'الاسم', type: 'text', required: true },
      { key: 'number_employee', label: 'رقم الموظف', type: 'text' },
      { key: 'address', label: 'العنوان', type: 'text', required: true },
      { key: 'phone', label: 'رقم الهاتف', type: 'text', required: true },
      { key: 'phone1', label: 'رقم الهاتف الثاني', type: 'text' },
      { key: 'email', label: 'البريد الإلكتروني', type: 'email' },
      {
        key: 'educational_level',
        label: 'المستوى التعليمي',
        type: 'select',
        relation: 'educational-levels',
        required: true,
      },
      {
        key: 'type_of_employee',
        label: 'نوع التوظيف',
        type: 'select',
        relation: 'type-of-employees',
        required: true,
      },
      {
        key: 'marital_status',
        label: 'الحالة الاجتماعية',
        type: 'select',
        relation: 'marital-statuses',
        required: true,
      },
      { key: 'basic_salary', label: 'الراتب الأساسي', type: 'decimal', required: true },
      { key: 'secondary_salary', label: 'الراتب الثانوي', type: 'decimal', required: true },
      { key: 'data_of_birth', label: 'تاريخ الميلاد', type: 'date' },
      { key: 'active', label: 'نشط', type: 'checkbox' },
      { key: 'note', label: 'ملاحظة', type: 'textarea' },
    ],
  },
  {
    key: 'jobs',
    title: 'الوظائف',
    description: 'ربط الموظفين بالإدارات والمسميات الوظيفية.',
    endpoint: '/jobs/',
    path: '/resources/jobs',
    group: 'companySetup',
    icon: BriefcaseBusiness,
    columns: [
      { key: 'employee_name', label: 'الموظف' },
      { key: 'organizational_structure_name', label: 'الإدارة' },
      { key: 'job_title_name', label: 'المسمى' },
      { key: 'create_at', label: 'تاريخ الإنشاء' },
    ],
    formFields: [
      { key: 'employee', label: 'الموظف', type: 'select', relation: 'employees', required: true },
      {
        key: 'organizational_structure',
        label: 'الإدارة',
        type: 'select',
        relation: 'organizational-structures',
        required: true,
      },
      { key: 'job_title', label: 'المسمى الوظيفي', type: 'select', relation: 'job-titles', required: true },
    ],
  },
  {
    key: 'organizational-structures',
    title: 'الهيكل الإداري',
    description: 'الإدارات والوحدات التنظيمية الهرمية.',
    endpoint: '/organizational-structures/',
    path: '/resources/organizational-structures',
    group: 'companySetup',
    icon: Network,
    columns: [
      { key: 'name', label: 'الاسم' },
      { key: 'descriptions', label: 'الوصف' },
      { key: 'parent', label: 'الأب' },
    ],
    formFields: [
      { key: 'name', label: 'الاسم', type: 'text', required: true },
      { key: 'descriptions', label: 'الوصف', type: 'textarea', required: true },
      { key: 'parent', label: 'الأب', type: 'select', relation: 'organizational-structures' },
    ],
  },
  {
    key: 'attendance',
    title: 'الحضور',
    description: 'سجلات الحضور والانصراف وحالات الدوام.',
    endpoint: '/attendance/',
    path: '/resources/attendance',
    group: 'operations',
    icon: CalendarCheck,
    columns: [
      { key: 'employee_name', label: 'الموظف' },
      { key: 'date', label: 'التاريخ' },
      { key: 'time_in', label: 'الدخول' },
      { key: 'time_out', label: 'الخروج' },
      { key: 'status_name', label: 'الحالة' },
      { key: 'note', label: 'ملاحظة' },
    ],
    formFields: [
      { key: 'employee', label: 'الموظف', type: 'select', relation: 'employees', required: true },
      { key: 'date', label: 'التاريخ', type: 'date', required: true },
      { key: 'time_in', label: 'وقت الدخول', type: 'time' },
      { key: 'time_out', label: 'وقت الخروج', type: 'time' },
      { key: 'is_present', label: 'حاضر', type: 'checkbox' },
      {
        key: 'is_present1',
        label: 'الحالة',
        type: 'select',
        options: [
          { label: 'حاضر', value: 1 },
          { label: 'متأخر', value: 2 },
          { label: 'خرج مبكر', value: 3 },
          { label: 'غائب', value: 4 },
          { label: 'بدون دخول', value: 5 },
          { label: 'بدون خروج', value: 6 },
          { label: 'إجازة', value: 7 },
          { label: 'عمل إضافي', value: 8 },
        ],
      },
      { key: 'note', label: 'ملاحظة', type: 'textarea' },
    ],
  },
  {
    key: 'fingerprint-logs',
    title: 'سجلات البصمة',
    description: 'البيانات المستقبلة من أجهزة البصمة.',
    endpoint: '/fingerprint-logs/',
    path: '/resources/fingerprint-logs',
    group: 'system',
    icon: Fingerprint,
    columns: [
      { key: 'employee_name', label: 'الموظف' },
      { key: 'device_finger_print', label: 'الجهاز' },
      { key: 'user_id', label: 'رقم البصمة' },
      { key: 'timestamp', label: 'الوقت' },
      { key: 'status', label: 'الحالة' },
    ],
    formFields: [
      {
        key: 'device_finger_print',
        label: 'جهاز البصمة',
        type: 'select',
        relation: 'fingerprint-devices',
        required: true,
      },
      { key: 'user_id', label: 'رقم البصمة', type: 'number', required: true },
      { key: 'timestamp', label: 'الوقت والتاريخ', type: 'datetime-local', required: true },
      { key: 'status', label: 'الحالة', type: 'text', required: true },
    ],
  },
  {
    key: 'fingerprint-devices',
    title: 'أجهزة البصمة',
    description: 'تعريف أجهزة البصمة ومواقعها وحالة تفعيلها.',
    endpoint: '/fingerprint-devices/',
    path: '/resources/fingerprint-devices',
    group: 'system',
    icon: ShieldCheck,
    columns: [
      { key: 'name', label: 'الجهاز' },
      { key: 'location', label: 'الموقع' },
      { key: 'ip_address', label: 'IP' },
      { key: 'port', label: 'المنفذ' },
      { key: 'is_active', label: 'مفعل' },
    ],
    formFields: [
      { key: 'name', label: 'اسم الجهاز', type: 'text', required: true },
      { key: 'location', label: 'الموقع', type: 'text', required: true },
      { key: 'ip_address', label: 'عنوان IP', type: 'text', required: true },
      { key: 'port', label: 'المنفذ', type: 'number', required: true },
      { key: 'is_active', label: 'مفعل', type: 'checkbox' },
      { key: 'password', label: 'كلمة السر', type: 'text' },
    ],
  },

  {
    key: 'shifts',
    title: 'فترات الدوام',
    description: 'تعريف الشفتات والأيام والموظفين المرتبطين بها.',
    endpoint: '/shifts/',
    path: '/resources/shifts',
    group: 'timeSetup',
    icon: Timer,
    columns: [
      { key: 'name', label: 'الفترة' },
      { key: 'start_time', label: 'البداية' },
      { key: 'end_time', label: 'النهاية' },
      { key: 'days_names', label: 'الأيام' },
      { key: 'employee_names', label: 'الموظفون' },
    ],
    formFields: [
      { key: 'name', label: 'اسم الفترة', type: 'text', required: true },
      { key: 'start_time', label: 'بداية الوقت', type: 'time', required: true },
      { key: 'end_time', label: 'نهاية الوقت', type: 'time', required: true },
      { key: 'days', label: 'الأيام', type: 'multiselect', relation: 'days', required: true },
      { key: 'employee', label: 'الموظفون', type: 'multiselect', relation: 'employees', required: true },
    ],
  },
  {
    key: 'fingerprint-laws',
    title: 'قوانين البصمة',
    description: 'قواعد السماح والتأخير ونسيان البصمات.',
    endpoint: '/fingerprint-laws/',
    path: '/resources/fingerprint-laws',
    group: 'timeSetup',
    icon: Scale,
    columns: [
      { key: 'name', label: 'القانون' },
      { key: 'shift_name', label: 'الفترة' },
      { key: 'entry_grace_period', label: 'سماح الدخول' },
      { key: 'consider_absent_if_late_by', label: 'حد الغياب' },
      { key: 'early_departure_allowance', label: 'سماح الخروج' },
    ],
    formFields: [
      { key: 'name', label: 'اسم القانون', type: 'text', required: true },
      { key: 'shift', label: 'فترة الدوام', type: 'select', relation: 'shifts', required: true },
      {
        key: 'entry_grace_period',
        label: 'فترة السماح عند الحضور',
        type: 'text',
        placeholder: '00:10:00',
      },
      {
        key: 'consider_absent_if_late_by',
        label: 'اعتبار غائب إذا تأخر أكثر من',
        type: 'text',
        placeholder: '00:30:00',
      },
      {
        key: 'early_departure_allowance',
        label: 'فترة السماح عند الانصراف',
        type: 'text',
        placeholder: '00:10:00',
      },
      {
        key: 'last_time_for_calculating_entry_time',
        label: 'آخر وقت لحساب الدخول',
        type: 'text',
        placeholder: '00:00:00',
      },
      {
        key: 'last_time_for_calculating_entry_out',
        label: 'آخر وقت لحساب الخروج',
        type: 'text',
        placeholder: '00:00:00',
      },
      { key: 'deduct_for_missing_check_in', label: 'احتساب غياب عند نسيان الدخول', type: 'checkbox' },
      { key: 'deduct_for_missing_check_out', label: 'تطبيق إجراء عند نسيان الخروج', type: 'checkbox' },
    ],
  },
  {
    key: 'leave-requests',
    title: 'طلبات الإجازة',
    description: 'طلبات الإجازات وحالات الاعتماد والرفض.',
    endpoint: '/leave-requests/',
    path: '/resources/leave-requests',
    group: 'operations',
    icon: CalendarDays,
    columns: [
      { key: 'employee_name', label: 'الموظف' },
      { key: 'leave_type_name', label: 'نوع الإجازة' },
      { key: 'start_day', label: 'البداية' },
      { key: 'end_day', label: 'النهاية' },
      { key: 'status_name', label: 'الحالة' },
    ],
    formFields: [
      { key: 'employee', label: 'الموظف', type: 'select', relation: 'employees', required: true },
      { key: 'leave_type', label: 'نوع الإجازة', type: 'select', relation: 'leave-types', required: true },
      { key: 'start_day', label: 'تاريخ البداية', type: 'date', required: true },
      { key: 'end_day', label: 'تاريخ النهاية', type: 'date', required: true },
      {
        key: 'status',
        label: 'الحالة',
        type: 'select',
        options: [
          { label: 'في الانتظار', value: 1 },
          { label: 'مقبول', value: 2 },
          { label: 'مرفوضة', value: 3 },
        ],
      },
    ],
  },
  {
    key: 'leave-balances',
    title: 'أرصدة الإجازات',
    description: 'رصيد كل موظف حسب نوع الإجازة.',
    endpoint: '/leave-balances/',
    path: '/resources/leave-balances',
    group: 'operations',
    icon: ClipboardList,
    columns: [
      { key: 'employee_name', label: 'الموظف' },
      { key: 'leave_type_name', label: 'نوع الإجازة' },
      { key: 'balance', label: 'الرصيد' },
    ],
    formFields: [
      { key: 'employee', label: 'الموظف', type: 'select', relation: 'employees', required: true },
      { key: 'leave_type', label: 'نوع الإجازة', type: 'select', relation: 'leave-types', required: true },
      { key: 'balance', label: 'الرصيد', type: 'decimal', required: true },
    ],
  },
  {
    key: 'leave-types',
    title: 'أنواع الإجازات',
    description: 'تعريف أنواع الإجازات وشروط ظهورها.',
    endpoint: '/leave-types/',
    path: '/resources/leave-types',
    group: 'timeSetup',
    icon: CalendarClock,
    columns: [
      { key: 'name', label: 'النوع' },
      { key: 'descrptions', label: 'الوصف' },
      { key: 'minimum_request', label: 'الطلب قبل' },
      { key: 'due', label: 'مخفي من الطلبات' },
    ],
    formFields: [
      { key: 'name', label: 'الاسم', type: 'text', required: true },
      { key: 'descrptions', label: 'شرح الإجازة', type: 'textarea', required: true },
      { key: 'minimum_request', label: 'الطلب قبل كم يوم', type: 'number', required: true },
      { key: 'due', label: 'لا تظهر في الطلبات', type: 'checkbox' },
    ],
  },
  {
    key: 'leave-laws',
    title: 'قوانين الإجازات',
    description: 'قواعد الاستحقاق حسب نوع الموظف والحالة الاجتماعية.',
    endpoint: '/leave-laws/',
    path: '/resources/leave-laws',
    group: 'timeSetup',
    icon: Landmark,
    columns: [
      { key: 'leave_type_name', label: 'نوع الإجازة' },
      { key: 'employee_type_names', label: 'أنواع الموظفين' },
      { key: 'marital_status_names', label: 'الحالات الاجتماعية' },
    ],
    formFields: [
      { key: 'leave_type', label: 'نوع الإجازة', type: 'select', relation: 'leave-types', required: true },
      {
        key: 'employee_type_is_given',
        label: 'أنواع الموظفين',
        type: 'multiselect',
        relation: 'type-of-employees',
        required: true,
      },
      {
        key: 'employee_marital_status_is_given',
        label: 'الحالات الاجتماعية',
        type: 'multiselect',
        relation: 'marital-statuses',
        required: true,
      },
    ],
  },

  {
    key: 'leave-days',
    title: 'أيام الإجازات',
    description: 'الأيام الثابتة أو السنوية المرتبطة بالإجازات.',
    endpoint: '/leave-days/',
    path: '/resources/leave-days',
    group: 'timeSetup',
    icon: CalendarDays,
    columns: [
      { key: 'name', label: 'الاسم' },
      { key: 'leave_type_name', label: 'نوع الإجازة' },
      { key: 'day', label: 'اليوم' },
      { key: 'month', label: 'الشهر' },
      { key: 'type_date_name', label: 'نوع التاريخ' },
    ],
    formFields: [
      { key: 'leave_type', label: 'نوع الإجازة', type: 'select', relation: 'leave-types', required: true },
      { key: 'name', label: 'الاسم', type: 'text', required: true },
      { key: 'annual', label: 'كل سنة', type: 'checkbox' },
      { key: 'day', label: 'اليوم', type: 'number', required: true },
      { key: 'month', label: 'الشهر', type: 'number', required: true },
      {
        key: 'type_date',
        label: 'نوع التاريخ',
        type: 'select',
        options: [
          { label: 'الهجري', value: 1 },
          { label: 'الميلادي', value: 2 },
        ],
      },
    ],
  },
  {
    key: 'groups',
    title: 'المجموعات',
    description: 'مجموعات الصلاحيات للمستخدمين.',
    endpoint: '/groups/',
    path: '/resources/groups',
    group: 'system',
    icon: ShieldCheck,
    columns: [
      { key: 'name', label: 'الاسم' },
    ],
    formFields: [
      { key: 'name', label: 'اسم المجموعة', type: 'text', required: true },
    ],
  },
  {
    key: 'users',
    title: 'المستخدمون',
    description: 'حسابات الدخول والصلاحيات الأساسية للنظام.',
    endpoint: '/users/',
    path: '/resources/users',
    group: 'system',
    icon: KeyRound,
    columns: [
      { key: 'username', label: 'اسم المستخدم' },
      { key: 'full_name', label: 'الاسم' },
      { key: 'email', label: 'البريد' },
      { key: 'is_active', label: 'نشط' },
      { key: 'is_staff', label: 'مشرف' },
      { key: 'last_login', label: 'آخر دخول' },
    ],
    formFields: [
      { key: 'username', label: 'اسم المستخدم', type: 'text', required: true },
      {
        key: 'password',
        label: 'كلمة المرور',
        type: 'password',
        placeholder: 'اتركها فارغة عند التعديل إذا لا تريد تغييرها',
      },
      { key: 'first_name', label: 'الاسم الأول', type: 'text' },
      { key: 'last_name', label: 'الاسم الأخير', type: 'text' },
      { key: 'email', label: 'البريد الإلكتروني', type: 'email' },
      { key: 'is_active', label: 'نشط', type: 'checkbox' },
      { key: 'is_staff', label: 'مشرف / دخول لوحة الإدارة', type: 'checkbox' },
      { key: 'is_superuser', label: 'مدير كامل الصلاحيات', type: 'checkbox' },
    ],
  },
  {
    key: 'job-titles',
    title: 'المسميات الوظيفية',
    description: 'المسميات ومهامها.',
    endpoint: '/job-titles/',
    path: '/resources/job-titles',
    group: 'companySetup',
    icon: Contact,
    columns: [
      { key: 'name', label: 'المسمى' },
      { key: 'tesk', label: 'المهام' },
    ],
    formFields: [
      { key: 'name', label: 'المسمى', type: 'text', required: true },
      { key: 'tesk', label: 'شرح المهام', type: 'textarea', required: true },
    ],
  },
  {
    key: 'educational-levels',
    title: 'المستويات التعليمية',
    description: 'القيم المرجعية للمؤهلات والمستويات التعليمية.',
    endpoint: '/educational-levels/',
    path: '/resources/educational-levels',
    group: 'companySetup',
    icon: GraduationCap,
    columns: [{ key: 'name', label: 'المستوى' }],
    formFields: [{ key: 'name', label: 'المستوى', type: 'text', required: true }],
  },
  {
    key: 'type-of-employees',
    title: 'أنواع التوظيف',
    description: 'موظف، متعاقد، يومي وغيرها.',
    endpoint: '/type-of-employees/',
    path: '/resources/type-of-employees',
    group: 'companySetup',
    icon: Building2,
    columns: [
      { key: 'display', label: 'النوع' },
      { key: 'type_of_employee', label: 'القيمة' },
    ],
    formFields: [
      {
        key: 'type_of_employee',
        label: 'نوع التوظيف',
        type: 'select',
        required: true,
        options: [
          { label: 'موظف', value: '1' },
          { label: 'متعاقد', value: '2' },
          { label: 'يومي', value: '3' },
        ],
      },
    ],
  },
  {
    key: 'marital-statuses',
    title: 'الحالات الاجتماعية',
    description: 'القيم المرجعية للحالة الاجتماعية.',
    endpoint: '/marital-statuses/',
    path: '/resources/marital-statuses',
    group: 'companySetup',
    icon: Contact,
    columns: [
      { key: 'display', label: 'الحالة' },
      { key: 'marital_status', label: 'القيمة' },
    ],
    formFields: [
      {
        key: 'marital_status',
        label: 'الحالة الاجتماعية',
        type: 'select',
        required: true,
        options: [
          { label: 'متزوج', value: '1' },
          { label: 'عازب', value: '2' },
        ],
      },
    ],
  },
  {
    key: 'days',
    title: 'أيام الأسبوع',
    description: 'أيام الدوام المستخدمة في الشفتات.',
    endpoint: '/days/',
    path: '/resources/days',
    group: 'timeSetup',
    icon: CalendarDays,
    columns: [
      { key: 'day_name', label: 'اليوم' },
      { key: 'day', label: 'القيمة' },
    ],
    formFields: [
      {
        key: 'day',
        label: 'اليوم',
        type: 'select',
        required: true,
        options: [
          { label: 'السبت', value: 'sat' },
          { label: 'الأحد', value: 'sun' },
          { label: 'الإثنين', value: 'mon' },
          { label: 'الثلاثاء', value: 'tue' },
          { label: 'الأربعاء', value: 'wed' },
          { label: 'الخميس', value: 'thu' },
          { label: 'الجمعة', value: 'fri' },
        ],
      },
    ],
  },
]

export function getResourceByKey(key: string | undefined) {
  return resources.find((resource) => resource.key === key)
}

export function getResourcesByGroup(groupKey: string | undefined) {
  if (!groupKey || !(groupKey in resourceGroups)) {
    return []
  }

  return resources.filter((resource) => resource.group === groupKey)
}
