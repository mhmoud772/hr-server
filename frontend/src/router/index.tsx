import { Navigate, createBrowserRouter } from 'react-router-dom'

import { DashboardLayout } from '@/layouts/dashboard-layout'
import { ProtectedRoute } from '@/features/auth/components/protected-route'
import { LoginPage } from '@/features/auth/pages/login-page'
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page'
import { ResourceGroupPage } from '@/features/resources/pages/resource-group-page'
import { ResourcePage } from '@/features/resources/pages/resource-page'
import { AttendanceWorkdayPage } from '@/features/workflows/pages/attendance-workday-page'
import { EmployeesWorkspacePage } from '@/features/workflows/pages/employees-workspace-page'
import { FingerprintIntegrationPage } from '@/features/workflows/pages/fingerprint-integration-page'
import { LeaveApprovalsPage } from '@/features/workflows/pages/leave-approvals-page'
import { ReportsPage } from '@/features/workflows/pages/reports-page'
import { SystemSettingsPage } from '@/features/settings/pages/system-settings-page'
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'employees',
            element: <Navigate replace to="/workflows/employees" />,
          },
          {
            path: 'leaves',
            element: <Navigate replace to="/workflows/leave-approvals" />,
          },
          {
            path: 'resources/:resourceKey',
            element: <ResourcePage />,
          },
          {
            path: 'groups/:groupKey',
            element: <ResourceGroupPage />,
          },
          {
            path: 'workflows/employees',
            element: <EmployeesWorkspacePage />,
          },
          {
            path: 'workflows/attendance',
            element: <AttendanceWorkdayPage />,
          },
          {
            path: 'workflows/leave-approvals',
            element: <LeaveApprovalsPage />,
          },
          {
            path: 'workflows/reports',
            element: <ReportsPage />,
          },
          {
            path: 'workflows/fingerprint-integration',
            element: <FingerprintIntegrationPage />,
          },
          {
            path: 'settings',
            element: <SystemSettingsPage />,
          },
          {
            path: '*',
            element: <Navigate replace to="/" />,
          },
        ],
      },
    ],
  },
])
