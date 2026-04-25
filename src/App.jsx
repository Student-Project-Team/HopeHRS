import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';  // ← Only once
import ProtectedRoute from './components/ProtectedRoute';
import DeletedItemsGuard from './components/guards/DeletedItemsGuard';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import Layout from './components/Layout';

// Placeholder pages
const Employees = () => <div className="p-6">Employees Page</div>;
const JobHistory = () => <div className="p-6">Job History Page</div>;
const Jobs = () => <div className="p-6">Jobs Page</div>;
const Departments = () => <div className="p-6">Departments Page</div>;
const Admin = () => <div className="p-6">Admin Page</div>;
const DeletedItems = () => <div className="p-6">Deleted Items Page (ADMIN/SUPERADMIN only)</div>;

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/callback" element={<AuthCallback />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/employees" replace />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/jobhistory" element={<JobHistory />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/departments" element={<Departments />} />
              <Route path="/admin" element={<Admin />} />
              
              <Route path="/deleted-items" element={
                <DeletedItemsGuard>
                  <DeletedItems />
                </DeletedItemsGuard>
              } />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
