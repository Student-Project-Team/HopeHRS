import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';
import {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  softDeleteEmployee,
  recoverEmployee,
} from '../services/employeeService';
import { getCurrentJobForEmployee } from '../services/jobHistoryService';
import AddEmployeeModal from '../components/AddEmployeeModal';
import EditEmployeeModal from '../components/EditEmployeeModal';
import SoftDeleteConfirmDialog from '../components/SoftDeleteConfirmDialog';
import { useAuth } from '../hooks/useAuth';
import { getAllEmployees } from '../services/employeeService';

export default function EmployeeListPage() {
  const { user } = useAuth();
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAllEmployees } from '../services/employeeService';

export default function EmployeeListPage() {
  const { user } = useAuth();
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';
import { getAllEmployees } from '../services/employeeService';

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canAddEmployee, canEditEmployee, canDeleteEmployee, isAdminOrSuperAdmin } = useRights();
  const { canAddEmployee, canEditEmployee, canDeleteEmployee } = useRights();

  const [employees, setEmployees] = useState([]);
  const [currentJobs, setCurrentJobs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);       // triggers EditEmployeeModal
  const [deleteTarget, setDeleteTarget] = useState(null);       // triggers SoftDeleteConfirmDialog
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const userType = user?.user_type || 'USER';
  const isAdminPlus = userType === 'ADMIN' || userType === 'SUPERADMIN';
  const isSuperAdmin = userType === 'SUPERADMIN';

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getAllEmployees(userType);
      setEmployees(data || []);

      if (data?.length) {
        const jobsMap = {};
        await Promise.all(
          data.map(async (emp) => {
            const currentJob = await getCurrentJobForEmployee(emp.empno);
            if (currentJob) jobsMap[emp.empno] = currentJob;
          })
        );
        setCurrentJobs(jobsMap);
      }
      setError(null);
    } catch (err) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userType = user?.user_type || 'USER';

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        console.log('Fetching employees for userType:', userType);
        
        const data = await getAllEmployees(userType);
        console.log('Employees data:', data);
        
        setEmployees(data || []);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [userType]);

  // Wrap fetchEmployees in useCallback
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await getAllEmployees(userType);
      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [userType]);

  const filteredEmployees = employees.filter((emp) => {
    if (statusFilter === 'ALL') return true;
    return emp.record_status === statusFilter;
  });

  // EMP_ADD
  const handleAdd = async (data) => {
    await createEmployee(data);
    setShowAddModal(false);
    await fetchEmployees();
  };

  // EMP_EDIT
  const handleEdit = async (data) => {
    await updateEmployee(editEmployee.empno, data);
    setEditEmployee(null);
    await fetchEmployees();
  };

  // EMP_DEL — DELETE/DEACTIVATE employee
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await softDeleteEmployee(deleteTarget.empno, user?.email);
      setDeleteTarget(null);
      await fetchEmployees();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to deactivate employee: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Recover employee
  const handleRecover = async (empno) => {
    if (!window.confirm('Recover this employee?')) return;
    setActionLoading(empno);
    try {
      await recoverEmployee(empno, user?.email);
      await fetchEmployees();
    } catch (err) {
      console.error('Recover error:', err);
      alert('Failed to recover employee: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="p-4 md:p-6 flex items-center justify-center gap-2 text-slate-500">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600" />
      Loading employees...
    </div>
  );

  if (error) return (
    <div className="p-4 md:p-6 text-red-600 bg-red-50 rounded-lg border border-red-200">
      Error: {error}
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Employees</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {filteredEmployees.length}{' '}
            {filteredEmployees.length === 1 ? 'employee' : 'employees'} shown
          </p>
        </div>
        {canAddEmployee() && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap"
          >
            Add Employee
  }, [userType]); // Add userType as dependency

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]); // Now fetchEmployees is stable

  // Rest of your component remains the same...
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2">Loading employees...</p>
        <p className="ml-2 text-gray-600">Loading employees...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error: {error}
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
        No employees found. Total in DB: 33 but none returned?
      </div>
    );
  }
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data = await getAllEmployees();
        setEmployees(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading employees...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
        {(userType === 'ADMIN' || userType === 'SUPERADMIN') && (
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
            onClick={() => alert('Add Employee Modal - Coming in PR-02')}
          >
            + Add Employee
          </button>
        )}
      </div>

      {/* Status Filter — ADMIN+ only */}
      {isAdminPlus && (
        <div className="flex flex-wrap gap-2 mb-4">
          {['ACTIVE', 'INACTIVE', 'ALL'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                statusFilter === f
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'ALL' ? 'All Employees' : f === 'ACTIVE' ? 'Active Only' : 'Inactive Only'}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        {filteredEmployees.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="font-medium">No employees found</p>
            {isAdminPlus && statusFilter !== 'ALL' && (
              <p className="text-sm mt-1">Try changing the status filter</p>
            )}
          </div>
        ) : (
          <table className="min-w-[1100px] md:min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Emp No</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Name</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">First Name</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Gender</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Hire Date</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Sep Date</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Current Job</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                {isAdminPlus && (
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Stamp</th>
                )}
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.empno}
                  className={`hover:bg-slate-50 transition ${
                    emp.record_status === 'INACTIVE' ? 'opacity-60 bg-slate-50' : ''
                  }`}
                >
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm font-medium text-slate-700">{emp.empno}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-slate-600">{emp.lastname}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-slate-600">{emp.firstname}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-slate-600">{emp.gender}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-slate-600">{emp.hiredate}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-slate-500">{emp.sepdate || '-'}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-slate-600">
                    {currentJobs[emp.empno]?.jobDesc || currentJobs[emp.empno]?.jobcode || '-'}
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-md ${
                      emp.record_status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emp No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hire Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sep Date</th>
              {(userType === 'ADMIN' || userType === 'SUPERADMIN') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stamp</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((emp) => (
              <tr 
                key={emp.empno} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => window.location.href = `/employees/${emp.empno}`}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{emp.empno}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.lastname}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.firstname}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.gender}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.hiredate}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{emp.sepDate || '-'}</td>
                {(userType === 'ADMIN' || userType === 'SUPERADMIN') && (
                  <td className="px-6 py-4 text-sm text-gray-400">{emp.stamp || '-'}</td>
                )}
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    emp.record_status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emp No</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hire Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sep Date</th>
              {(userType === 'ADMIN' || userType === 'SUPERADMIN') && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stamp</th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No employees found</td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.empno} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{emp.empno}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.lastname}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.firstname}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.hiredate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{emp.sepDate || '-'}</td>
                  {(userType === 'ADMIN' || userType === 'SUPERADMIN') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{emp.stamp || '-'}</td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      emp.record_status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {emp.record_status}
                    </span>
                  </td>
                  {isAdminPlus && (
                    <td
                      className="px-4 md:px-6 py-3 md:py-4 text-xs text-slate-500 truncate max-w-[200px]"
                      title={emp.stamp}
                    >
                      {emp.stamp || '-'}
                    </td>
                  )}
                  <td className="px-4 md:px-6 py-3 md:py-4 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/employees/${emp.empno}`)}
                      className="text-slate-600 hover:text-slate-800 mr-3 text-sm font-medium transition"
                    >
                      History
                    </button>

                    {canEditEmployee() && emp.record_status === 'ACTIVE' && (
                      <button
                        onClick={() => setEditEmployee(emp)}
                        className="text-slate-600 hover:text-slate-800 mr-3 text-sm font-medium transition"
                      >
                        Edit
                      </button>
                    )}

                    {/* DELETE BUTTON - ONLY SUPERADMIN CAN SEE THIS */}
                    {/* DELETE button - SUPERADMIN only, ACTIVE employees only */}
                    {canDeleteEmployee() && isSuperAdmin && emp.record_status === 'ACTIVE' && (
                      <button
                        onClick={() => setDeleteTarget(emp)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    )}

                    {/* RECOVER button - ADMIN+ only, INACTIVE employees only */}
                    {isAdminPlus && emp.record_status === 'INACTIVE' && (
                      <button
                        onClick={() => handleRecover(emp.empno)}
                        disabled={actionLoading === emp.empno}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition disabled:opacity-50"
                      >
                        {actionLoading === emp.empno ? '...' : 'Recover'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* EMP_ADD gated */}
      <AddEmployeeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAdd}
      />

      {/* EMP_EDIT gated */}
      <EditEmployeeModal
        isOpen={!!editEmployee}
        onClose={() => setEditEmployee(null)}
        onSave={handleEdit}
        employee={editEmployee}
      />

      {/* EMP_DEL gated - FIXED: Pass employee as item with type 'employee' */}
      <SoftDeleteConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        employee={deleteTarget}
        item={deleteTarget}
        itemType="employee"
        loading={deleteLoading}
      />
    </div>
  );
}
                </tr>
              ))
            )}
        <h1 className="text-2xl font-bold">Employees</h1>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Emp No</th>
              <th className="px-6 py-3 text-left">Last Name</th>
              <th className="px-6 py-3 text-left">First Name</th>
              <th className="px-6 py-3 text-left">Gender</th>
              <th className="px-6 py-3 text-left">Hire Date</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr 
                key={emp.empno} 
                className="border-t cursor-pointer hover:bg-gray-50" 
                onClick={() => navigate(`/employees/${emp.empno}`)}
              >
                <td className="px-6 py-4">{emp.empno}</td>
                <td className="px-6 py-4">{emp.lastname}</td>
                <td className="px-6 py-4">{emp.firstname}</td>
                <td className="px-6 py-4">{emp.gender}</td>
                <td className="px-6 py-4">{emp.hiredate}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${emp.record_status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {emp.record_status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
}
