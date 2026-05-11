import { apiClient } from '@/lib/api-client'

export type ResourceRecord = Record<string, unknown> & {
  id?: number | string
}

type PaginatedResponse = {
  results: ResourceRecord[]
  count?: number
}

type ResourceQueryParams = {
  page?: number
  pageSize?: number
  search?: string
  [key: string]: string | number | boolean | undefined
}

export async function getResourceRecords(
  endpoint: string,
  params?: ResourceQueryParams,
) {
  const queryParams = params
    ? {
        ...params,
        page_size: params.pageSize,
        pageSize: undefined,
        search: params.search || undefined,
      }
    : undefined

  const { data } = await apiClient.get<ResourceRecord[] | PaginatedResponse>(
    endpoint,
    { params: queryParams },
  )

  if (Array.isArray(data)) {
    return {
      records: data,
      count: data.length,
    }
  }

  return {
    records: data.results,
    count: data.count ?? data.results.length,
  }
}

export async function createResourceRecord(
  endpoint: string,
  payload: Record<string, unknown>,
) {
  const { data } = await apiClient.post<ResourceRecord>(endpoint, payload)
  return data
}

export async function updateResourceRecord(
  endpoint: string,
  id: string | number,
  payload: Record<string, unknown>,
) {
  const { data } = await apiClient.patch<ResourceRecord>(
    `${endpoint}${id}/`,
    payload,
  )
  return data
}

export async function deleteResourceRecord(
  endpoint: string,
  id: string | number,
) {
  await apiClient.delete(`${endpoint}${id}/`)
}
