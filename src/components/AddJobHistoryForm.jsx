import { useState, useEffect } from 'react';
import { getAllJobs } from '../services/jobService';
import { getAllDepartments } from '../services/departmentService';
import { createJobHistory } from '../services/jobHistoryService';
import { useAuth } from '../hooks/useAuth';

export default function AddJobHistoryForm({ isOpen, onClose, empno, onSuccess }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    jobCode: '',
    deptCode: '',
    effDate: new Date().toISOString().split('T')[0],
    endDate: '',
    salary: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchJobsAndDepts();
    }
  }, [isOpen]);

  const fetchJobsAndDepts = async () => {
    try {
      const [jobsData, deptsData] = await Promise.all([
        getAllJobs('ADMIN'),
        getAllDepartments('ADMIN')
      ]);
      setJobs(jobsData || []);
      setDepartments(deptsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.jobCode || !formData.deptCode || !formData.effDate) {
      setError('Job, Department, and Effective Date are required.');
      return;
    }

    setLoading(true);
    try {
      await createJobHistory({
        empNo: empno,
        jobCode: formData.jobCode,
        deptCode: formData.deptCode,
        effDate: formData.effDate,
        endDate: formData.endDate || null,
        salary: formData.salary ? parseFloat(formData.salary) : null
      }, user?.email);
      
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add job history');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        jobCode: '',
        deptCode: '',
        effDate: new Date().toISOString().split('T')[0],
        endDate: '',
        salary: ''
      });
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-slate-800">Add Job History</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 min-w-[44px] min-h-[44px] text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Job <span className="text-red-500">*</span>
            </label>
            <select
              name="jobCode"
              value={formData.jobCode}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
              required
              disabled={loading}
            >
              <option value="">Select a job...</option>
              {jobs.map(job => (
                <option key={job.jobCode} value={job.jobCode}>
                  {job.jobCode} - {job.jobDesc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              name="deptCode"
              value={formData.deptCode}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
              required
              disabled={loading}
            >
              <option value="">Select a department...</option>
              {departments.map(dept => (
                <option key={dept.deptCode} value={dept.deptCode}>
                  {dept.deptCode} - {dept.deptName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Effective Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="effDate"
              value={formData.effDate}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
              disabled={loading}
            />
            <p className="text-xs text-slate-400 mt-1">Leave empty if currently in this role</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Salary
            </label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g. 50000"
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg border border-red-200">{error}</p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 rounded-lg disabled:opacity-60 flex items-center gap-2 transition"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Job History'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}