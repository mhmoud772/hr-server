export type OrgTreeNode = {
  id: number
  name: string
  description: string
  employeeCount: number
  children: OrgTreeNode[]
}
