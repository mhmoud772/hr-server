import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

interface StepperProps {
  steps: { title: string; description?: string }[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-center md:justify-between", className)}>
      {steps.map((step, index) => {
        const isCompleted = currentStep > index
        const isCurrent = currentStep === index

        return (
          <div key={step.title} className="flex flex-1 flex-col relative">
            <div className="flex items-center gap-3">
              {/* Step Circle */}
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                  isCompleted
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                    ? "border-primary text-primary"
                    : "border-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <Check className="h-4 w-4" /> : index + 1}
              </div>

              {/* Step Connector Line (Visible on Desktop) */}
              <div
                className={cn(
                  "hidden h-[2px] w-full flex-1 md:block",
                  index === steps.length - 1 ? "hidden md:hidden" : "",
                  isCompleted ? "bg-primary" : "bg-muted"
                )}
              />
            </div>

            {/* Step Text */}
            <div className="mt-2 md:mt-3">
              <p
                className={cn(
                  "text-sm font-bold",
                  isCurrent || isCompleted ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.title}
              </p>
              {step.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
              )}
            </div>
            
            {/* Step Connector Line (Visible on Mobile) */}
            {index !== steps.length - 1 && (
              <div
                className={cn(
                  "absolute left-4 top-10 h-full w-[2px] -translate-x-1/2 md:hidden",
                  isCompleted ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
