import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';
import { getEmployeeById } from '../services/employeeService';
import { getJobHistoryByEmployee, softDeleteJobHistory, recoverJobHistory } from '../services/jobHistoryService';
import JobHistoryPanel from '../components/JobHistoryPanel';
import AddJobHistoryForm from '../components/AddJobHistoryForm';
import EditJobHistoryModal from '../components/EditJobHistoryModal';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getEmployeeById } from '../services/employeeService';
import { getJobHistoryByEmployee } from '../services/jobHistoryService';
import JobHistoryPanel from '../components/JobHistoryPanel';
import AddJobHistoryForm from '../components/AddJobHistoryForm';
import { getEmployeeById } from '../services/employeeService';

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

  const triggerRefresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Fetch employee profile
  const [employee, setEmployee] = useState(null);
  const [jobHistory, setJobHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState(null);

  const userType = user?.user_type || 'USER';
  const canAddJobHistory = userType === 'ADMIN' || userType === 'SUPERADMIN';

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const empData = await getEmployeeById(empno);
        setEmployee(empData);
        setError(null);
        setError(null);
        
        const empResult = await getEmployeeById(empno);
        const historyResult = await getJobHistoryByEmployee(empno, userType);

        if (empResult.error) {
          throw new Error('Failed to fetch employee');
        }
        if (historyResult.error) {
          throw new Error('Failed to fetch job history');
        }

        setEmployee(empResult.data);
        setJobHistory(historyResult.data || []);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err.message || 'Failed to load employee data');
        const empData = await getEmployeeById(empno);
        setEmployee(empData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (empno) fetchData();
  }, [empno]);

  // Fetch job history
  const canView = canViewJobHistory();
  const canAdd = canAddJobHistory();

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empno, userType, canView]);

  useEffect(() => {
    fetchJobHistory();
  }, [fetchJobHistory, refreshTrigger]);

  // Soft-delete using composite key
  const handleDeleteJobHistory = async (item) => {
    if (!window.confirm('Are you sure you want to deactivate this job history record? This can be reversed.')) return;
    try {
      await softDeleteJobHistory(
        item.empno, 
        item.jobcode, 
        item.effdate, 
        user?.email
      );
      triggerRefresh();
    } catch (err) {
      alert('Failed to delete job history: ' + err.message);
    }
  };

  // Recover using composite key
  const handleRecoverJobHistory = async (item) => {
    if (!window.confirm('Are you sure you want to recover this job history record?')) return;
    try {
      await recoverJobHistory(
        item.empno, 
        item.jobcode, 
        item.effdate, 
        user?.email
      );
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

        {isAdminPlus && employee.stamp && (
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-400">
              <strong>Stamp:</strong> {employee.stamp}
            </p>
          </div>
        )}
      </div>

      {/* Job History Section */}
      {canView && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            <h2 className="text-xl font-semibold text-slate-800">Job History</h2>
            {canAdd && employee.record_status === 'ACTIVE' && (
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
          ) : jobHistory.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-12 text-center text-slate-400 text-sm">
              No job history found
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

      <AddJobHistoryForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        empno={empno}
        onSuccess={() => {
          triggerRefresh();
          setShowAddForm(false);
        }}
      />

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
    if (empno) {
      fetchData();
    }
  }, [empno, userType]);

  const handleJobHistoryAdded = () => {
    setShowAddForm(false);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-2">Loading employee details...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>Error: {error || 'Employee not found'}</p>
        <button 
          onClick={() => navigate('/employees')} 
          className="mt-2 text-blue-600 hover:underline"
        >
          ← Back to Employees
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => navigate('/employees')}
        className="mb-4 text-blue-600 hover:text-blue-800 flex items-center gap-1"
      >
        ← Back to Employees
      </button>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {employee.firstname} {employee.lastname}
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-500">Employee No</label>
            <p className="font-medium">{employee.empno}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Gender</label>
            <p className="font-medium">{employee.gender}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Birth Date</label>
            <p className="font-medium">{employee.birthdate}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Hire Date</label>
            <p className="font-medium">{employee.hiredate}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Separation Date</label>
            <p className="font-medium">{employee.sepDate || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Status</label>
            <span className={`px-2 py-1 text-xs rounded-full ${
              employee.record_status === 'ACTIVE' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {employee.record_status}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Job History</h2>
          {canAddJobHistory && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
            >
              {showAddForm ? 'Cancel' : '+ Add Job History'}
            </button>
          )}
        </div>

        {showAddForm && (
          <AddJobHistoryForm
            empno={empno}
            onSuccess={handleJobHistoryAdded}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        <JobHistoryPanel
          jobHistory={jobHistory}
          userType={userType}
          onRefresh={() => window.location.reload()}
        />
      </div>
    </div>
  );
}
  }, [empno]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error || !employee) return <div className="p-6 text-red-600">Error: {error || 'Employee not found'}</div>;

  return (
    <div>
      <button onClick={() => navigate('/employees')} className="mb-4 text-blue-600 hover:text-blue-800">
        ← Back to Employees
      </button>
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">{employee.firstname} {employee.lastname}</h1>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p><strong>Emp No:</strong> {employee.empno}</p>
            <p><strong>Gender:</strong> {employee.gender}</p>
            <p><strong>Birth Date:</strong> {employee.birthdate}</p>
          </div>
          <div>
            <p><strong>Hire Date:</strong> {employee.hiredate}</p>
            <p><strong>Separation Date:</strong> {employee.sepDate || '-'}</p>
            <p><strong>Status:</strong> 
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${employee.record_status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {employee.record_status}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
