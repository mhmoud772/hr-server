import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueries, useQuery } from '@tanstack/react-query'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  ChevronDown,
  Clock3,
  KeyRound,
  LogOut,
  Menu,
  MoreHorizontal,
  Moon,
  Search,
  Settings,
  Sun,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/app-store'
import { useAuthStore } from '@/features/auth/auth-store'
import { getResourceRecords } from '@/features/resources/api'
import { resourceGroupMeta, resourceGroups, resources } from '@/features/resources/resource-config'

const breadcrumbLabels: Record<string, string> = {
  '/': 'الرئيسية',
  '/workflows/employees': 'ملف الموظفين',
  '/workflows/leave-approvals': 'اعتماد الإجازات',
  '/workflows/attendance': 'حضور اليوم',
  '/workflows/reports': 'التقارير',
}

const notificationQueries = [
  { key: 'leave-requests', endpoint: '/leave-requests/' },
  { key: 'fingerprint-devices', endpoint: '/fingerprint-devices/' },
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

type HeaderProps = {
  onOpenPasswordModal: () => void
}

export function Header({ onOpenPasswordModal }: HeaderProps) {
  const { theme, toggleSidebar, toggleTheme } = useAppStore()
  const username = useAuthStore((state) => state.username)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()
  const location = useLocation()

  const menuRef = useRef<HTMLDivElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeMenu, setActiveMenu] = useState<'notifications' | 'user' | 'more' | null>(null)

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchTerm])

  const { data: searchResultsData, isFetching: isSearching } = useQuery({
    queryKey: ['global-search', debouncedSearchTerm],
    queryFn: async () => {
      if (debouncedSearchTerm.trim().length < 2) return []
      const res = await apiClient.get(`/global-search/?q=${encodeURIComponent(debouncedSearchTerm)}`)
      return res.data as Array<{ type: string; title: string; subtitle: string; href: string }>
    },
    enabled: debouncedSearchTerm.trim().length >= 2,
  })

  const searchResults = searchResultsData ?? []

  const notificationResults = useQueries({
    queries: notificationQueries.map((query) => ({
      queryKey: ['layout-notifications', query.key],
      queryFn: () => getResourceRecords(query.endpoint),
      staleTime: 60_000,
    })),
  })

  const [leaves, devices, , attendance] = notificationResults.map((query) => query.data?.records ?? [])

  const pendingLeaves = leaves.filter((record) => record.status === 1).length
  const inactiveDevices = devices.filter((record) => !record.is_active).length
  const missingPunches = attendance.filter((record) => record.is_present1 === 5 || record.is_present1 === 6).length
  const notificationCount = pendingLeaves + inactiveDevices + missingPunches
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
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      }

      if (event.key === 'Escape') {
        setActiveMenu(null)
        setSearchTerm('')
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

    if (location.pathname === '/settings') return 'الإعدادات والنظام'

    return 'النظام'
  }, [location.pathname])

  return (
    <header
      className="sticky top-4 z-20 mx-4 flex min-h-16 items-center justify-between gap-3 rounded-2xl border border-outline-variant/30 bg-background/80 px-4 shadow-sm backdrop-blur-xl lg:mx-8 lg:px-6"
      ref={menuRef}
    >
      <div className="flex w-full items-center justify-between lg:hidden">
        <Button
          className="shrink-0 text-muted-foreground hover:text-foreground"
          onClick={toggleSidebar}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">فتح القائمة</span>
        </Button>
        <div className="min-w-0 flex-1 px-4 text-center">
          <h2 className="truncate text-base font-bold">{pageTitle}</h2>
        </div>
        <div className="w-9 shrink-0" />
      </div>

      <div className="hidden flex-1 flex-col justify-center lg:flex">
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <Link className="transition-colors hover:text-primary" to="/">
            الرئيسية
          </Link>
          <span>/</span>
        </div>
        <h2 className="truncate text-sm font-bold text-foreground">{pageTitle}</h2>
      </div>

      <div className="relative hidden max-w-2xl flex-[2] items-center rounded-xl border border-outline-variant/50 bg-surface-variant/30 px-2 transition-colors focus-within:border-primary/50 focus-within:bg-surface-variant/50 focus-within:shadow-sm md:flex">
        <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="h-12 w-full border-0 bg-transparent pl-20 pr-12 text-base shadow-none focus-visible:ring-0"
          onChange={(event) => setSearchTerm(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              navigate(searchResults[0]?.href ?? '/workflows/employees')
              setSearchTerm('')
            }
          }}
          placeholder="بحث سريع عن موظف، معاملة، إعداد..."
          ref={searchInputRef}
          value={searchTerm}
          type="search"
        />
        <kbd className="pointer-events-none absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-outline-variant bg-background px-2 py-1 text-[10px] font-semibold text-muted-foreground shadow-sm xl:inline-flex">
          ⌘ K
        </kbd>
        {searchTerm.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-12 z-30 overflow-hidden rounded-lg border border-outline-variant bg-popover shadow-lg">
            {isSearching && (
              <div className="p-4 space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-1/3 animate-pulse rounded bg-muted-foreground/20"></div>
                      <div className="h-5 w-16 animate-pulse rounded-full bg-muted-foreground/20"></div>
                    </div>
                    <div className="h-3 w-1/2 animate-pulse rounded bg-muted-foreground/10"></div>
                  </div>
                ))}
              </div>
            )}
            {!isSearching && !searchResults.length && (
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

      <div className="hidden flex-1 items-center justify-end gap-1 md:flex">
        <div className="relative">
          <Button
            className="relative rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => setActiveMenu((menu) => (menu === 'notifications' ? null : 'notifications'))}
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
                <p className="mt-1 text-xs text-muted-foreground">أهم التنبيهات المرتبطة ببيانات النظام.</p>
              </div>
              <div className="p-2">
                {apiIsLoading && (
                  <div className="space-y-2 p-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col gap-2 rounded-md p-2">
                        <div className="flex items-center justify-between">
                          <div className="h-4 w-1/2 animate-pulse rounded bg-muted-foreground/20"></div>
                          <div className="h-5 w-8 animate-pulse rounded-full bg-muted-foreground/20"></div>
                        </div>
                        <div className="h-3 w-3/4 animate-pulse rounded bg-muted-foreground/10"></div>
                      </div>
                    ))}
                  </div>
                )}
                {!apiIsLoading && !notificationItems.some((item) => item.value > 0) && (
                  <div className="p-4 text-center text-sm text-muted-foreground">لا توجد إشعارات حالياً.</div>
                )}
                {!apiIsLoading &&
                  notificationItems
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
                          <span className="block text-sm font-semibold">{item.title}</span>
                          <span className="mt-1 block text-xs text-muted-foreground">{item.description}</span>
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
            className="rounded-full text-muted-foreground hover:text-foreground"
            onClick={() => setActiveMenu((menu) => (menu === 'more' ? null : 'more'))}
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
                  {apiHasError ? <WifiOff className="h-4 w-4" /> : <Wifi className="h-4 w-4 text-success" />}
                  {apiHasError ? 'اتصال متعذر' : apiIsLoading ? 'يتحقق من الاتصال...' : 'متصل بالواجهة الخلفية'}
                </div>
              </div>

              <button
                className="mt-2 flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-right text-sm transition-colors hover:bg-muted"
                onClick={toggleTheme}
                type="button"
              >
                <span className="flex items-center gap-2">
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  المظهر (الوضع {theme === 'dark' ? 'النهاري' : 'الليلي'})
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className="group flex items-center gap-2 rounded-full p-1 text-sm font-semibold transition-colors hover:bg-muted xl:pl-3 xl:pr-1"
            onClick={() => setActiveMenu((menu) => (menu === 'user' ? null : 'user'))}
            type="button"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground transition-transform group-hover:scale-105">
              {(username ?? 'م').slice(0, 1).toUpperCase()}
            </span>
            <span className="hidden max-w-24 truncate text-muted-foreground transition-colors group-hover:text-foreground xl:inline">
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
                className="mt-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-sm transition-colors hover:bg-muted"
                onClick={() => {
                  navigate('/settings')
                  setActiveMenu(null)
                }}
                type="button"
              >
                <Settings className="h-4 w-4" />
                الإعدادات والنظام
              </button>

              <button
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-right text-sm transition-colors hover:bg-muted"
                onClick={() => {
                  onOpenPasswordModal()
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
      </div>
    </header>
  )
}
