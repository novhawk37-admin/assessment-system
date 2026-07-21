import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomeDashboard from "./pages/HomeDashboard";
import Login from './pages/Login'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'
import Tasks from './pages/Tasks'
import AddTask from './pages/AddTask'
import Assessments from './pages/Assessments'
import AddAssessment from "./pages/AddAssessment";
import AssessmentTest from "./pages/AssessmentTest";
import AssessmentResult from "./pages/AssessmentResult";
import MyAssessments from "./pages/MyAssessments";
import UsersPage from './pages/Users'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<HomeDashboard />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <UserDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assessments"
        element={
          <ProtectedRoute>
            <Assessments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-assessment"
        element={
          <ProtectedRoute requireAdmin>
            <AddAssessment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-assessment/:id"
        element={
          <ProtectedRoute requireAdmin>
            <AddAssessment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assessment-test/:id"
        element={
          <ProtectedRoute>
            <AssessmentTest />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assessment-result/:id"
        element={
          <ProtectedRoute>
            <AssessmentResult />
          </ProtectedRoute>
        }
      />

      <Route
        path="/assessment-answers/:id"
        element={
          <ProtectedRoute>
            <MyAssessments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tasks"
        element={
          <ProtectedRoute requireAdmin>
            <Tasks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tasks/new"
        element={
          <ProtectedRoute requireAdmin>
            <AddTask />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/assessments"
        element={
          <ProtectedRoute requireAdmin>
            <Assessments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireAdmin>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/users/:id/assessments"
        element={
          <ProtectedRoute requireAdmin>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
