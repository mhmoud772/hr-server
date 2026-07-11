import type { ElementType } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { LogOut, X } from 'lucide-react'

import brandLogo from '@/assets/brand-logo.svg'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/features/auth/auth-store'
import { useAppStore } from '@/store/app-store'

type SidebarProps = {
  links: Array<{ title: string; href: string; icon: ElementType }>
}

export function Sidebar({ links }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen } = useAppStore()
  const username = useAuthStore((state) => state.username)
  const logout = useAuthStore((state) => state.logout)
  const navigate = useNavigate()

  return (
    <>
      <aside
        className={cn(
          'fixed inset-y-4 right-4 z-40 flex w-72 translate-x-full flex-col rounded-3xl border border-white/[0.08] shadow-2xl backdrop-blur-xl transition-all duration-300 lg:translate-x-0',
          'bg-gradient-to-b from-slate-900 to-slate-800 dark:from-slate-950 dark:to-slate-900 text-slate-100',
          sidebarOpen && 'translate-x-0',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/[0.08] px-5">
          <Link
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
            onClick={() => setSidebarOpen(false)}
            to="/"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full shadow-lg shadow-blue-500/25">
              <img
                alt="شعار النظام"
                className="h-10 w-10"
                src={brandLogo}
              />
            </div>
            <div>
              <p className="text-[10px] font-medium tracking-wider text-slate-400">
                منصة إدارة
              </p>
              <h1 className="text-sm font-bold tracking-normal text-white leading-tight">
                الموارد البشرية
              </h1>
            </div>
          </Link>
          <Button
            className="text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
            onClick={() => setSidebarOpen(false)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">إغلاق القائمة</span>
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4 no-scrollbar">
          {links.map((item) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-l from-blue-500/20 to-blue-500/10 text-white shadow-sm shadow-blue-500/10 ring-1 ring-inset ring-blue-500/20'
                    : 'text-slate-300 hover:bg-white/[0.06] hover:text-white',
                )
              }
              key={item.href}
              onClick={() => setSidebarOpen(false)}
              to={item.href}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0 opacity-80" />
              <span className="truncate">{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 border-t border-white/[0.08] p-4">
          <div className="rounded-xl bg-white/[0.05] px-3 py-2.5 ring-1 ring-white/[0.06]">
            <p className="text-[10px] font-medium text-slate-400">المستخدم الحالي</p>
            <p className="mt-0.5 truncate text-sm font-bold text-white">
              {username ?? 'مستخدم النظام'}
            </p>
          </div>
          <Button
            className="h-9 w-full justify-start gap-2 rounded-xl text-slate-300 transition-all hover:bg-red-500/15 hover:text-red-400"
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
          className="fixed inset-0 z-30 bg-foreground/45 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      )}
    </>
  )
}
