import { useEffect, useMemo, useRef, useState } from 'react'
import { useMutation, useQueries } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useToast } from '@/components/ui/toast'
import {
  Bell,
  CalendarCheck,
  ChevronDown,
  Clock3,
  ClipboardCheck,
  Fingerprint,
  FileSpreadsheet,
  Home,
  KeyRound,
  LogOut,
  Menu,
  Moon,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sun,
  Users,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import brandLogo from '@/assets/brand-logo.svg'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/features/auth/auth-store'
import { getResourceRecords, type ResourceRecord } from '@/features/resources/api'
import {
  resourceGroupMeta,
  resourceGroups,
  resources,
} from '@/features/resources/resource-config'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'

const workflowLinks = [
  {
    title: 'ملف الموظفين',
    href: '/workflows/employees',
    icon: Users,
  },
  {
    title: 'اعتماد الإجازات',
    href: '/workflows/leave-approvals',
    icon: ClipboardCheck,
  },
  {
    title: 'حضور اليوم',
    href: '/workflows/attendance',
    icon: CalendarCheck,
  },
  {
    title: 'التقارير',
    href: '/workflows/reports',
    icon: FileSpreadsheet,
  },
  {
    title: 'فحص اتصال البصمة',
    href: '/workflows/fingerprint-integration',
    icon: Fingerprint,
  },
]

const groupDescriptions = {
  hr: 'الموظفون والوظائف',
  attendance: 'الدوام والبصمة',
  leaves: 'الطلبات والأرصدة',
  settings: 'القيم المرجعية',
} as const

const breadcrumbLabels: Record<string, string> = {
  '/': 'الرئيسية',
  '/workflows/employees': 'ملف الموظفين',
  '/workflows/leave-approvals': 'اعتماد الإجازات',
  '/workflows/attendance': 'حضور اليوم',
  '/workflows/reports': 'التقارير',
  '/workflows/fingerprint-integration': 'فحص اتصال البصمة',
}

const notificationQueries = [
  { key: 'leave-requests', endpoint: '/leave-requests/' },
  { key: 'fingerprint-devices', endpoint: '/fingerprint-devices/' },
  { key: 'employee-fingerprints', endpoint: '/employee-fingerprints/' },
  { key: 'employees', endpoint: '/employees/' },
  { key: 'attendance', endpoint: '/attendance/' },
]

function formatToday() {
  return new Intl.DateTimeFormat('ar', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
}

function recordTitle(record: ResourceRecord) {
  return String(record.employee_name ?? record.name ?? record.title ?? 'سجل')
}

export function DashboardLayout() {
  const { sidebarOpen, setSidebarOpen, theme, toggleSidebar, toggleTheme } =
    useAppStore()
  const username = useAuthStore((state) => state.username)
  const logout = useAuthStore((state) => state.logout)
  const { notify } = useToast()
  const menuRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState('')
  const [activeMenu, setActiveMenu] = useState<
    'notifications' | 'user' | 'more' | null
  >(null)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState({ old_password: '', new_password: '', confirm_password: '' })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const passwordMutation = useMutation({
    mutationFn: (payload: { old_password: string; new_password: string; confirm_password: string }) =>
      apiClient.post('/change-password/', payload),
    onSuccess: () => {
      setPasswordModalOpen(false)
      setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })
      setPasswordError(null)
      notify({ title: 'تم التغيير', message: 'تم تغيير كلمة المرور بنجاح.', variant: 'success' })
    },
    onError: (error: unknown) => {
      const detail =
        typeof error === 'object' && error !== null && 'response' in error
          ? (error as { response: { data: { detail?: string } } }).response?.data?.detail ?? 'فشل تغيير كلمة المرور'
          : 'تعذر الاتصال بالخادم'
      setPasswordError(detail)
    },
  })
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const fallback = {
      hr: true,
      attendance: false,
      leaves: false,
      settings: false,
    }

    try {
      return {
        ...fallback,
        ...JSON.parse(localStorage.getItem('sidebar_open_groups') ?? '{}'),
      }
    } catch {
      return fallback
    }
  })
  const location = useLocation()
  const navigate = useNavigate()

  const notificationResults = useQueries({
    queries: notificationQueries.map((query) => ({
      queryKey: ['layout-notifications', query.key],
      queryFn: () => getResourceRecords(query.endpoint),
      staleTime: 60_000,
    })),
  })

  const [leaves, devices, fingerprints, employees, attendance] =
    notificationResults.map((query) => query.data?.records ?? [])

  const pendingLeaves = leaves.filter((record) => record.status === 1).length
  const inactiveDevices = devices.filter((record) => !record.is_active).length
  const employeesWithoutFingerprint = employees.filter(
    (employee) =>
      !fingerprints.some(
        (fingerprint) => String(fingerprint.employee) === String(employee.id),
      ),
  ).length
  const missingPunches = attendance.filter(
    (record) => record.is_present1 === 5 || record.is_present1 === 6,
  ).length
  const notificationCount =
    pendingLeaves + inactiveDevices + employeesWithoutFingerprint + missingPunches
  const apiHasError = notificationResults.some((query) => query.isError)
  const apiIsLoading = notificationResults.some((query) => query.isLoading)

  const notificationItems = [
    {
      title: 'طلبات إجازة معلقة',
      description: `${pendingLeaves} طلب بانتظار الاعتماد أو الرفض.`,
      value: pendingLeaves,
      href: '/workflows/leave-approvals',
      variant: 'warning' as const,
    },
    {
      title: 'موظفون بدون بصمة',
      description: `${employeesWithoutFingerprint} موظف يحتاج ربط بصمة.`,
      value: employeesWithoutFingerprint,
      href: '/resources/employee-fingerprints',
      variant: 'default' as const,
    },
    {
      title: 'أجهزة غير مفعلة',
      description: `${inactiveDevices} جهاز يحتاج مراجعة حالة التشغيل.`,
      value: inactiveDevices,
      href: '/resources/fingerprint-devices',
      variant: 'destructive' as const,
    },
    {
      title: 'سجلات حضور ناقصة',
      description: `${missingPunches} سجل يحتاج استكمال دخول أو خروج.`,
      value: missingPunches,
      href: '/resources/attendance',
      variant: 'warning' as const,
    },
  ]

  const quickAddItems = [
    { title: 'موظف جديد', href: '/resources/employees' },
    { title: 'طلب إجازة', href: '/resources/leave-requests' },
    { title: 'سجل حضور', href: '/resources/attendance' },
    { title: 'جهاز بصمة', href: '/resources/fingerprint-devices' },
  ]

  const searchResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (term.length < 2) return []

    return [
      ...employees.map((record) => ({
        type: 'موظف',
        title: recordTitle(record),
        subtitle: String(record.number_employee ?? record.phone ?? 'موظف'),
        href: '/workflows/employees',
      })),
      ...leaves.map((record) => ({
        type: 'إجازة',
        title: recordTitle(record),
        subtitle: `إجازة ${String(record.start_day ?? '')}`,
        href: '/workflows/leave-approvals',
      })),
    ]
      .filter((item) =>
        `${item.title} ${item.subtitle}`.toLowerCase().includes(term),
      )
      .slice(0, 6)
  }, [employees, leaves, searchTerm])

  const activeResource = useMemo(
    () => resources.find((item) => item.path === location.pathname),
    [location.pathname],
  )
  const activeGroup = useMemo(() => {
    if (activeResource) return activeResource.group

    return Object.entries(resourceGroupMeta).find(
      ([, meta]) => meta.path === location.pathname,
    )?.[0]
  }, [activeResource, location.pathname])

  const normalizedSidebarSearch = sidebarSearchTerm.trim().toLowerCase()

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setActiveMenu(null)
        setSearchTerm('')
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  useEffect(() => {
    localStorage.setItem('sidebar_open_groups', JSON.stringify(openGroups))
  }, [openGroups])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }

      if (event.key === 'Escape') {
        setActiveMenu(null)
        setSearchTerm('')
        setPasswordModalOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const pageTitle = useMemo(() => {
    if (breadcrumbLabels[location.pathname]) return breadcrumbLabels[location.pathname]

    const resource = resources.find((item) => item.path === location.pathname)
    if (resource) return resource.title

    const group = Object.entries(resourceGroupMeta).find(
      ([, meta]) => meta.path === location.pathname,
    )
    if (group) return resourceGroups[group[0] as keyof typeof resourceGroups]

    return 'النظام'
  }, [location.pathname])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside
        className={cn(
          'fixed inset-y-0 right-0 z-40 flex w-72 translate-x-full flex-col border-l border-[#2b6278] bg-[#2b6278] text-white shadow-soft transition-transform duration-200 lg:translate-x-0',
          sidebarOpen && 'translate-x-0',
        )}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/15 px-5">
          <Link
            className="flex items-center gap-3"
            onClick={() => setSidebarOpen(false)}
            to="/"
          >
            <img
              alt="شعار النظام"
              className="h-11 w-11 rounded-xl bg-white/10 p-1 shadow-sm"
              src={brandLogo}
            />
            <div>
              <p className="text-xs font-medium tracking-normal text-white/70">
                منصة إدارة
              </p>
              <h1 className="text-lg font-bold tracking-normal text-white">
                الموارد البشرية
              </h1>
            </div>
          </Link>
          <Button
            className="text-white hover:bg-white/15 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">إغلاق القائمة</span>
          </Button>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-5">
          <div className="relative">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
            <Input
              className="border-white/15 bg-white/10 pr-9 text-white placeholder:text-white/45 focus-visible:ring-white/30"
              onChange={(event) => setSidebarSearchTerm(event.target.value)}
              placeholder="بحث في القائمة"
              value={sidebarSearchTerm}
            />
          </div>

          <div className="space-y-1">
            <p className="px-3 pb-2 text-xs font-semibold text-white/55">
              نظرة عامة
            </p>
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white',
                  isActive && 'bg-white text-[#2b6278] shadow-sm',
                )
              }
              end
              onClick={() => setSidebarOpen(false)}
              to="/"
            >
              <Home className="h-5 w-5" />
              الرئيسية
            </NavLink>
          </div>

          <div className="space-y-1">
            <p className="px-3 pb-2 text-xs font-semibold text-white/55">
              العمل اليومي
            </p>
            {workflowLinks.map((item) => (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-full px-3 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white',
                    isActive && 'bg-white text-[#2b6278] shadow-sm',
                  )
                }
                key={item.href}
                onClick={() => setSidebarOpen(false)}
                to={item.href}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{item.title}</span>
                {item.href === '/workflows/leave-approvals' && pendingLeaves > 0 && (
                  <span className="mr-auto rounded-full bg-white px-2 py-0.5 text-xs font-bold text-[#2b6278]">
                    {pendingLeaves}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          <div className="space-y-2">
            <p className="px-3 pb-1 text-xs font-semibold text-white/55">
              البيانات والإعدادات
            </p>
            {Object.entries(resourceGroups).map(([groupKey, groupTitle]) => {
              const group = groupKey as keyof typeof resourceGroups
              const groupMeta = resourceGroupMeta[group]
              const GroupIcon = groupMeta.icon
              const groupResources = resources.filter(
                (resource) => resource.group === group,
              )
              const filteredResources = groupResources.filter((resource) =>
                `${resource.title} ${resource.description}`
                  .toLowerCase()
                  .includes(normalizedSidebarSearch),
              )
              const isGroupActive = activeGroup === groupKey
              const isGroupOpen = openGroups[groupKey] || isGroupActive
              const isSearchingSidebar = Boolean(normalizedSidebarSearch)
              const visibleResources =
                expandedGroups[groupKey] || isSearchingSidebar
                  ? filteredResources
                  : filteredResources.slice(0, 5)
              const hiddenCount = filteredResources.length - visibleResources.length

              return (
                <div
                  className={cn(
                    'space-y-1 rounded-2xl transition-colors',
                    isGroupActive && 'bg-white/10 p-1',
                  )}
                  key={groupKey}
                >
                  <button
                    className={cn(
                      'flex w-full items-center gap-3 rounded-full px-3 py-2.5 text-sm font-semibold text-white/80 transition-colors hover:bg-white/15 hover:text-white',
                      isGroupOpen && 'bg-white/10 text-white',
                      isGroupActive && 'bg-white text-[#2b6278] shadow-sm',
                    )}
                    onClick={() =>
                      setOpenGroups((current) => ({
                        ...current,
                        [groupKey]: !current[groupKey],
                      }))
                    }
                    type="button"
                  >
                    <GroupIcon className="h-5 w-5 shrink-0" />
                    <span className="min-w-0 flex-1 text-right">
                      <span className="block truncate">{groupTitle}</span>
                      <span
                        className={cn(
                          'block truncate text-xs font-normal',
                          isGroupActive ? 'text-[#2b6278]/70' : 'text-white/50',
                        )}
                      >
                        {groupDescriptions[group]}
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-4 w-4 shrink-0 transition-transform',
                        isGroupOpen && 'rotate-180',
                      )}
                    />
                  </button>

                  {(isGroupOpen || isSearchingSidebar) && (
                    <div className="mr-5 space-y-1 border-r border-white/15 pr-3">
                      <NavLink
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/15 hover:text-white',
                            isActive && 'bg-white text-[#2b6278] shadow-sm',
                          )
                        }
                        onClick={() => setSidebarOpen(false)}
                        to={groupMeta.path}
                      >
                        <GroupIcon className="h-4 w-4 shrink-0" />
                        عرض المجموعة
                      </NavLink>
                      {!filteredResources.length && (
                        <div className="px-3 py-2 text-xs text-white/45">
                          لا توجد نتائج في هذا القسم.
                        </div>
                      )}
                      {visibleResources.map((resource) => (
                        <NavLink
                          className={({ isActive }) =>
                            cn(
                              'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/15 hover:text-white',
                              isActive && 'bg-white text-[#2b6278] shadow-sm',
                            )
                          }
                          key={resource.key}
                          onClick={() => setSidebarOpen(false)}
                          to={resource.path}
                        >
                          <resource.icon className="h-4 w-4 shrink-0" />
                          <span className="truncate">{resource.title}</span>
                        </NavLink>
                      ))}
                      {hiddenCount > 0 && (
                        <button
                          className="w-full rounded-full px-3 py-2 text-right text-xs font-semibold text-white/60 transition-colors hover:bg-white/15 hover:text-white"
                          onClick={() =>
                            setExpandedGroups((current) => ({
                              ...current,
                              [groupKey]: true,
                            }))
                          }
                          type="button"
                        >
                          عرض {hiddenCount} روابط إضافية
                        </button>
                      )}
                      {expandedGroups[groupKey] && !isSearchingSidebar && (
                        <button
                          className="w-full rounded-full px-3 py-2 text-right text-xs font-semibold text-white/60 transition-colors hover:bg-white/15 hover:text-white"
                          onClick={() =>
                            setExpandedGroups((current) => ({
                              ...current,
                              [groupKey]: false,
                            }))
                          }
                          type="button"
                        >
                          عرض أقل
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </nav>

        <div className="space-y-3 border-t border-white/15 p-4">
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-xs text-white/60">المستخدم الحالي</p>
            <p className="mt-1 truncate text-sm font-bold text-white">
              {username ?? 'مستخدم النظام'}
            </p>
          </div>
          <Button
            className="w-full justify-start text-white/80 hover:bg-white/15 hover:text-white"
            onClick={() => {
              logout()
              navigate('/login', { replace: true })
            }}
            type="button"
            variant="ghost"
          >
            <LogOut className="h-4 w-4" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          aria-label="إغلاق القائمة"
          className="fixed inset-0 z-30 bg-inverse-surface/45 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      )}

      <div className="lg:pr-72">
        <header
          className="sticky top-0 z-20 flex min-h-16 items-center gap-3 border-b border-outline-variant bg-surface-container-lowest/95 px-4 py-3 backdrop-blur lg:px-8"
          ref={menuRef}
        >
          <Button
            className="lg:hidden"
            onClick={toggleSidebar}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">فتح القائمة</span>
          </Button>

          <div className="min-w-0 flex-1 lg:flex-none">
            <h2 className="truncate text-base font-bold lg:hidden">{pageTitle}</h2>
          </div>

          <div className="hidden min-w-0 flex-col lg:flex">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link className="hover:text-primary" to="/">
                الرئيسية
              </Link>
              <span>/</span>
              <span className="truncate text-foreground">{pageTitle}</span>
            </div>
            <h2 className="mt-1 truncate text-lg font-bold">{pageTitle}</h2>
          </div>

          <div className="relative hidden max-w-md flex-1 md:block">
            <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="bg-surface pl-20 pr-9"
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  navigate(searchResults[0]?.href ?? '/workflows/employees')
                  setSearchTerm('')
                }
              }}
              placeholder="بحث سريع عن موظف"
              ref={searchInputRef}
              value={searchTerm}
              type="search"
            />
            <kbd className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 rounded border border-outline-variant bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground xl:inline-flex">
              Ctrl K
            </kbd>
            {searchTerm.trim().length >= 2 && (
              <div className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-lg border border-outline-variant bg-popover shadow-lg">
                {apiIsLoading && (
                  <div className="p-4 text-sm text-muted-foreground">
                    جاري تحميل النتائج...
                  </div>
                )}
                {!apiIsLoading && !searchResults.length && (
                  <div className="p-4 text-sm text-muted-foreground">
                    لا توجد نتائج مطابقة.
                  </div>
                )}
                {searchResults.map((item) => (
                  <button
                    className="block w-full border-b border-outline-variant px-4 py-3 text-right transition-colors last:border-0 hover:bg-muted"
                    key={`${item.href}-${item.title}-${item.subtitle}`}
                    onClick={() => {
                      navigate(item.href)
                      setSearchTerm('')
                    }}
                    type="button"
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">{item.title}</span>
                      <Badge variant={item.type === 'موظف' ? 'default' : 'warning'}>
                        {item.type}
                      </Badge>
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {item.subtitle}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <Button
              className="relative"
              onClick={() =>
                setActiveMenu((menu) =>
                  menu === 'notifications' ? null : 'notifications',
                )
              }
              size="icon"
              title="الإشعارات"
              type="button"
              variant="outline"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
              <span className="sr-only">الإشعارات</span>
            </Button>
            {activeMenu === 'notifications' && (
              <div className="absolute left-0 top-12 z-30 w-80 overflow-hidden rounded-lg border border-outline-variant bg-popover shadow-lg">
                <div className="border-b border-outline-variant p-4">
                  <p className="font-bold">الإشعارات</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    أهم التنبيهات المرتبطة ببيانات النظام.
                  </p>
                </div>
                <div className="p-2">
                  {!notificationItems.some((item) => item.value > 0) && (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      لا توجد إشعارات حالياً.
                    </div>
                  )}
                  {notificationItems
                    .filter((item) => item.value > 0)
                    .map((item) => (
                      <button
                        className={cn(
                          'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-right transition-colors hover:bg-muted',
                          item.variant === 'destructive' && 'bg-destructive/5',
                          item.variant === 'warning' && 'bg-warning/10',
                        )}
                        key={item.title}
                        onClick={() => {
                          navigate(item.href)
                          setActiveMenu(null)
                        }}
                        type="button"
                      >
                        <span>
                          <span className="block text-sm font-semibold">
                            {item.title}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {item.description}
                          </span>
                        </span>
                        <Badge variant={item.variant}>{item.value}</Badge>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <Button
              onClick={() =>
                setActiveMenu((menu) => (menu === 'more' ? null : 'more'))
              }
              size="icon"
              title="المزيد"
              type="button"
              variant="outline"
            >
              <MoreHorizontal className="h-5 w-5" />
              <span className="sr-only">المزيد</span>
            </Button>
            {activeMenu === 'more' && (
              <div className="absolute left-0 top-12 z-30 w-72 overflow-hidden rounded-lg border border-outline-variant bg-popover p-2 shadow-lg">
                <div className="border-b border-outline-variant px-3 py-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock3 className="h-4 w-4 text-primary" />
                    {formatToday()}
                  </div>
                  <div
                    className={cn(
                      'mt-3 flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
                      apiHasError
                        ? 'border-destructive/30 bg-destructive/10 text-destructive'
                        : 'border-outline-variant bg-surface-container-low text-on-surface-variant',
                    )}
                  >
                    {apiHasError ? (
                      <WifiOff className="h-4 w-4" />
                    ) : (
                      <Wifi className="h-4 w-4 text-success" />
                    )}
                    {apiHasError
                      ? 'اتصال متعذر'
                      : apiIsLoading
                        ? 'يتحقق من الاتصال...'
                        : 'متصل بالواجهة الخلفية'}
                  </div>
                </div>

                <button
                  className="mt-2 flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-right text-sm transition-colors hover:bg-muted"
                  onClick={toggleTheme}
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    {theme === 'dark' ? (
                      <Sun className="h-4 w-4" />
                    ) : (
                      <Moon className="h-4 w-4" />
                    )}
                    {theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن'}
                  </span>
                </button>

                <div className="my-2 border-t border-outline-variant" />
                <p className="px-3 pb-1 text-xs font-semibold text-muted-foreground">
                  إضافة سريعة
                </p>
                {quickAddItems.map((item) => (
                  <button
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-sm font-medium transition-colors hover:bg-muted"
                    key={item.href}
                    onClick={() => {
                      navigate(item.href)
                      setActiveMenu(null)
                    }}
                    type="button"
                  >
                    <Plus className="h-4 w-4 text-primary" />
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="relative hidden md:block">
            <button
              className="flex items-center gap-2 rounded-md border border-outline-variant bg-surface-container-low p-1.5 text-sm font-semibold transition-colors hover:bg-muted xl:px-3 xl:py-2"
              onClick={() =>
                setActiveMenu((menu) => (menu === 'user' ? null : 'user'))
              }
              type="button"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {(username ?? 'م').slice(0, 1).toUpperCase()}
              </span>
              <span className="hidden max-w-24 truncate xl:inline">
                {username ?? 'مستخدم'}
              </span>
              <ChevronDown className="hidden h-4 w-4 text-muted-foreground xl:block" />
            </button>
            {activeMenu === 'user' && (
              <div className="absolute left-0 top-12 z-30 w-56 overflow-hidden rounded-lg border border-outline-variant bg-popover p-2 shadow-lg">
                <div className="border-b border-outline-variant px-3 py-3">
                  <p className="text-sm font-bold">{username ?? 'مستخدم النظام'}</p>
                  <p className="mt-1 text-xs text-muted-foreground">جلسة محلية</p>
                </div>
                <button
                  className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-sm transition-colors hover:bg-muted"
                  onClick={() => {
                    navigate('/resources/employees')
                    setActiveMenu(null)
                  }}
                  type="button"
                >
                  <Users className="h-4 w-4" />
                  ملف الموظفين
                </button>
                <button
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-sm transition-colors hover:bg-muted"
                  onClick={() => {
                    navigate('/groups/settings')
                    setActiveMenu(null)
                  }}
                  type="button"
                >
                  <Settings className="h-4 w-4" />
                  الإعدادات
                </button>
                <button
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-sm transition-colors hover:bg-muted"
                  onClick={() => {
                    setPasswordModalOpen(true)
                    setActiveMenu(null)
                  }}
                  type="button"
                >
                  <KeyRound className="h-4 w-4" />
                  تغيير كلمة المرور
                </button>
                <button
                  className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-sm text-destructive transition-colors hover:bg-destructive/10"
                  onClick={() => {
                    logout()
                    navigate('/login', { replace: true })
                  }}
                  type="button"
                >
                  <LogOut className="h-4 w-4" />
                  تسجيل الخروج
                </button>
              </div>
            )}
          </div>
        </header>

        {passwordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/45 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-xl border border-outline-variant bg-popover p-5 shadow-lg">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-bold">تغيير كلمة المرور</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    أدخل كلمة المرور الحالية والجديدة.
                  </p>
                </div>
                <Button
                  onClick={() => { setPasswordModalOpen(false); setPasswordError(null); setPasswordForm({ old_password: '', new_password: '', confirm_password: '' }) }}
                  size="icon"
                  title="إغلاق"
                  type="button"
                  variant="ghost"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-5 space-y-3">
                <Input
                  placeholder="كلمة المرور الحالية"
                  type="password"
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, old_password: e.target.value }))}
                />
                <Input
                  placeholder="كلمة المرور الجديدة"
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, new_password: e.target.value }))}
                />
                <Input
                  placeholder="تأكيد كلمة المرور الجديدة"
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm((f) => ({ ...f, confirm_password: e.target.value }))}
                />
              </div>
              {passwordError && (
                <div className="mt-3 rounded-md border border-destructive-container bg-destructive-container/40 p-3 text-sm text-destructive-container-foreground">
                  {passwordError}
                </div>
              )}
              <div className="mt-5 flex justify-end gap-2">
                <Button
                  onClick={() => { setPasswordModalOpen(false); setPasswordError(null); setPasswordForm({ old_password: '', new_password: '', confirm_password: '' }) }}
                  type="button"
                  variant="outline"
                >
                  إلغاء
                </Button>
                <Button
                  disabled={passwordMutation.isPending}
                  onClick={() => passwordMutation.mutate(passwordForm)}
                  type="button"
                >
                  {passwordMutation.isPending ? 'جار الحفظ...' : 'حفظ'}
                </Button>
              </div>
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
