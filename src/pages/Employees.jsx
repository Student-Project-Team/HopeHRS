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

export default function Employees() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canAddEmployee, canEditEmployee, canDeleteEmployee } = useRights();

  const [employees, setEmployees] = useState([]);
  const [currentJobs, setCurrentJobs] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');

  const [showAddModal, setShowAddModal] = useState(false);
  const [editEmployee, setEditEmployee] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
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

  // EMP_DEL
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
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-slate-600 rounded-full animate-spin" />
        <p className="text-[11px] font-medium text-slate-400 tracking-widest uppercase">Loading</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="m-4 p-3.5 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2.5">
      <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm text-red-600">Error: {error}</p>
    </div>
  );

  const filters = [
    { key: 'ACTIVE', label: 'Active Only' },
    { key: 'INACTIVE', label: 'Inactive Only' },
    { key: 'ALL', label: 'All Employees' },
  ];

  return (
    <div className="p-4 md:p-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Employees</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {filteredEmployees.length}{' '}
            {filteredEmployees.length === 1 ? 'employee' : 'employees'} shown
          </p>
        </div>
        {canAddEmployee() && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </button>
        )}
      </div>

      {/* ── Filter Tabs ── */}
      {isAdminPlus && (
        <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-lg w-fit">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                statusFilter === key
                  ? 'bg-white text-blue-900 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-blue-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full">
        {filteredEmployees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">No employees found</p>
            {isAdminPlus && statusFilter !== 'ALL' && (
              <p className="text-xs mt-1 text-slate-400">Try changing the filter</p>
            )}
          </div>
        ) : (
          <table className="w-full table-fixed">
            <colgroup>
              <col style={{ width: '8%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '5%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '9%' }} />
              {isAdminPlus && <col style={{ width: '13%' }} />}
              <col style={{ width: isAdminPlus ? '10%' : '23%' }} />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {[
                  'Emp No', 'Last Name', 'First Name', 'Gen',
                  'Hire Date', 'Sep Date', 'Current Job', 'Status',
                  ...(isAdminPlus ? ['Stamp'] : []),
                  'Actions'
                ].map((col) => (
                  <th
                    key={col}
                    className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.map((emp) => (
                <tr
                  key={emp.empno}
                  className={`transition-colors duration-100 ${
                    emp.record_status === 'INACTIVE'
                      ? 'bg-slate-50/70 opacity-60'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  {/* Emp No */}
                  <td className="px-3 py-3">
                    <span className="text-[11px] font-bold font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {emp.empno}
                    </span>
                  </td>

                  {/* Last Name */}
                  <td className="px-3 py-3 text-xs font-semibold text-slate-700 truncate">
                    {emp.lastname}
                  </td>

                  {/* First Name */}
                  <td className="px-3 py-3 text-xs text-slate-600 truncate">
                    {emp.firstname}
                  </td>

                  {/* Gender */}
                  <td className="px-3 py-3 text-xs text-slate-500">
                    {emp.gender}
                  </td>

                  {/* Hire Date */}
                  <td className="px-3 py-3 text-xs text-slate-600 tabular-nums">
                    {emp.hiredate}
                  </td>

                  {/* Sep Date */}
                  <td className="px-3 py-3 text-xs text-slate-400 tabular-nums">
                    {emp.sep_date || '—'}
                  </td>

                  {/* Current Job */}
                  <td className="px-3 py-3 text-xs text-slate-600 truncate">
                    {currentJobs[emp.empno]?.jobDesc || currentJobs[emp.empno]?.jobcode || '—'}
                  </td>

                  {/* Status */}
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                      emp.record_status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}>
                      {emp.record_status === 'ACTIVE' && (
                        <span className="w-1 h-1 rounded-full bg-green-500 shrink-0" />
                      )}
                      {emp.record_status}
                    </span>
                  </td>

                  {/* Stamp */}
                  {isAdminPlus && (
                    <td className="px-3 py-3 text-[10px] text-slate-400 truncate" title={emp.stamp}>
                      {emp.stamp || '—'}
                    </td>
                  )}

                  {/* Actions */}
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigate(`/employees/${emp.empno}`)}
                        className="text-[11px] font-semibold text-blue-900 hover:text-blue-950 transition-colors"
                      >
                        History
                      </button>

                      {canEditEmployee() && emp.record_status === 'ACTIVE' && (
                        <button
                          onClick={() => setEditEmployee(emp)}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          Edit
                        </button>
                      )}

                      {canDeleteEmployee() && isSuperAdmin && emp.record_status === 'ACTIVE' && (
                        <button
                          onClick={() => setDeleteTarget(emp)}
                          className="text-[11px] font-semibold text-red-400 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      )}

                      {isAdminPlus && emp.record_status === 'INACTIVE' && (
                        <button
                          onClick={() => handleRecover(emp.empno)}
                          disabled={actionLoading === emp.empno}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-40"
                        >
                          {actionLoading === emp.empno ? '...' : 'Recover'}
                        </button>
                      )}
                    </div>
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