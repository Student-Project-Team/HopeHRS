import { useState, useEffect } from 'react';
import { getAllJobs } from '../services/jobService';
import { getAllDepartments } from '../services/departmentService';
import { updateJobHistory } from '../services/jobHistoryService';
import { useAuth } from '../hooks/useAuth';

/**
 * EditJobHistoryModal
 * Props:
 *   isOpen    — boolean
 *   item      — the job history row being edited (full object from JobHistoryPanel)
 *   onClose   — () => void
 *   onSuccess — () => void  (triggers a refresh in the parent)
 */
export default function EditJobHistoryModal({ isOpen, item, onClose, onSuccess }) {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [formData, setFormData] = useState({
    jobCode: '',
    deptCode: '',
    effDate: '',
    salary: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate dropdowns when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchJobsAndDepts();
    }
  }, [isOpen]);

  // Pre-fill form when the item changes
  useEffect(() => {
    if (item) {
      setFormData({
        jobCode: item.jobcode || '',
        deptCode: item.deptcode || '',
        effDate: item.effdate || item.effDate || '',
        salary: item.salary != null ? String(item.salary) : '',
      });
      setError('');
    }
  }, [item]);

  const fetchJobsAndDepts = async () => {
    try {
      const [jobsData, deptsData] = await Promise.all([
        getAllJobs('ADMIN'),
        getAllDepartments('ADMIN'),
      ]);
      setJobs(jobsData || []);
      setDepartments(deptsData || []);
    } catch (err) {
      console.error('Error fetching jobs/depts:', err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
      await updateJobHistory(
        item.empno,
        item.jobcode,
        item.effdate,
        {
          jobCode: formData.jobCode,
          deptCode: formData.deptCode,
          effDate: formData.effDate,
          salary: formData.salary ? parseFloat(formData.salary) : null,
        },
        user?.email
      );
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.message || 'Failed to update job history');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError('');
      onClose();
    }
  };

  if (!isOpen || !item) return null;

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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Edit Job History</h2>
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

        {/* Form */}
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
              {jobs.map((job) => (
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
              {departments.map((dept) => (
                <option key={dept.deptCode} value={dept.deptCode}>
                  {dept.deptCode} - {dept.deptName}
                </option>
              ))}
            </select>
          </div>

          {/* Effective Date */}
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
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}