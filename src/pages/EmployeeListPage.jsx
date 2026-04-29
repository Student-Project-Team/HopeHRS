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

export default function EmployeeListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canAddEmployee, canEditEmployee, canDeleteEmployee } = useRights();

  const [employees, setEmployees] = useState([]);
  const [currentJobs, setCurrentJobs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

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

  // EMP_DEL — opens confirm dialog
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await softDeleteEmployee(deleteTarget.empno, user?.email);
      setDeleteTarget(null);
      await fetchEmployees();
    } catch (err) {
      alert('Failed to deactivate employee: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRecover = async (empno) => {
    if (!window.confirm('Recover this employee?')) return;
    setActionLoading(empno);
    try {
      await recoverEmployee(empno, user?.email);
      await fetchEmployees();
    } catch (err) {
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

                    {canDeleteEmployee() && isSuperAdmin && emp.record_status === 'ACTIVE' && (
                      <button
                        onClick={() => setDeleteTarget(emp)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    )}

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

      {/* EMP_DEL gated */}
      <SoftDeleteConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        employee={deleteTarget}
        loading={deleteLoading}
      />
    </div>
  );
}