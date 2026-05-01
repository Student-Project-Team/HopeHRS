import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { addJobHistoryEntry } from '../services/jobHistoryService';
import { useAuth } from '../hooks/useAuth';

export default function AddJobHistoryForm({ empno, onSuccess, onCancel }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    jobCode: '',
    effDate: '',
    salary: '',
    deptCode: ''
  });
  const [jobs, setJobs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [jobsRes, deptsRes] = await Promise.all([
          supabase.from('job').select('jobCode, jobDesc').eq('record_status', 'ACTIVE'),
          supabase.from('department').select('deptCode, deptName').eq('record_status', 'ACTIVE')
        ]);
        if (jobsRes.data) setJobs(jobsRes.data);
        if (deptsRes.data) setDepartments(deptsRes.data);
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      }
    };

    fetchDropdownData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await addJobHistoryEntry({
        empNo: empno,
        jobCode: formData.jobCode,
        effDate: formData.effDate,
        salary: parseFloat(formData.salary),
        deptCode: formData.deptCode
      }, user?.email);

      if (result.error) throw result.error;
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to add job history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4">
      <h3 className="font-semibold mb-3">Add Job History</h3>
      {error && (
        <div className="bg-red-50 text-red-700 p-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <select
          value={formData.jobCode}
          onChange={(e) => setFormData({ ...formData, jobCode: e.target.value })}
          className="border rounded-lg px-3 py-2"
          required
        >
          <option value="">Select Job</option>
          {jobs.map((job) => (
            <option key={job.jobCode} value={job.jobCode}>
              {job.jobCode} - {job.jobDesc}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={formData.effDate}
          onChange={(e) => setFormData({ ...formData, effDate: e.target.value })}
          className="border rounded-lg px-3 py-2"
          required
        />

        <input
          type="number"
          placeholder="Salary"
          value={formData.salary}
          onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
          className="border rounded-lg px-3 py-2"
          required
        />

        <select
          value={formData.deptCode}
          onChange={(e) => setFormData({ ...formData, deptCode: e.target.value })}
          className="border rounded-lg px-3 py-2"
          required
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.deptCode} value={dept.deptCode}>
              {dept.deptCode} - {dept.deptName}
            </option>
          ))}
        </select>

        <div className="md:col-span-2 flex gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Add Job History'}
          </button>
        </div>
      </form>
    </div>
  );
}
