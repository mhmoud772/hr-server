import { Link } from 'react-router-dom'
import { ArrowLeft, Settings } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  resourceGroupMeta,
  resourceGroups,
  resources,
} from '@/features/resources/resource-config'

export function SystemSettingsPage() {
  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-outline-variant bg-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-primary p-3 text-primary-foreground shadow-sm">
            <Settings className="h-6 w-6" />
          </span>
          <div>
            <p className="text-label-md text-on-surface-variant">البيانات الأساسية</p>
            <h2 className="mt-1 text-2xl font-bold tracking-normal text-on-surface">
              الإعدادات والنظام
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
              إدارة الهيكل الإداري، الفترات، أجهزة البصمة، الصلاحيات، وجميع بيانات النظام الأساسية.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-10 xl:grid-cols-2">
        {Object.entries(resourceGroups).map(([groupKey, groupTitle]) => {
          const typedGroupKey = groupKey as keyof typeof resourceGroups
          const groupMeta = resourceGroupMeta[typedGroupKey]
          const GroupIcon = groupMeta.icon
          const groupResources = resources.filter((r) => r.group === typedGroupKey)

          return (
            <section key={groupKey} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-outline-variant pb-2">
                <GroupIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-on-surface">{groupTitle}</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {groupResources.map((resource) => (
                  <Card className="group flex flex-col justify-between" key={resource.key}>
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span className="rounded-md bg-primary-fixed p-1.5 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <resource.icon className="h-4 w-4" />
                        </span>
                        {resource.title}
                      </CardTitle>
                      <CardDescription className="text-xs">{resource.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button asChild className="w-full justify-between" variant="outline" size="sm">
                        <Link to={resource.path}>
                          إدارة البيانات
                          <ArrowLeft className="h-3 w-3" />
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
