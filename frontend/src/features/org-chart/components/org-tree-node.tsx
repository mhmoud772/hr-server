import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Building2, Users } from 'lucide-react'

type OrgNodeData = {
  name: string
  description: string
  employeeCount: number
  isRoot: boolean
}

export function OrgTreeNode({ data, sourcePosition, targetPosition }: NodeProps & { data: OrgNodeData }) {
  return (
    <div
      className={`relative flex flex-col items-center rounded-2xl border bg-card px-5 py-3 shadow-md transition-shadow hover:shadow-lg min-w-[180px] max-w-[240px] ${
        data.isRoot
          ? 'border-primary/40 ring-2 ring-primary/20 bg-primary/5'
          : 'border-border'
      }`}
    >
      {targetPosition && (
        <Handle
          type="target"
          position={targetPosition}
          className="!h-2 !w-2 !rounded-full !border-2 !border-primary !bg-background"
        />
      )}

      <div
        className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full ${
          data.isRoot
            ? 'bg-primary/15 text-primary'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        <Building2 className="h-5 w-5" />
      </div>

      <p className="text-sm font-bold text-foreground text-center leading-tight">{data.name}</p>

      <p className="mt-1 max-h-8 overflow-hidden text-[11px] text-muted-foreground text-center leading-snug line-clamp-2">
        {data.description || '—'}
      </p>

      <div className="mt-2 flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5">
        <Users className="h-3 w-3 text-muted-foreground" />
        <span className="text-[11px] font-semibold text-muted-foreground">
          {data.employeeCount} {data.employeeCount === 1 ? 'موظف' : 'موظفين'}
        </span>
      </div>

      {sourcePosition && (
        <Handle
          type="source"
          position={sourcePosition}
          className="!h-2 !w-2 !rounded-full !border-2 !border-primary !bg-background"
        />
      )}
    </div>
  )
}
