import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { DepartmentProvider } from './context/DepartmentContext';
import { ToastProvider } from './components/common/Toast';

import ProtectedRoute from './components/auth/ProtectedRoute';
import GuestRoute from './components/auth/GuestRoute';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import MyTasksPage from './pages/tasks/MyTasksPage';
import CreatedByMePage from './pages/tasks/CreatedByMePage';
import TaskDetailPage from './pages/tasks/TaskDetailPage';
import TaskCreatePage from './pages/tasks/TaskCreatePage';
import DepartmentsPage from './pages/departments/DepartmentsPage';
import DepartmentDetailPage from './pages/departments/DepartmentDetailPage';
import CreateDepartmentPage from './pages/departments/CreateDepartmentPage';
import ProfilePage from './pages/profile/ProfilePage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import { NotFoundPage, ForbiddenPage } from './pages/errors/ErrorPages';

const ADMIN_ROLES = ['PRESIDENT', 'VICE_PRESIDENT'];
const CREATOR_ROLES = ['PRESIDENT', 'VICE_PRESIDENT', 'DEPARTMENT_LEAD'];

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DepartmentProvider>
          <TaskProvider>
            <ToastProvider>
              <Routes>
                <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
                <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
                <Route path="/403" element={<ForbiddenPage />} />
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/tasks/my-tasks" element={<ProtectedRoute><MyTasksPage /></ProtectedRoute>} />
                <Route path="/tasks/created-by-me" element={<ProtectedRoute><CreatedByMePage /></ProtectedRoute>} />
                <Route path="/tasks/:taskId" element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>} />
                <Route path="/departments" element={<ProtectedRoute><DepartmentsPage /></ProtectedRoute>} />
                <Route path="/departments/:departmentId" element={<ProtectedRoute><DepartmentDetailPage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

                <Route path="/tasks/create" element={<ProtectedRoute allowedRoles={CREATOR_ROLES}><TaskCreatePage /></ProtectedRoute>} />
                <Route path="/departments/create" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><CreateDepartmentPage /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute allowedRoles={ADMIN_ROLES}><AdminUsersPage /></ProtectedRoute>} />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ToastProvider>
          </TaskProvider>
        </DepartmentProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
