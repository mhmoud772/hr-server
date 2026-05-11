import re

with open('frontend/src/features/resources/resource-config.ts', 'r') as f:
    content = f.read()

# 1. Update ResourceConfig type
content = re.sub(
    r"group: 'hr' \| 'attendance' \| 'leaves' \| 'settings'",
    r"group: 'operations' | 'companySetup' | 'timeSetup' | 'system'",
    content
)

# 2. Update resourceGroups
new_groups = """export const resourceGroups = {
  operations: 'العمليات اليومية',
  companySetup: 'إعدادات المنشأة',
  timeSetup: 'الدوام والإجازات',
  system: 'النظام والأجهزة',
} as const"""

content = re.sub(
    r"export const resourceGroups = \{[^}]+\}\s*as const",
    new_groups,
    content
)

# 3. Update resourceGroupMeta
new_meta = """export const resourceGroupMeta: Record<
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
}"""

content = re.sub(
    r"export const resourceGroupMeta: Record<.*?\}",
    new_meta,
    content,
    flags=re.DOTALL
)

# 4. Map keys to new groups
group_mapping = {
    'employees': 'operations',
    'attendance': 'operations',
    'leave-requests': 'operations',
    'leave-balances': 'operations',
    
    'jobs': 'companySetup',
    'organizational-structures': 'companySetup',
    'job-titles': 'companySetup',
    'educational-levels': 'companySetup',
    'type-of-employees': 'companySetup',
    'marital-statuses': 'companySetup',
    
    'shifts': 'timeSetup',
    'days': 'timeSetup',
    'leave-laws': 'timeSetup',
    'leave-types': 'timeSetup',
    'leave-days': 'timeSetup',
    'fingerprint-laws': 'timeSetup',
    
    'fingerprint-devices': 'system',
    'fingerprint-logs': 'system',
    'groups': 'system',
    'users': 'system',
}

# Find each block and replace group
for key, new_group in group_mapping.items():
    pattern = r"(key:\s*'" + key + r"'.*?group:\s*)'[^']+'"
    content = re.sub(pattern, r"\g<1>'" + new_group + r"'", content, flags=re.DOTALL)

with open('frontend/src/features/resources/resource-config.ts', 'w') as f:
    f.write(content)

