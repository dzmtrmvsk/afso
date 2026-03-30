import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { TicketsPage } from '@/pages/tickets/TicketsPage'
import { TicketDetailPage } from '@/pages/tickets/TicketDetailPage'
import { CustomersPage } from '@/pages/customers/CustomersPage'
import { TeamsPage } from '@/pages/teams/TeamsPage'
import { LocationsPage } from '@/pages/locations/LocationsPage'
import { ServiceTypesPage } from '@/pages/service-types/ServiceTypesPage'
import { SlaPage } from '@/pages/sla/SlaPage'
import { AssignmentsPage } from '@/pages/assignments/AssignmentsPage'
import { ProfilePage } from '@/pages/profile/ProfilePage'
import { SuperAdminPage } from './pages/superadmin/SuperAdminPage'
import { MyTasksPage } from './pages/tasks/MyTasksPage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { CreateTicketPage } from './pages/tickets/CreateTicketPage'
import { UsersPage } from './pages/users/UsersPage'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tickets" element={<TicketsPage />} />
            <Route path="/tickets/new" element={<CreateTicketPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/locations" element={<LocationsPage />} />
            <Route path="/service-types" element={<ServiceTypesPage />} />
            <Route path="/sla" element={<SlaPage />} />
            <Route path="/assignments" element={<AssignmentsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/superadmin" element={<SuperAdminPage />} />
            <Route path="/my-tasks" element={<MyTasksPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
