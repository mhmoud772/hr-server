import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, LockKeyhole, UserRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import brandLogo from '@/assets/brand-logo.svg'
import { useAuthStore } from '@/features/auth/auth-store'

const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'اسم المستخدم أو رقم الموظف يجب ألا يقل عن 3 أحرف'),
  password: z.string().min(6, 'كلمة المرور يجب ألا تقل عن 6 أحرف'),
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
    },
  })

  const [loginError, setLoginError] = useState<string | null>(null)

  const onSubmit = async (values: LoginFormValues) => {
    setLoginError(null)
    try {
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
    <main className="grid min-h-screen bg-background lg:grid-cols-[0.9fr_1.1fr]">
      <section className="hidden bg-primary p-10 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3">
          <img
            alt="شعار نظام الموارد البشرية"
            className="h-14 w-14 rounded-lg shadow-lg"
            src={brandLogo}
          />
          <div>
            <p className="text-sm text-white/70">منصة إدارية عامة</p>
            <h1 className="text-2xl font-bold tracking-normal">
              نظام الموارد البشرية
            </h1>
          </div>
        </div>

        <div className="max-w-lg space-y-5">
          <p className="text-sm font-semibold text-white/70">بوابة داخلية</p>
          <h2 className="text-4xl font-bold leading-tight tracking-normal">
            إدارة الموظفين والإجازات والحضور من مكان واحد.
          </h2>
          <p className="text-base leading-8 text-white/75">
            واجهة تشغيلية هادئة للمتابعة اليومية، اعتماد الطلبات، واستعراض
            بيانات الموارد البشرية.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-white/80">
          <div className="rounded-lg border border-white/15 bg-white/10 p-4">
            استخدم حساب الموظف المصرح له من النظام. في حال عدم وجود حساب، تواصل مع مدير النظام.
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center p-4 lg:p-10">
        <Card className="w-full max-w-md shadow-soft">
          <CardHeader className="space-y-3">
          <img
            alt="شعار نظام الموارد البشرية"
            className="mx-auto h-16 w-16 rounded-xl shadow-md"
            src={brandLogo}
          />
          <div className="text-center">
            <CardTitle className="text-2xl">دخول لوحة الموارد البشرية</CardTitle>
            <CardDescription className="mt-2">
              استخدم اسم المستخدم أو رقم الموظف للوصول إلى النظام.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="username">
                اسم المستخدم / رقم الموظف
              </label>
              <div className="relative">
                <UserRound className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoComplete="username"
                  className="pr-9"
                  disabled={isSubmitting}
                  id="username"
                  placeholder="مثال: emp1001 أو hr.admin"
                  type="text"
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-destructive">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">
                كلمة المرور
              </label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  autoComplete="current-password"
                  className="px-9"
                  disabled={isSubmitting}
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                />
                <button
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-primary"
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
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            {loginError && (
              <div className="rounded-md border border-destructive-container bg-destructive-container/40 p-3 text-sm text-destructive-container-foreground">
                {loginError}
              </div>
            )}

            <Button className="w-full" disabled={isSubmitting} type="submit">
              {isSubmitting ? 'جار الدخول...' : 'دخول'}
            </Button>
          </form>
        </CardContent>
      </Card>
      </section>
    </main>
  )
}
