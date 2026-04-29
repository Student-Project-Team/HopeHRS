import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';
import { getAllJobs, createJob, updateJob } from '../services/jobService';
import AddJobModal from '../components/AddJobModal';
import EditJobModal from '../components/EditJobModal';

export default function JobListPage() {
  const { user } = useAuth();
  const { canAddJob, canEditJob } = useRights();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const userType = user?.user_type || 'USER';

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await getAllJobs(userType);
      setJobs(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [userType]);

  const handleAdd = async (jobData) => {
    await createJob(jobData, user?.email);
    setShowAddModal(false);
    await fetchJobs();
  };

  const handleEdit = async (jobData) => {
    await updateJob(editingJob.jobCode, jobData, user?.email);
    setShowEditModal(false);
    setEditingJob(null);
    await fetchJobs();
  };

  if (loading) return (
    <div className="flex items-center justify-center gap-2 text-slate-500 py-8">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600" />
      Loading jobs...
    </div>
  );

  if (error) return (
    <div className="p-4 text-red-600 bg-red-50 rounded-lg border border-red-200">
      Error: {error}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Jobs</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage job positions and descriptions</p>
        </div>
        {canAddJob() && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Add Job
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Job Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Job Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                {canEditJob() && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No jobs found
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.jobCode} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{job.jobCode}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{job.jobDesc}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-md ${
                        job.record_status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {job.record_status}
                      </span>
                    </td>
                    {canEditJob() && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {canEditJob() && job.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => { setEditingJob(job); setShowEditModal(true); }}
                            className="text-slate-600 hover:text-slate-800 text-sm font-medium transition"
                          >
                            Edit
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddJobModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAdd}
      />

      <EditJobModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingJob(null); }}
        onSave={handleEdit}
        job={editingJob}
      />
    </div>
  );
}