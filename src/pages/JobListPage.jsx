import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';
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
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-900 rounded-full animate-spin" />
        <p className="text-[11px] font-medium text-slate-400 tracking-widest uppercase">Loading</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="m-4 p-3.5 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2.5">
      <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm text-red-600">Error: {error}</p>
    </div>
  );

  const filters = [
    { key: 'ACTIVE',   label: 'Active Only' },
    { key: 'INACTIVE', label: 'Inactive Only' },
    { key: 'ALL',      label: 'All Jobs' },
  ];

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Jobs</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} shown
          </p>
        </div>
        {canAddJob() && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Job
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      {isAdminPlus && (
        <div className="flex gap-1 mb-4 bg-slate-100 p-1 rounded-lg w-fit">
          {filters.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
                statusFilter === key
                  ? 'bg-white text-blue-900 shadow-sm font-semibold'
                  : 'text-slate-500 hover:text-blue-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full">
        {filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">No jobs found</p>
            {isAdminPlus && statusFilter !== 'ALL' && (
              <p className="text-xs mt-1 text-slate-400">Try changing the filter</p>
            )}
          </div>
        ) : (
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {[
                  'Job Code', 'Job Description', 'Status',
                  ...(isAdminPlus ? ['Stamp'] : []),
                  ...(isAdminPlus ? ['Actions'] : []),
                ].map((col) => (
                  <th key={col} className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredJobs.map((job) => (
                <tr
                  key={job.jobCode}
                  className={`transition-colors duration-100 ${
                    job.record_status === 'INACTIVE'
                      ? 'bg-slate-50/70 opacity-60'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-3 py-3">
                    <span className="text-[11px] font-bold font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {job.jobCode}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs font-semibold text-slate-700 truncate">{job.jobDesc}</td>
                  <td className="px-3 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                      job.record_status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}>
                      {job.record_status === 'ACTIVE' && (
                        <span className="w-1 h-1 rounded-full bg-green-500 shrink-0" />
                      )}
                      {job.record_status}
                    </span>
                  </td>
                  {isAdminPlus && (
                    <td className="px-3 py-3 text-[10px] text-slate-400 truncate" title={job.stamp}>
                      {job.stamp || '—'}
                    </td>
                  )}
                  {isAdminPlus && (
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        {canEditJob() && job.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => { setEditingJob(job); setShowEditModal(true); }}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                          >
                            Edit
                          </button>
                        )}
                        {canDeleteJob() && isSuperAdmin && job.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => setDeleteTarget(job)}
                            className="text-[11px] font-semibold text-red-400 hover:text-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        )}
                        {userType === 'ADMIN' && job.record_status === 'INACTIVE' && (
                          <button
                            onClick={() => handleRecover(job.jobCode)}
                            disabled={actionLoading === job.jobCode}
                            className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-40"
                          >
                            {actionLoading === job.jobCode ? '...' : 'Recover'}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
    </div>
  );
}