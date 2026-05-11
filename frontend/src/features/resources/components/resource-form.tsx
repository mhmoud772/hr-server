import { useMemo } from 'react'
import type React from 'react'
import { useQueries } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { getResourceRecords, type ResourceRecord } from '@/features/resources/api'
import {
  getResourceByKey,
  type ResourceConfig,
  type ResourceField,
} from '@/features/resources/resource-config'
import { cn } from '@/lib/utils'

type ResourceFormProps = {
  editingRecord: ResourceRecord | null
  errorMessage?: string | null
  isSaving: boolean
  onCancel: () => void
  onSubmit: (payload: Record<string, unknown>) => void
  resource: ResourceConfig
}

function optionLabel(record: ResourceRecord) {
  return String(
    record.display ??
      record.name ??
      record.employee_name ??
      record.leave_type_name ??
      record.title ??
      record.id ??
      '-',
  )
}

function normalizeDatetime(value: unknown) {
  if (!value || typeof value !== 'string') {
    return ''
  }

  return value.slice(0, 16)
}

function getInitialValue(field: ResourceField, record: ResourceRecord | null) {
  const value = record?.[field.key]

  if (field.type === 'checkbox') {
    return value === undefined ? false : Boolean(value)
  }

  if (field.type === 'multiselect') {
    return Array.isArray(value) ? value.map(String) : []
  }

  if (field.type === 'datetime-local') {
    return normalizeDatetime(value)
  }

  return value === undefined || value === null ? '' : String(value)
}

function normalizeValue(field: ResourceField, formData: FormData) {
  if (field.type === 'checkbox') {
    return formData.get(field.key) === 'on'
  }

  if (field.type === 'multiselect') {
    return formData.getAll(field.key).map((value) => Number(value))
  }

  const rawValue = formData.get(field.key)

  if (rawValue === null || rawValue === '') {
    return null
  }

  if (field.type === 'select') {
    const matchingOption = field.options?.find(
      (option) => String(option.value) === String(rawValue),
    )

    if (matchingOption && typeof matchingOption.value === 'string') {
      return String(rawValue)
    }

    const maybeNumber = Number(rawValue)
    return Number.isNaN(maybeNumber) ? String(rawValue) : maybeNumber
  }

  if (field.type === 'number' || field.type === 'decimal') {
    const maybeNumber = Number(rawValue)
    return Number.isNaN(maybeNumber) ? String(rawValue) : maybeNumber
  }

  return String(rawValue)
}

function fieldGroupTitle(index: number) {
  if (index === 0) return 'البيانات الأساسية'
  if (index === 1) return 'البيانات المرتبطة'
  return 'تفاصيل إضافية'
}

export function ResourceForm({
  editingRecord,
  errorMessage,
  isSaving,
  onCancel,
  onSubmit,
  resource,
}: ResourceFormProps) {
  const relationKeys = useMemo(
    () =>
      Array.from(
        new Set(
          resource.formFields
            .map((field) => field.relation)
            .filter((relation): relation is string => Boolean(relation)),
        ),
      ),
    [resource.formFields],
  )

  const relationQueries = useQueries({
    queries: relationKeys.map((relationKey) => {
      const relationResource = getResourceByKey(relationKey)!

      return {
        queryKey: ['relation-options', relationKey],
        queryFn: () => getResourceRecords(relationResource.endpoint),
      }
    }),
  })

  const relationOptions = relationKeys.reduce<
    Record<string, Array<{ label: string; value: string | number }>>
  >((acc, relationKey, index) => {
    acc[relationKey] =
      relationQueries[index].data?.records.map((record) => ({
        label: optionLabel(record),
        value: record.id ?? '',
      })) ?? []

    return acc
  }, {})

  const fieldGroups = useMemo(() => {
    const primary = resource.formFields.filter(
      (field) =>
        !field.relation &&
        !['textarea', 'checkbox', 'multiselect'].includes(field.type),
    )
    const relations = resource.formFields.filter(
      (field) => field.relation || field.type === 'multiselect',
    )
    const details = resource.formFields.filter(
      (field) => field.type === 'textarea' || field.type === 'checkbox',
    )

    return [primary, relations, details].filter((fields) => fields.length)
  }, [resource.formFields])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const payload = resource.formFields.reduce<Record<string, unknown>>(
      (acc, field) => {
        const value = normalizeValue(field, formData)

        if (field.type === 'password' && editingRecord && !value) {
          return acc
        }

        acc[field.key] = value
        return acc
      },
      {},
    )

    onSubmit(payload)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {relationQueries.some((query) => query.isLoading) && (
        <div className="rounded-lg border border-outline-variant bg-muted p-3 text-sm text-muted-foreground">
          جاري تحميل خيارات الحقول المرتبطة...
        </div>
      )}

      {fieldGroups.map((fields, groupIndex) => (
        <section
          className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4"
          key={fieldGroupTitle(groupIndex)}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold">{fieldGroupTitle(groupIndex)}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {fields.length} حقول في هذا القسم
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {fields.map((field) => {
              const initialValue = getInitialValue(field, editingRecord)
              const options =
                field.options ?? relationOptions[field.relation ?? ''] ?? []
              const isWide = field.type === 'textarea' || field.type === 'multiselect'

              return (
                <label
                  className={cn(
                    'space-y-2 text-sm font-medium',
                    isWide && 'md:col-span-2',
                  )}
                  key={field.key}
                >
                  <span className="flex items-center gap-1">
                    {field.label}
                    {field.required && (
                      <span className="text-destructive" title="حقل مطلوب">
                        *
                      </span>
                    )}
                  </span>

                  {field.type === 'textarea' && (
                    <Textarea
                      defaultValue={String(initialValue)}
                      name={field.key}
                      placeholder={field.placeholder}
                      required={field.required}
                    />
                  )}

                  {field.type === 'select' && (
                    <Select
                      defaultValue={String(initialValue)}
                      name={field.key}
                      required={field.required}
                    >
                      <option value="">اختر...</option>
                      {options.map((option) => (
                        <option key={String(option.value)} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  )}

                  {field.type === 'multiselect' && (
                    <Select
                      defaultValue={initialValue as string[]}
                      multiple
                      name={field.key}
                      required={field.required}
                      size={Math.min(Math.max(options.length, 3), 6)}
                    >
                      {options.map((option) => (
                        <option key={String(option.value)} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  )}

                  {field.type === 'checkbox' && (
                    <div className="flex h-10 items-center gap-2 rounded-md border border-input bg-background px-3">
                      <input
                        className="h-4 w-4 accent-primary"
                        defaultChecked={Boolean(initialValue)}
                        name={field.key}
                        type="checkbox"
                      />
                      <span className="text-on-surface-variant">نعم</span>
                    </div>
                  )}

                  {!['textarea', 'select', 'multiselect', 'checkbox'].includes(
                    field.type,
                  ) && (
                    <Input
                      defaultValue={String(initialValue)}
                      name={field.key}
                      placeholder={field.placeholder}
                      required={field.required}
                      type={field.type}
                    />
                  )}
                </label>
              )
            })}
          </div>
        </section>
      ))}

      {errorMessage && (
        <div className="rounded-md border border-destructive-container bg-destructive-container/40 p-3 text-sm text-destructive-container-foreground">
          {errorMessage}
        </div>
      )}

      <div className="sticky bottom-0 -mx-5 flex flex-col-reverse gap-2 border-t border-outline-variant bg-card/95 px-5 py-4 backdrop-blur sm:flex-row sm:justify-end">
        <Button disabled={isSaving} onClick={onCancel} type="button" variant="outline">
          إلغاء
        </Button>
        <Button disabled={isSaving} type="submit">
          {editingRecord ? 'حفظ التعديل' : 'إضافة'}
        </Button>
      </div>
    </form>
  )
}
