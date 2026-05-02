import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UserRightsProvider } from './context/UserRightsContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';  // ← Only once
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

// REMOVE THIS LINE - JobHistory is no longer needed
// const JobHistory = () => <div className="p-6">Job History Page</div>;
import DeletedItems from './pages/DeletedItems'; // ← real component


// Placeholder pages (to be replaced in future PRs)

// Placeholder pages
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import JobListPage from './pages/JobListPage';
import DeptListPage from './pages/DeptListPage';

const JobHistory = () => <div className="p-6">Job History Page</div>;
const Admin = () => <div className="p-6">Admin Page</div>;

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
      <UserRightsProvider>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/callback" element={<AuthCallback />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/employees" element={<EmployeeListPage />} />
              <Route path="/employees/:empno" element={<EmployeeDetailPage />} />
              {/* REMOVE THIS LINE - /jobhistory route */}
              {/* <Route path="/jobhistory" element={<JobHistory />} /> */}
              <Route path="/jobs" element={<JobListPage />} />
              <Route path="/departments" element={<DeptListPage />} />
              <Route path="/" element={<Navigate to="/employees" replace />} />
              <Route path="/employees" element={<EmployeeListPage />} />
              <Route path="/employees/new" element={<EmployeeDetailPage />} />
              <Route path="/employees/:empno" element={<EmployeeDetailPage />} />
              <Route path="/employees/:empno/edit" element={<EmployeeDetailPage />} />
              <Route path="/jobhistory" element={<JobHistory />} />
              <Route path="/jobs" element={<JobListPage />} />
              <Route path="/departments" element={<DeptListPage />} />
              <Route path="/admin" element={<Admin />} />
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
      </UserRightsProvider>
    </AuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;