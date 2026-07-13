import { apiClient } from '@/lib/api-client'

export interface SystemStatus {
  setup_completed: boolean
}

export interface CompleteSetupPayload {
  company_name?: string
  company_email?: string
  currency?: string
}

export async function fetchSystemStatus(): Promise<SystemStatus> {
  const { data } = await apiClient.get<SystemStatus>('/system-status/')
  return data
}

export async function completeSetup(
  payload: CompleteSetupPayload,
): Promise<SystemStatus> {
  const { data } = await apiClient.post<SystemStatus>('/complete-setup/', payload)
  return data
}
