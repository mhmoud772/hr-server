import { useMemo, useState, type ElementType } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { CalendarCheck, ClipboardCheck, FileSpreadsheet, Home, Users, Settings } from 'lucide-react'

import { resourceGroupMeta, resourceGroups, resources } from '@/features/resources/resource-config'
import { cn } from '@/lib/utils'
import { PasswordModal } from './components/password-modal'
import { Sidebar } from './components/sidebar'
import { Header } from './components/header'

type TopNavKey = keyof typeof resourceGroups | 'settings'
type SidebarLink = {
  title: string
  href: string
  icon: ElementType
}

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
]

export function DashboardLayout() {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const derivedTopNav = useMemo<TopNavKey>(() => {
    if (location.pathname === '/settings') return 'settings'

    const groupMatch = location.pathname.match(/^\/groups\/([^/]+)/)
    if (groupMatch?.[1] && groupMatch[1] in resourceGroups) {
      return groupMatch[1] as keyof typeof resourceGroups
    }

    const res = resources.find((r) => location.pathname.startsWith(r.path))
    if (res) return res.group

    if (location.pathname.startsWith('/workflows') || location.pathname === '/') return 'operations'

    return 'operations'
  }, [location.pathname])

  const currentSidebarLinks = useMemo<SidebarLink[]>(() => {
    if (derivedTopNav === 'settings') {
      return [
        { title: 'البيانات الأساسية', href: '/settings', icon: Settings },
        ...Object.entries(resourceGroups).map(([groupKey, groupTitle]) => {
          const meta = resourceGroupMeta[groupKey as keyof typeof resourceGroups]
          return {
            title: groupTitle,
            href: meta.path,
            icon: meta.icon,
          }
        }),
      ]
    }

    const links: SidebarLink[] = []

    if (derivedTopNav === 'operations') {
      links.push(
        { title: 'الرئيسية', href: '/', icon: Home },
        ...workflowLinks,
      )
    }

    const groupResources = resources.filter((r) => r.group === derivedTopNav)
    links.push(
      ...groupResources.map((r) => ({
        title: r.title,
        href: r.path,
        icon: r.icon,
      })),
    )

    return links
  }, [derivedTopNav])

  const topNavItems = useMemo(
    () => [
      ...Object.entries(resourceGroups).map(([key, title]) => {
        const typedKey = key as keyof typeof resourceGroups
        return {
          key: typedKey,
          title,
          icon: resourceGroupMeta[typedKey].icon,
          href:
            typedKey === 'operations'
              ? '/'
              : resources.find((resource) => resource.group === typedKey)?.path ?? '/',
        }
      }),
      {
        key: 'settings' as const,
        title: 'الإعدادات والنظام',
        icon: Settings,
        href: '/settings',
      },
    ],
    [],
  )

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar links={currentSidebarLinks} />

      <div className="lg:pr-80">
        <Header onOpenPasswordModal={() => setPasswordModalOpen(true)} />

        {/* Top Navbar (Floating Island Design) */}
        <div className="sticky top-[88px] z-10 mx-4 mt-6 lg:mx-8">
          <div className="flex gap-1.5 overflow-x-auto rounded-2xl border border-border/60 bg-card/70 p-1.5 shadow-sm backdrop-blur-xl no-scrollbar">
            {topNavItems.map((item) => {
              const Icon = item.icon
              const isActive = derivedTopNav === item.key

              return (
                <button
                  key={item.key}
                  onClick={() => navigate(item.href)}
                  className={cn(
                    'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                      : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </button>
              )
            })}
          </div>
        </div>

        <PasswordModal
          isOpen={passwordModalOpen}
          onClose={() => setPasswordModalOpen(false)}
        />

        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
