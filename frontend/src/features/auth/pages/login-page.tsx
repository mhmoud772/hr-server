import { useState, useRef } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import brandLogo from '@/assets/brand-logo.svg'
import { useAuthStore } from '@/features/auth/auth-store'

const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'اسم المستخدم أو رقم الموظف يجب ألا يقل عن 3 أحرف'),
  password: z.string().min(6, 'كلمة المرور يجب ألا تقل عن 6 أحرف'),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const login = useAuthStore((state) => state.login)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: localStorage.getItem('last_username') ?? '',
      password: '',
      rememberMe: true,
    },
  })

  const [loginError, setLoginError] = useState<string | null>(null)

  // Spotlight effect state
  const cardRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }

  // Dynamic Greeting
  const [greeting] = useState(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'صباح الخير'
    if (hour < 18) return 'طاب مساؤك'
    return 'مساء الخير'
  })

  const onSubmit = async (values: LoginFormValues) => {
    setLoginError(null)
    try {
      if (values.rememberMe) {
        localStorage.setItem('last_username', values.username)
      } else {
        localStorage.removeItem('last_username')
      }
      await login(values.username, values.password)
      navigate(from, { replace: true })
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'فشل تسجيل الدخول')
    }
  }

  if (isAuthenticated) {
    return <Navigate replace to="/" />
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-slate-200/60 dark:bg-background p-4 sm:p-8">
      {/* Subtle Enterprise Grid Background */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Login Container (Animated) */}
      <section className="relative z-10 w-full max-w-[420px] animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Gradient Border Wrapper */}
        <div
          className="group relative rounded-3xl bg-gradient-to-b from-primary/30 via-outline-variant/20 to-transparent p-[1px] shadow-2xl shadow-primary/5"
          ref={cardRef}
          onMouseMove={handleMouseMove}
        >
          {/* Spotlight Hover Effect */}
          <div
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300 group-hover:opacity-100"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}px ${mousePosition.y}px, hsl(var(--primary) / 0.1), transparent 40%)`,
            }}
          />

          {/* Inner Card */}
          <div className="relative flex flex-col rounded-[calc(1.5rem-1px)] bg-surface/90 p-8 backdrop-blur-xl dark:bg-surface-variant/40 sm:p-10">

            {/* Branding Header */}
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
                <img
                  alt="شعار النظام"
                  className="h-10 w-10"
                  src={brandLogo}
                />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {greeting}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                الرجاء إدخال بيانات الاعتماد للوصول للنظام.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>

              {/* Username Field */}
              <div className="group/field space-y-2.5">
                <label className="text-sm font-semibold text-foreground transition-colors group-focus-within/field:text-primary" htmlFor="username">
                  رقم الموظف أو المستخدم
                </label>
                <div className="relative">
                  <UserRound className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within/field:text-primary" />
                  <Input
                    autoComplete="username"
                    className="h-12 border-outline-variant/40 bg-background/50 pr-11 text-base transition-all focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary hover:border-outline-variant"
                    disabled={isSubmitting}
                    id="username"
                    placeholder="أدخل رقمك الوظيفي"
                    type="text"
                    {...register('username')}
                  />
                </div>
                {errors.username && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="group/field space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-foreground transition-colors group-focus-within/field:text-primary" htmlFor="password">
                    كلمة المرور
                  </label>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within/field:text-primary" />
                  <Input
                    autoComplete="current-password"
                    className="h-12 border-outline-variant/40 bg-background/50 px-11 text-base transition-all focus:border-primary focus:bg-background focus:ring-1 focus:ring-primary hover:border-outline-variant"
                    disabled={isSubmitting}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                  />
                  <button
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground/50 transition-colors hover:bg-outline-variant/30 hover:text-foreground"
                    onClick={() => setShowPassword((value) => !value)}
                    type="button"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs font-medium text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="h-4 w-4 rounded border-outline-variant/50 text-primary focus:ring-primary"
                  {...register('rememberMe')}
                />
                <label htmlFor="rememberMe" className="text-sm font-medium leading-none text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                  تذكرني على هذا الجهاز
                </label>
              </div>

              {/* Error Message */}
              {loginError && (
                <div className="animate-in slide-in-from-top-2 flex items-center justify-center rounded-lg border border-destructive/20 bg-destructive/10 py-3 text-sm font-medium text-destructive">
                  {loginError}
                </div>
              )}

              {/* Submit Button */}
              <Button
                className="mt-6 h-12 w-full text-base font-bold tracking-wide transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    <span>جارِ المصادقة...</span>
                  </div>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Trust Badges / Social Proof */}
      <div className="relative z-10 mt-12 flex flex-col items-center justify-center space-y-3 opacity-60 transition-opacity hover:opacity-100">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
          POWERED BY AL-WASATIA UNIVERSITY &copy; {new Date().getFullYear()}
        </div>
      </div>
    </main>
  )
}
