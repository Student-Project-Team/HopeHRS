import { useState, useEffect } from 'react';
import { getEmployeeFullHistory, getActiveEmployees } from '../services/reportService';

export default function EmployeeHistoryReportPage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [jobHistory, setJobHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    setError(null);
    try {
      const data = await getActiveEmployees();
      setEmployees(data || []);
    } catch (err) {
      console.error('Error fetching employees:', err);
      setError(err.message);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const fetchEmployeeHistory = async (empno) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEmployeeFullHistory(empno);
      setJobHistory(data || []);
    } catch (err) {
      console.error('Error fetching employee history:', err);
      setError(err.message);
      setJobHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSelect = async (empno) => {
    const employee = employees.find(emp => emp.empno === empno);
    setSelectedEmployee(employee);
    if (empno) {
      await fetchEmployeeHistory(empno);
    } else {
      setJobHistory([]);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loadingEmployees) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-900 rounded-full animate-spin" />
          <p className="text-[11px] font-medium text-slate-400 tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (error && !selectedEmployee && employees.length === 0) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 border border-red-100 rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-red-600 mb-2">Failed to load employees</p>
          <p className="text-xs text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchEmployees}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Employee History Report</h1>
        <p className="mt-0.5 text-xs text-slate-400">
          Complete job history timeline for any employee
        </p>
      </div>

      {/* Employee Selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Select Employee
        </label>
        <select
          className="w-full md:w-80 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-900 focus:border-blue-900 bg-white text-slate-700"
          value={selectedEmployee?.empno || ''}
          onChange={(e) => handleEmployeeSelect(e.target.value)}
        >
          <option value="">-- Select an employee --</option>
          {employees.map((emp) => (
            <option key={emp.empno} value={emp.empno}>
              {emp.empno} - {emp.lastname}, {emp.firstname}
            </option>
          ))}
        </select>
      </div>

      {/* Employee Details */}
      {selectedEmployee && (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 mb-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Employee Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-[10px] text-slate-400">Employee Number</div>
              <div className="text-sm font-mono font-semibold text-slate-800">{selectedEmployee.empno}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400">Full Name</div>
              <div className="text-sm font-semibold text-slate-800">
                {selectedEmployee.lastname}, {selectedEmployee.firstname}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job History */}
      {selectedEmployee && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job History Timeline</h2>
            <p className="text-[10px] text-slate-400 mt-0.5">Chronological order (oldest first)</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-24">
              <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-900 rounded-full animate-spin" />
                <p className="text-[11px] font-medium text-slate-400 tracking-widest uppercase">Loading</p>
              </div>
            </div>
          ) : error && jobHistory.length === 0 ? (
            <div className="p-8 text-center">
              <div className="bg-red-50 rounded-lg p-6">
                <p className="text-sm text-red-600 mb-3">Failed to load job history</p>
                <button
                  onClick={() => fetchEmployeeHistory(selectedEmployee.empno)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-900 hover:bg-blue-950 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Retry
                </button>
              </div>
            </div>
          ) : jobHistory.length === 0 ? (
            <div className="text-center py-16">
              <div className="flex flex-col items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-slate-500">No job history records found</p>
                <p className="text-xs text-slate-400 mt-1">This employee has no employment history</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-x-auto">
              {jobHistory.map((record, index) => (
                <div key={index} className="p-5 hover:bg-slate-50 transition-colors duration-100">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                          {formatDate(record.effectiveDate)}
                        </span>
                        {record.status === 'INACTIVE' && (
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-bold text-slate-800 mb-1 break-words">{record.jobDesc}</div>
                      <div className="text-xs text-slate-500 break-words">{record.deptName}</div>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="text-sm font-bold text-green-600 whitespace-nowrap">{formatCurrency(record.salary)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Selection State */}
      {!selectedEmployee && !loadingEmployees && employees.length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-700 mb-1">No Employee Selected</h3>
          <p className="text-xs text-slate-500">
            Please select an employee from the dropdown above to view their complete job history.
          </p>
        </div>
      )}
      
      {/* No Employees Available State */}
      {!loadingEmployees && employees.length === 0 && !selectedEmployee && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold text-slate-700 mb-1">No Active Employees</h3>
          <p className="text-xs text-slate-500">
            There are no active employees in the system to report on.
          </p>
        </div>
      )}
    </div>
  );
}