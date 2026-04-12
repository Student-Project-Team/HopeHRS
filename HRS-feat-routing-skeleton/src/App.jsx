import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Employees from './pages/Employees'
import JobHistory from './pages/JobHistory'
import Jobs from './pages/Jobs'
import Departments from './pages/Departments'
import Admin from './pages/Admin'
import DeletedItems from './pages/DeletedItems'
import Login from './pages/Login'
import AuthCallback from './pages/AuthCallback'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Employees />
          </ProtectedRoute>
        } />
        <Route path="/employees" element={
          <ProtectedRoute>
            <Employees />
          </ProtectedRoute>
        } />
        <Route path="/job-history" element={
          <ProtectedRoute>
            <JobHistory />
          </ProtectedRoute>
        } />
        <Route path="/jobs" element={
          <ProtectedRoute>
            <Jobs />
          </ProtectedRoute>
        } />
        <Route path="/departments" element={
          <ProtectedRoute>
            <Departments />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
        <Route path="/deleted-items" element={
          <ProtectedRoute>
            <DeletedItems />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  )
}

export default App