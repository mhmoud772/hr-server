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
          'fixed inset-y-4 right-4 z-40 flex w-72 translate-x-full flex-col rounded-3xl border border-slate-600/50 bg-slate-700/90 text-slate-100 shadow-xl backdrop-blur-xl transition-all duration-300 lg:translate-x-0',
          sidebarOpen && 'translate-x-0',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-600/50 px-4">
          <Link
            className="flex items-center gap-3 transition-opacity hover:opacity-80"
            onClick={() => setSidebarOpen(false)}
            to="/"
          >
            <img
              alt="شعار النظام"
              className="h-10 w-10 rounded-xl bg-slate-600/50 p-1 shadow-sm ring-1 ring-white/10"
              src={brandLogo}
            />
            <div>
              <p className="text-[10px] font-medium tracking-normal text-slate-300">
                منصة إدارة
              </p>
              <h1 className="text-base font-bold tracking-normal text-slate-50 leading-tight">
                الموارد البشرية
              </h1>
            </div>
          </Link>
          <Button
            className="text-muted-foreground hover:bg-surface-variant hover:text-foreground lg:hidden"
            onClick={() => setSidebarOpen(false)}
            size="icon"
            type="button"
            variant="ghost"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">إغلاق القائمة</span>
          </Button>
        </div>

        <nav className="flex-1 space-y-1.5 overflow-y-auto p-4 no-scrollbar">
          {links.map((item) => (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md ring-1 ring-primary/30'
                    : 'text-slate-200 hover:bg-slate-600/50 hover:text-white',
                )
              }
              key={item.href}
              onClick={() => setSidebarOpen(false)}
              to={item.href}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.title}</span>
            </NavLink>
          ))}
        </nav>

        <div className="space-y-2 border-t border-slate-600/50 p-3">
          <div className="rounded-xl bg-slate-600/30 px-3 py-2.5 ring-1 ring-white/10">
            <p className="text-[10px] text-slate-300">المستخدم الحالي</p>
            <p className="truncate text-sm font-bold text-slate-50">
              {username ?? 'مستخدم النظام'}
            </p>
          </div>
          <Button
            className="h-9 w-full justify-start rounded-xl text-slate-200 transition-all hover:bg-red-500/20 hover:text-red-300"
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
    </>
  )
}
