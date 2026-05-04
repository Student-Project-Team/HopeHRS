import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserRightsProvider } from './context/UserRightsContext';
import ProtectedRoute from './components/ProtectedRoute';
import DeletedItemsGuard from './components/guards/DeletedItemsGuard';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthCallback from './pages/AuthCallback';
import Layout from './components/Layout';
import EmployeeListPage from './pages/EmployeeListPage';
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import JobListPage from './pages/JobListPage';
import DeptListPage from './pages/DeptListPage';
import AdminPage from './pages/AdminPage';  // ← ADD THIS IMPORT
import DeletedItems from './pages/DeletedItems';

// Placeholder pages (to be replaced in future PRs)
const JobHistory = () => <div className="p-6">Job History Page</div>;
// REMOVE the placeholder Admin - we're using real component now
// const Admin = () => <div className="p-6">Admin Page</div>;

function App() {
  return (
    <AuthProvider>
      <UserRightsProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/callback" element={<AuthCallback />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/employees" replace />} />
              <Route path="/employees" element={<EmployeeListPage />} />
              <Route path="/employees/:empno" element={<EmployeeDetailPage />} />
              <Route path="/jobhistory" element={<JobHistory />} />
              <Route path="/jobs" element={<JobListPage />} />
              <Route path="/departments" element={<DeptListPage />} />
              <Route path="/admin" element={<AdminPage />} />  {/* ← CHANGED to real component */}
              <Route path="/deleted-items" element={
                <DeletedItemsGuard>
                  <DeletedItems />
                </DeletedItemsGuard>
              } />
            </Route>
          </Route>
        </Routes>
      </UserRightsProvider>
    </AuthProvider>
  );
}

export default App;
