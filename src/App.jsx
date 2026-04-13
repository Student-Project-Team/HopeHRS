import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthCallback from './pages/AuthCallback'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Employees from './pages/Employees'
import JobHistory from './pages/JobHistory'
import Jobs from './pages/Jobs'
import Departments from './pages/Departments'
import Admin from './pages/Admin'
import DeletedItems from './pages/DeletedItems'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected dashboard routes */}
        <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="employees" element={<Employees />} />
          <Route path="job-history" element={<JobHistory />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="departments" element={<Departments />} />
          <Route path="admin" element={<Admin />} />
          <Route path="deleted" element={<DeletedItems />} />
          <Route index element={<Navigate to="employees" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}