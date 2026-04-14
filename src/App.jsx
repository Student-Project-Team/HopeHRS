import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <></>
    </AuthProvider>
  )
}
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}
