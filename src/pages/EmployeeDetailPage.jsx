import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';
import { getEmployeeById } from '../services/employeeService';
import { 
  getJobHistoryByEmployee, 
  softDeleteJobHistory, 
  recoverJobHistory 
} from '../services/jobHistoryService';
import JobHistoryPanel from '../components/JobHistoryPanel';
import AddJobHistoryForm from '../components/AddJobHistoryForm';
import EditJobHistoryModal from '../components/EditJobHistoryModal';

export default function EmployeeDetailPage() {
  const { empno } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { canViewJobHistory, canAddJobHistory } = useRights();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobHistory, setJobHistory] = useState([]);
  const [jobHistoryLoading, setJobHistoryLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const userType = user?.user_type || 'USER';
  const isAdminPlus = userType === 'ADMIN' || userType === 'SUPERADMIN';
  const canView = canViewJobHistory();
  const canAdd = canAddJobHistory();

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Fetch employee profile
  useEffect(() => {
    const fetchEmployee = async () => {
      if (!empno) return;
      try {
        setLoading(true);
        const data = await getEmployeeById(empno);
        setEmployee(data);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [empno]);

  const fetchJobHistory = useCallback(async () => {
    if (!canView || !empno) return;
    setJobHistoryLoading(true);
    try {
      const data = await getJobHistoryByEmployee(empno, userType);
      setJobHistory(data || []);
    } catch (err) {
      console.error('ERROR fetching job history:', err);
      setJobHistory([]);
    } finally {
      setJobHistoryLoading(false);
    }
  }, [empno, userType, canView]);

  useEffect(() => {
    fetchJobHistory();
  }, [fetchJobHistory, refreshTrigger]);

  const handleDeleteJobHistory = async (item) => {
    if (!window.confirm('Are you sure you want to deactivate this job history record? This can be reversed.')) return;
    try {
      await softDeleteJobHistory(item.empno, item.jobcode, item.effdate, user?.email);
      triggerRefresh();
    } catch (err) {
      alert('Failed to delete job history: ' + err.message);
    }
  };

  // Recover a soft-deleted job history record (ADMIN+)
  const handleRecoverJobHistory = async (item) => {
    if (!window.confirm('Are you sure you want to recover this job history record?')) return;
    try {
      await recoverJobHistory(item.empno, item.jobcode, item.effdate, user?.email);
      triggerRefresh();
    } catch (err) {
      alert('Failed to recover job history: ' + err.message);
    }
  };

  if (loading) return (
    <div className="p-4 md:p-6 flex items-center justify-center gap-2 text-slate-500">
      <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-900 rounded-full animate-spin" />
      <span className="text-sm">Loading employee details...</span>
    </div>
  );

  if (error || !employee) return (
    <div className="p-4 md:p-6 text-red-600 bg-red-50 rounded-xl border border-red-200 text-sm">
      Error: {error || 'Employee not found'}
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/employees')}
        className="mb-5 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Employees
      </button>

      {/* Employee Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        {/* Card Header */}
        <div className="flex items-center gap-3 mb-5 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-blue-900 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-800 tracking-tight">
              {employee.firstname} {employee.lastname}
            </h1>
            <p className="text-xs text-slate-400">{employee.empno}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            {[
              { label: 'Gender', value: employee.gender },
              { label: 'Birth Date', value: employee.birthdate },
              { label: 'Hire Date', value: employee.hiredate },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-xs font-medium text-slate-700">{value || '—'}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {[
              { label: 'Separation Date', value: employee.sepdate || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-xs font-medium text-slate-700">{value}</p>
              </div>
            ))}
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Status</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                employee.record_status === 'ACTIVE'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}>
                {employee.record_status === 'ACTIVE' && (
                  <span className="w-1 h-1 rounded-full bg-green-500 shrink-0" />
                )}
                {employee.record_status}
              </span>
            </div>
          </div>
        </div>

        {/* Stamp - visible only for ADMIN/SUPERADMIN */}
        {isAdminPlus && employee.stamp && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Stamp</p>
            <p className="text-xs text-slate-500">{employee.stamp}</p>
          </div>
        )}
      </div>

      {/* Job History Section */}
      {canView && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Job History</h2>
              <p className="text-xs text-slate-400 mt-0.5">Employment records for this employee</p>
            </div>
            {canAdd && employee.record_status === 'ACTIVE' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-lg text-xs font-semibold transition shadow-sm"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Add Job History
              </button>
            )}
          </div>

          {jobHistoryLoading ? (
            <div className="bg-white rounded-2xl border border-slate-100 px-6 py-10 flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-900 rounded-full animate-spin" />
              <span className="text-xs text-slate-400">Loading job history...</span>
            </div>
          ) : jobHistory.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 px-6 py-12 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">No job history found</p>
            </div>
          ) : (
            <JobHistoryPanel
              history={jobHistory}
              onRefresh={triggerRefresh}
              onEdit={(item) => setEditItem(item)}
              onDelete={handleDeleteJobHistory}
              onRecover={handleRecoverJobHistory}
              isLoading={jobHistoryLoading}
            />
          )}
        </div>
      )}

      {/* Add Job History Modal */}
      <AddJobHistoryForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        empno={empno}
        onSuccess={() => {
          triggerRefresh();
          setShowAddForm(false);
        }}
      />

      {/* Edit Job History Modal */}
      <EditJobHistoryModal
        isOpen={!!editItem}
        item={editItem}
        onClose={() => setEditItem(null)}
        onSuccess={() => {
          triggerRefresh();
          setEditItem(null);
        }}
      />
    </div>
  );
}