import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';
import { getAllJobs, createJob, updateJob, softDeleteJob, recoverJob } from '../services/jobService';
import AddJobModal from '../components/AddJobModal';

export default function JobListPage() {
  const { user } = useAuth();
  const { canAddJob, canEditJob, canDeleteJob } = useRights();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const userType = user?.user_type || 'USER';

  useEffect(() => {
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
    fetchJobs();
  }, [userType]);

  const handleSave = async (jobData) => {
    try {
      if (editingJob) {
        await updateJob(editingJob.jobCode, jobData, user?.email);
      } else {
        await createJob(jobData, user?.email);
      }
      setShowModal(false);
      setEditingJob(null);
      const data = await getAllJobs(userType);
      setJobs(data || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (jobCode) => {
    if (window.confirm('Soft delete this job?')) {
      await softDeleteJob(jobCode, user?.email);
      const data = await getAllJobs(userType);
      setJobs(data || []);
    }
  };

  const handleRecover = async (jobCode) => {
    await recoverJob(jobCode, user?.email);
    const data = await getAllJobs(userType);
    setJobs(data || []);
  };

  if (loading) return <div className="p-6 text-center">Loading jobs...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
        {canAddJob() && (
          <button onClick={() => { setEditingJob(null); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            + Add Job
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Job Code</th>
              <th className="px-6 py-3 text-left">Job Description</th>
              <th className="px-6 py-3 text-left">Status</th>
              {(canEditJob() || canDeleteJob()) && <th className="px-6 py-3 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.jobCode} className="border-t">
                <td className="px-6 py-4">{job.jobCode}</td>
                <td className="px-6 py-4">{job.jobDesc}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${job.record_status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {job.record_status}
                  </span>
                </td>
                {(canEditJob() || canDeleteJob()) && (
                  <td className="px-6 py-4">
                    {canEditJob() && job.record_status === 'ACTIVE' && (
                      <button onClick={() => { setEditingJob(job); setShowModal(true); }} className="text-blue-600 mr-2">Edit</button>
                    )}
                    {canDeleteJob() && job.record_status === 'ACTIVE' && (
                      <button onClick={() => handleDelete(job.jobCode)} className="text-red-600 mr-2">Delete</button>
                    )}
                    {canDeleteJob() && job.record_status === 'INACTIVE' && (
                      <button onClick={() => handleRecover(job.jobCode)} className="text-green-600">Recover</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddJobModal isOpen={showModal} onClose={() => { setShowModal(false); setEditingJob(null); }} onSave={handleSave} editingJob={editingJob} />
    </div>
  );
}
