import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getEmployeeById } from '../services/employeeService';
import { getJobHistoryByEmployee } from '../services/jobHistoryService';
import JobHistoryPanel from '../components/JobHistoryPanel';
import AddJobHistoryForm from '../components/AddJobHistoryForm';

export default function EmployeeDetailPage() {
  const { empno } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [jobHistory, setJobHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState(null);

  const userType = user?.user_type || 'USER';
  const canAddJobHistory = userType === 'ADMIN' || userType === 'SUPERADMIN';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

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
