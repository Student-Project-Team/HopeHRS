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
  const isAdminPlus = userType === 'ADMIN' || userType === 'SUPERADMIN';
import { getAllJobs, createJob, updateJob, softDeleteJob, recoverJob } from '../services/jobService';
import AddJobModal from '../components/AddJobModal';
import EditJobModal from '../components/EditJobModal';
import SoftDeleteConfirmDialog from '../components/SoftDeleteConfirmDialog';

export default function JobListPage() {
  const { user } = useAuth();
  const { canAddJob, canEditJob, canDeleteJob } = useRights();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const userType = user?.user_type || 'USER';
  const isAdminPlus = userType === 'ADMIN' || userType === 'SUPERADMIN';
  const isSuperAdmin = userType === 'SUPERADMIN';

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

  const filteredJobs = jobs.filter((job) => {
    if (statusFilter === 'ALL') return true;
    return job.record_status === statusFilter;
  });

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

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await softDeleteJob(deleteTarget.jobCode, user?.email);
      setDeleteTarget(null);
      await fetchJobs();
    } catch (err) {
      alert('Failed to delete job: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRecover = async (jobCode) => {
    if (!window.confirm('Recover this job?')) return;
    setActionLoading(jobCode);
    try {
      await recoverJob(jobCode, user?.email);
      await fetchJobs();
    } catch (err) {
      alert('Failed to recover job: ' + err.message);
    } finally {
      setActionLoading(null);
    }
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
import { getAllJobs } from '../services/jobService';

export default function JobListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await getAllJobs();
        setJobs(data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading jobs...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Jobs</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage job positions and descriptions</p>
        </div>
        {/* Add Job button - JOB_ADD (ADMIN, SUPERADMIN) */}
        {canAddJob() && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Add Job
          </button>
        )}
      </div>

      {/* Status Filter - ADMIN+ only */}
      {isAdminPlus && (
        <div className="flex flex-wrap gap-2 mb-4">
          {['ACTIVE', 'INACTIVE', 'ALL'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                statusFilter === f
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'ALL' ? 'All Jobs' : f === 'ACTIVE' ? 'Active Only' : 'Inactive Only'}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Job Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Job Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                {isAdminPlus && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Stamp</th>
                )}
                {canEditJob() && (
                {isAdminPlus && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={isAdminPlus ? 5 : 4} className="px-6 py-12 text-center text-slate-400 text-sm">
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No jobs found
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                filteredJobs.map((job) => (
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
                    {isAdminPlus && (
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate" title={job.stamp}>
                        {job.stamp || '-'}
                      </td>
                    )}
                    {canEditJob() && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {canEditJob() && job.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => { setEditingJob(job); setShowEditModal(true); }}
                            className="text-slate-600 hover:text-slate-800 text-sm font-medium transition"
                      <td className="px-6 py-4 text-xs text-slate-500 truncate max-w-[200px]" title={job.stamp}>
                        {job.stamp || '-'}
                      </td>
                    )}
                    {isAdminPlus && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* Edit Job button - JOB_EDIT (ADMIN, SUPERADMIN) - only on ACTIVE records */}
                        {canEditJob() && job.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => { setEditingJob(job); setShowEditModal(true); }}
                            className="text-slate-600 hover:text-slate-800 mr-3 text-sm font-medium transition"
                          >
                            Edit
                          </button>
                        )}

                        {/* Delete Job button - JOB_DEL (SUPERADMIN only) - only on ACTIVE records */}
                        {canDeleteJob() && isSuperAdmin && job.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => setDeleteTarget(job)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium transition"
                          >
                            Delete
                          </button>
                        )}

                        {/* Recover Job button - ADMIN+ - only on INACTIVE records */}
                        {isAdminPlus && job.record_status === 'INACTIVE' && (
                          <button
                            onClick={() => handleRecover(job.jobCode)}
                            disabled={actionLoading === job.jobCode}
                            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition disabled:opacity-50"
                          >
                            {actionLoading === job.jobCode ? '...' : 'Recover'}
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
        editingJob={null}
      />

      <EditJobModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingJob(null); }}
        onSave={handleEdit}
        job={editingJob}
      />

      <SoftDeleteConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        item={deleteTarget}
        itemType="job"
        loading={deleteLoading}
      />
        <h1 className="text-2xl font-bold">Jobs</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Job Code</th>
              <th className="px-6 py-3 text-left">Job Description</th>
              <th className="px-6 py-3 text-left">Status</th>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}