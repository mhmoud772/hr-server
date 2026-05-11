import { Navigate, Link, useParams } from 'react-router-dom'
import { ArrowLeft, Database } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  getResourcesByGroup,
  resourceGroupMeta,
  resourceGroups,
} from '@/features/resources/resource-config'

export function ResourceGroupPage() {
  const { groupKey } = useParams()

  if (!groupKey || !(groupKey in resourceGroups)) {
    return <Navigate replace to="/" />
  }

  const typedGroupKey = groupKey as keyof typeof resourceGroups
  const groupResources = getResourcesByGroup(groupKey)
  const groupMeta = resourceGroupMeta[typedGroupKey]
  const GroupIcon = groupMeta.icon

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-outline-variant bg-card p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <span className="rounded-xl bg-primary p-3 text-primary-foreground shadow-sm">
              <GroupIcon className="h-6 w-6" />
            </span>
            <div>
              <p className="text-label-md text-on-surface-variant">قسم النظام</p>
              <h2 className="mt-1 text-2xl font-bold tracking-normal text-on-surface">
                {resourceGroups[typedGroupKey]}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
                {groupMeta.description}
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm text-on-surface-variant">
            <span className="font-bold text-on-surface">{groupResources.length}</span>{' '}
            صفحات متاحة
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groupResources.map((resource) => (
          <Card className="group" key={resource.key}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="rounded-md bg-primary-fixed p-2 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <resource.icon className="h-5 w-5" />
                </span>
                {resource.title}
              </CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                <Database className="h-4 w-4 text-primary" />
                متصل بواجهة البيانات
              </div>
              <Button asChild className="w-full justify-between" variant="outline">
                <Link to={resource.path}>
                  فتح البيانات
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  )
}
