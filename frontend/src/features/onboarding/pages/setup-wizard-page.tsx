import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2, CheckCircle2, Rocket, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Stepper } from '@/components/ui/stepper'
import { getResourceByKey } from '@/features/resources/resource-config'

import { ResourceForm } from '@/features/resources/components/resource-form'
import { SlideOver } from '@/components/ui/slide-over'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createResourceRecord } from '@/features/resources/api'
import { useToast } from '@/components/ui/toast'
import { completeSetup } from '@/features/core/api'

const WIZARD_STEPS = [
  { title: 'الترحيب', description: 'بيانات المنشأة الأساسية' },
  { title: 'التهيئة المرجعية', description: 'إعداد الأقسام والمسميات' },
  { title: 'الاعتماد', description: 'جاهز للانطلاق' },
]

export function SetupWizardPage() {
  const navigate = useNavigate()
  const { notify } = useToast()
  const queryClient = useQueryClient()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  // Company form state
  const [companyName, setCompanyName] = useState('جامعة الوسطية')
  const [companyEmail, setCompanyEmail] = useState('admin@example.com')
  const [currency, setCurrency] = useState('YER')

  // Form states for SlideOver
  const [activeResourceKey, setActiveResourceKey] = useState<string | null>(null)

  const activeResource = activeResourceKey ? getResourceByKey(activeResourceKey) : null

  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleComplete = async () => {
    setIsCompleting(true)
    try {
      await completeSetup({ company_name: companyName, company_email: companyEmail, currency })
      await queryClient.invalidateQueries({ queryKey: ['system-status'] })
      navigate('/')
    } catch {
      setIsCompleting(false)
      notify({
        title: 'خطأ',
        message: 'حدث خطأ أثناء إكمال التهيئة. حاول مرة أخرى.',
        variant: 'error',
      })
    }
  }

  const saveMutation = useMutation({
    mutationFn: (payload: Record<string, unknown>) => {
      if (!activeResource) throw new Error('Resource not found')
      return createResourceRecord(activeResource.endpoint, payload)
    },
    onSuccess: () => {
      setActiveResourceKey(null)
      notify({
        title: 'تمت الإضافة',
        message: `تم إضافة السجل لـ ${activeResource?.title} بنجاح.`,
        variant: 'success',
      })
    },
    onError: () => {
      notify({
        title: 'خطأ',
        message: 'حدث خطأ أثناء حفظ البيانات.',
        variant: 'error',
      })
    }
  })

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center border-b border-border/30 bg-background/50 px-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Rocket className="h-5 w-5" />
          </div>
          <h1 className="text-lg font-bold">معالج تهيئة النظام</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center p-6 md:p-12">
        <div className="w-full max-w-3xl">
          <Stepper steps={WIZARD_STEPS} currentStep={currentStep} className="mb-12" />

          <div className="rounded-3xl border border-border/30 bg-background p-6 shadow-xl dark:bg-secondary/20 md:p-10">
            
            {/* STEP 0: Welcome & Company Profile */}
            {currentStep === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8 flex items-center gap-4 text-primary">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">مرحباً بك في نظامك الجديد!</h2>
                    <p className="text-muted-foreground mt-1">لنقم بضبط إعدادات منشأتك لتتناسب مع هويتك.</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <label className="block space-y-2 text-sm font-medium">
                    <span>اسم المنشأة / الشركة</span>
                    <Input
                      placeholder="مثال: شركة التقنية الحديثة"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </label>
                  <label className="block space-y-2 text-sm font-medium">
                    <span>البريد الإلكتروني الرسمي</span>
                    <Input
                      type="email"
                      placeholder="info@company.com"
                      value={companyEmail}
                      onChange={(e) => setCompanyEmail(e.target.value)}
                    />
                  </label>
                  <label className="block space-y-2 text-sm font-medium">
                    <span>العملة الافتراضية</span>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="YER">ريال يمني (YER)</option>
                      <option value="SAR">ريال سعودي (SAR)</option>
                      <option value="USD">دولار أمريكي (USD)</option>
                    </select>
                  </label>
                </div>
              </div>
            )}

            {/* STEP 1: Lookup Tables */}
            {currentStep === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold">الجداول المرجعية (Lookups)</h2>
                  <p className="text-muted-foreground mt-1">
                    أضف بعض البيانات المرجعية الأساسية الآن لتسهيل إدخال الموظفين لاحقاً.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Shortcut Cards */}
                  {[
                    { key: 'organizational-structures', title: 'الهيكل الإداري', desc: 'أضف الإدارات والأقسام' },
                    { key: 'job-titles', title: 'المسميات الوظيفية', desc: 'مثل: مهندس، مدير' },
                    { key: 'educational-levels', title: 'المستويات التعليمية', desc: 'مثل: بكالوريوس، ماجستير' },
                    { key: 'type-of-employees', title: 'أنواع الموظفين', desc: 'مثل: دوام كامل، عقد' },
                  ].map((item) => (
                    <button
                      key={item.key}
                      onClick={() => setActiveResourceKey(item.key)}
                      className="group flex flex-col items-start rounded-2xl border border-border/30 bg-card p-5 text-start transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md"
                    >
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">{item.title}</span>
                      <span className="mt-1 text-xs text-muted-foreground">{item.desc}</span>
                      <span className="mt-3 inline-flex items-center text-xs font-semibold text-primary">
                        إضافة الآن <ArrowLeft className="ml-1 h-3 w-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 2: Complete */}
            {currentStep === 2 && (
              <div className="flex flex-col items-center justify-center py-10 text-center animate-in zoom-in-95 duration-500">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-success/20 text-success ring-8 ring-success/10">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <h2 className="text-3xl font-bold text-foreground">التهيئة اكتملت!</h2>
                <p className="text-muted-foreground mt-4 max-w-md leading-relaxed">
                  تم ضبط النظام بنجاح وجاهز للاستخدام. يمكنك دائماً تعديل هذه البيانات وإضافة المزيد من قائمة "الإعدادات".
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-12 flex items-center justify-between border-t border-border/30 pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ArrowRight className="h-4 w-4" /> السابق
              </Button>

              {currentStep < WIZARD_STEPS.length - 1 ? (
                <Button onClick={handleNext} className="gap-2 px-8">
                  التالي <ArrowLeft className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleComplete}
                  disabled={isCompleting}
                  className="gap-2 px-8 bg-success hover:bg-success/90 text-success-foreground"
                >
                  {isCompleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> جارٍ الحفظ...
                    </>
                  ) : (
                    <>بدء الاستخدام <Rocket className="h-4 w-4" /></>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* SlideOver Form for Lookups */}
      {activeResource && (
        <SlideOver
          isOpen={Boolean(activeResourceKey)}
          onClose={() => setActiveResourceKey(null)}
          title={`إضافة ${activeResource.title}`}
          description="إضافة سريعة لبيانات التهيئة"
          className="sm:w-[500px]"
        >
          <ResourceForm
            editingRecord={null}
            errorMessage={null}
            isSaving={saveMutation.isPending}
            onCancel={() => setActiveResourceKey(null)}
            onSubmit={(payload) => saveMutation.mutate(payload)}
            resource={activeResource}
          />
        </SlideOver>
      )}
    </div>
  )
}
