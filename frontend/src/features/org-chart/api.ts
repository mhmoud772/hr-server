import { apiClient } from '@/lib/api-client'
import type { OrgTreeNode } from './types'

export async function fetchOrgTree(): Promise<OrgTreeNode[]> {
  const { data } = await apiClient.get<OrgTreeNode[]>('/org-tree/')
  return data
}
