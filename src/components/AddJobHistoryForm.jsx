import { useState, useEffect } from 'react';
import { getAllJobs } from '../services/jobService';
import { getAllDepartments } from '../services/departmentService';
import { createJobHistory } from '../services/jobHistoryService';
import { useAuth } from '../hooks/useAuth';

export default function AddJobHistoryForm({ isOpen, onClose, empno, onSuccess }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    jobCode: '',
    deptCode: '',
    effDate: new Date().toISOString().split('T')[0],
    endDate: '',
    salary: ''
  });

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
      handleClose();
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

  const inputClass =
    'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition bg-white placeholder:text-slate-300';

  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide';

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-100">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Add Job History</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Job */}
          <div>
            <label className={labelClass}>
              Job <span className="text-red-400 normal-case tracking-normal">*</span>
            </label>
            <select
              name="jobCode"
              value={formData.jobCode}
              onChange={handleChange}
              className={inputClass}
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

          {/* Department */}
          <div>
            <label className={labelClass}>
              Department <span className="text-red-400 normal-case tracking-normal">*</span>
            </label>
            <select
              name="deptCode"
              value={formData.deptCode}
              onChange={handleChange}
              className={inputClass}
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

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                Effective Date <span className="text-red-400 normal-case tracking-normal">*</span>
              </label>
              <input
                type="date"
                name="effDate"
                value={formData.effDate}
                onChange={handleChange}
                className={inputClass}
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className={labelClass}>
                End Date{' '}
                <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={inputClass}
                disabled={loading}
              />
            </div>
          </div>

          {/* Salary */}
          <div>
            <label className={labelClass}>
              Salary{' '}
              <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="number"
              name="salary"
              value={formData.salary}
              onChange={handleChange}
              placeholder="e.g. 50000"
              className={inputClass}
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg border border-red-200">{error}</p>
          )}

          {/* Footer */}
          <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-950 rounded-lg disabled:opacity-60 flex items-center gap-2 transition shadow-sm"
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Add Job History
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}