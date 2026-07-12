import { useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Position,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useQuery } from '@tanstack/react-query'
import { Network, RefreshCw, AlertCircle, Building2, Users, Layers } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { PageTransition } from '@/components/ui/page-transition'
import { cn } from '@/lib/utils'
import { fetchOrgTree } from '../api'
import type { OrgTreeNode } from '../types'
import { OrgTreeNode as OrgTreeNodeComponent } from '../components/org-tree-node'

const nodeTypes = { orgNode: OrgTreeNodeComponent }

const NODE_W = 200
const NODE_H = 130
const H_GAP = 40
const V_GAP = 80

function countNodes(node: OrgTreeNode): number {
  return 1 + node.children.reduce((sum, child) => sum + countNodes(child), 0)
}

function countEmployees(node: OrgTreeNode): number {
  return node.employeeCount + node.children.reduce((sum, child) => sum + countEmployees(child), 0)
}

function layoutTree(
  node: OrgTreeNode,
  x: number,
  y: number,
  nodes: Node[],
  edges: Edge[],
  parentId?: string,
  isRoot = false,
) {
  const nodeId = String(node.id)
  nodes.push({
    id: nodeId,
    type: 'orgNode',
    position: { x, y },
    data: {
      name: node.name,
      description: node.description,
      employeeCount: node.employeeCount,
      isRoot,
    },
    sourcePosition: Position.Bottom,
    targetPosition: Position.Top,
  })

  if (parentId) {
    edges.push({
      id: `e-${parentId}-${nodeId}`,
      source: parentId,
      target: nodeId,
      type: 'smoothstep',
      animated: false,
      style: { strokeWidth: 2, stroke: 'var(--color-border)' },
    })
  }

  if (node.children.length === 0) return

  const subtreeWidth = node.children.length * (NODE_W + H_GAP) - H_GAP
  let startX = x + (NODE_W - subtreeWidth) / 2

  for (const child of node.children) {
    layoutTree(child, startX, y + NODE_H + V_GAP, nodes, edges, nodeId)
    startX += NODE_W + H_GAP
  }
}

function buildLayout(tree: OrgTreeNode[]) {
  const nodes: Node[] = []
  const edges: Edge[] = []

  if (tree.length === 1) {
    layoutTree(tree[0], 400, 40, nodes, edges, undefined, true)
  } else {
    const totalWidth = tree.length * (NODE_W + H_GAP) - H_GAP
    let startX = -totalWidth / 2 + 400
    for (const root of tree) {
      layoutTree(root, startX, 40, nodes, edges, undefined, true)
      startX += NODE_W + H_GAP
    }
  }

  return { nodes, edges }
}

export function OrgChartPage() {
  const {
    data: treeData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['org-tree'],
    queryFn: fetchOrgTree,
  })

  const initialLayout = useMemo(
    () => (treeData ? buildLayout(treeData) : { nodes: [], edges: [] }),
    [treeData],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialLayout.nodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialLayout.edges)

  useMemo(() => {
    if (treeData) {
      const layout = buildLayout(treeData)
      setNodes(layout.nodes)
      setEdges(layout.edges)
    }
  }, [treeData, setNodes, setEdges])

  const totalDepts = useMemo(() => (treeData ? countNodes(treeData[0] ?? { children: [] }) : 0), [treeData])
  const totalEmployees = useMemo(
    () => (treeData ? treeData.reduce((sum, t) => sum + countEmployees(t), 0) : 0),
    [treeData],
  )

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="mb-2 h-7 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
          <Card className="flex h-[500px] items-center justify-center">
            <div className="text-center">
              <Skeleton className="mx-auto mb-3 h-12 w-12 rounded-full" />
              <Skeleton className="mx-auto h-4 w-40" />
            </div>
          </Card>
        </div>
      </PageTransition>
    )
  }

  if (isError) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الهيكل التنظيمي</h1>
            <p className="mt-1 text-sm text-muted-foreground">عرض شجري تفاعلي للهيكل الإداري</p>
          </div>
          <Card className="flex h-[400px] flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">فشل تحميل البيانات</p>
              <p className="mt-1 text-sm text-muted-foreground">تحقق من اتصالك بالخادم وحاول مرة أخرى</p>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="ml-1.5 h-4 w-4" />
              إعادة المحاولة
            </Button>
          </Card>
        </div>
      </PageTransition>
    )
  }

  if (!treeData || treeData.length === 0) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الهيكل التنظيمي</h1>
            <p className="mt-1 text-sm text-muted-foreground">عرض شجري تفاعلي للهيكل الإداري</p>
          </div>
          <Card className="flex h-[400px] flex-col items-center justify-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Building2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">لا يوجد هيكل تنظيمي</p>
              <p className="mt-1 text-sm text-muted-foreground">أضف الإدارات والوحدات من إعدادات النظام أولاً</p>
            </div>
          </Card>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">الهيكل التنظيمي</h1>
            <p className="mt-1 text-sm text-muted-foreground">عرض شجري تفاعلي للهيكل الإداري — اسحب وكبّر وصغّر</p>
          </div>

          <div className="flex gap-3">
            <Card className="flex items-center gap-2.5 px-4 py-2.5">
              <Layers className="h-4 w-4 text-primary" />
              <div>
                <p className="text-[11px] text-muted-foreground">الأقسام</p>
                <p className="text-sm font-bold text-foreground">{totalDepts}</p>
              </div>
            </Card>
            <Card className="flex items-center gap-2.5 px-4 py-2.5">
              <Users className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="text-[11px] text-muted-foreground">إجمالي الموظفين</p>
                <p className="text-sm font-bold text-foreground">{totalEmployees}</p>
              </div>
            </Card>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              تحديث
            </Button>
          </div>
        </div>

        <Card className="h-[600px] overflow-hidden p-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.1}
            maxZoom={2}
            defaultEdgeOptions={{ type: 'smoothstep' }}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={20} size={1} color="var(--color-border)" />
            <Controls
              showInteractive={false}
              className="!rounded-xl !border-border !bg-card !shadow-md"
            />
            <MiniMap
              nodeColor={() => 'var(--color-muted-foreground)'}
              maskColor="var(--color-background)"
              className="!rounded-xl !border-border !bg-card !shadow-md"
              pannable
              zoomable
            />
          </ReactFlow>
        </Card>
      </div>
    </PageTransition>
  )
}
