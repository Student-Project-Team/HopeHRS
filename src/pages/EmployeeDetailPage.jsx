import { useEffect, useState } from 'react';
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
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const userType = user?.user_type || 'USER';
  const isAdminPlus = userType === 'ADMIN' || userType === 'SUPERADMIN';

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  // Fetch employee profile
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const empData = await getEmployeeById(empno);
        setEmployee(empData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (empno) fetchData();
  }, [empno]);

  // Fetch job history
  useEffect(() => {
    const fetchJobHistory = async () => {
      if (!canViewJobHistory()) return;

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
    };

    if (empno && canViewJobHistory()) fetchJobHistory();
  }, [empno, userType, canViewJobHistory, refreshKey]);

  // Soft-delete a job history record (JH_DEL)
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
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600" />
      Loading employee details...
    </div>
  );

  if (error || !employee) return (
    <div className="p-4 md:p-6 text-red-600 bg-red-50 rounded-lg border border-red-200">
      Error: {error || 'Employee not found'}
    </div>
  );

  return (
    <div className="p-4 md:p-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/employees')}
        className="mb-4 text-slate-600 hover:text-slate-800 flex items-center gap-1 text-sm transition"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Employees
      </button>

      {/* Employee Profile Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h1 className="text-2xl font-semibold text-slate-800 mb-4">
          {employee.firstname} {employee.lastname}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm">
              <strong className="text-slate-600">Emp No:</strong>{' '}
              <span className="text-slate-800">{employee.empno}</span>
            </p>
            <p className="text-sm">
              <strong className="text-slate-600">Gender:</strong>{' '}
              <span className="text-slate-800">{employee.gender}</span>
            </p>
            <p className="text-sm">
              <strong className="text-slate-600">Birth Date:</strong>{' '}
              <span className="text-slate-800">{employee.birthdate}</span>
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-sm">
              <strong className="text-slate-600">Hire Date:</strong>{' '}
              <span className="text-slate-800">{employee.hiredate}</span>
            </p>
            <p className="text-sm">
              <strong className="text-slate-600">Separation Date:</strong>{' '}
              <span className="text-slate-800">{employee.sepdate || '-'}</span>
            </p>
            <p className="text-sm">
              <strong className="text-slate-600">Status:</strong>
              <span
                className={`ml-2 px-2 py-1 text-xs rounded-md ${
                  employee.record_status === 'ACTIVE'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}
              >
                {employee.record_status}
              </span>
            </p>
          </div>
        </div>

        {/* Stamp - visible only for ADMIN/SUPERADMIN */}
        {isAdminPlus && employee.stamp && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              <strong>Stamp:</strong> {employee.stamp}
            </p>
          </div>
        )}
      </div>

      {/* Job History Section */}
      {canViewJobHistory() && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Job History</h2>
            {canAddJobHistory() && employee.record_status === 'ACTIVE' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-slate-700 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition"
              >
                Add Job History
              </button>
            )}
          </div>

          {jobHistoryLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600" />
              <span className="ml-2 text-slate-500">Loading job history...</span>
            </div>
          ) : (
            <JobHistoryPanel
              history={jobHistory}
              onRefresh={triggerRefresh}
              onEdit={(item) => setEditItem(item)}
              onDelete={handleDeleteJobHistory}
              onRecover={handleRecoverJobHistory}
            />
          )}
        </div>
      )}

      {/* Add Job History Modal */}
      <AddJobHistoryForm
        isOpen={showAddForm}
        onClose={() => setShowAddModal(false)}
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