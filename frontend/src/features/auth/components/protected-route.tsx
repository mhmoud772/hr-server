import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'

import { useAuthStore } from '@/features/auth/auth-store'
import { fetchSystemStatus } from '@/features/core/api'

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  const { data: status, isLoading } = useQuery({
    queryKey: ['system-status'],
    queryFn: fetchSystemStatus,
    enabled: isAuthenticated,
  })

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location.pathname }} to="/login" />
  }

  if (isLoading || !status) {
    return null
  }

  if (status.setup_completed && location.pathname === '/onboarding/setup') {
    return <Navigate replace to="/" />
  }

  if (!status.setup_completed && location.pathname !== '/onboarding/setup') {
    return <Navigate replace to="/onboarding/setup" />
  }

  return <Outlet />
}
