import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';
import { memo, useMemo } from 'react';

function JobHistoryPanel({ history, onRefresh, onEdit, onDelete, onRecover, isLoading = false }) {
  const { user } = useAuth();
  const { canEditJobHistory, canDeleteJobHistory } = useRights();

  const userType = user?.user_type || 'USER';
  const isAdminPlus = userType === 'ADMIN' || userType === 'SUPERADMIN';

  // FILTER history based on user type
  const filteredHistory = useMemo(() => {
    if (!history) return [];
    
    // Regular USER: only see ACTIVE records
    if (!isAdminPlus) {
      return history.filter(item => item.record_status === 'ACTIVE');
    }
    
    // ADMIN/SUPERADMIN: see all records
    return history;
  }, [history, isAdminPlus]);

  // Whether the Actions column should render at all
  const showActions = canEditJobHistory() || canDeleteJobHistory();

  // Show loading state while fetching
  if (isLoading && filteredHistory.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600" />
          <span className="text-sm">Loading job history...</span>
        </div>
      </div>
    );
  }

  if (!filteredHistory || filteredHistory.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-400">
        <p className="text-sm">No job history records found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Job Title
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Department
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Effective Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Salary
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Status
              </th>
              {showActions && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredHistory.map((item, idx) => (
              <tr
                key={item.id ?? idx}
                className={`hover:bg-slate-50 transition ${
                  item.record_status === 'INACTIVE' ? 'opacity-60 bg-slate-50' : ''
                }`}
              >
                <td className="px-4 py-3 text-sm text-slate-700">
                  {item.jobDesc || item.jobcode}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {item.deptName || item.deptcode}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {item.effdate || item.effDate}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {item.salary ? `$${Number(item.salary).toLocaleString()}` : '-'}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-md ${
                      item.record_status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {item.record_status || 'ACTIVE'}
                  </span>
                </td>

                {showActions && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    {/* Edit — JH_EDIT, only on ACTIVE records */}
                    {canEditJobHistory() && item.record_status === 'ACTIVE' && (
                      <button
                        onClick={() => onEdit?.(item)}
                        className="text-slate-600 hover:text-slate-800 mr-3 text-sm font-medium transition"
                      >
                        Edit
                      </button>
                    )}

                    {/* Soft-delete — JH_DEL, only on ACTIVE records */}
                    {canDeleteJobHistory() && item.record_status === 'ACTIVE' && (
                      <button
                        onClick={() => onDelete?.(item)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    )}

                    {/* Recover — ADMIN+, only on INACTIVE records */}
                    {isAdminPlus && item.record_status === 'INACTIVE' && (
                      <button
                        onClick={() => onRecover?.(item)}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition"
                      >
                        Recover
                      </button>
import { useState } from 'react';
import { updateJobHistoryEntry, softDeleteJobHistoryEntry, recoverJobHistoryEntry } from '../services/jobHistoryService';
import { useAuth } from '../hooks/useAuth';

export default function JobHistoryPanel({ jobHistory, userType, onRefresh }) {
  const { user } = useAuth();
  const [editingRow, setEditingRow] = useState(null);
  const [editData, setEditData] = useState({});

  const canEdit = userType === 'ADMIN' || userType === 'SUPERADMIN';
  const canDelete = userType === 'SUPERADMIN';

  const handleEdit = (entry) => {
    setEditingRow(`${entry.empNo}-${entry.jobCode}-${entry.effDate}`);
    setEditData({
      salary: entry.salary,
      deptCode: entry.deptCode
    });
  };

  const handleSaveEdit = async (entry) => {
    try {
      const { error } = await updateJobHistoryEntry(
        entry.empNo,
        entry.jobCode,
        entry.effDate,
        editData,
        user?.email
      );
      if (error) throw error;
      setEditingRow(null);
      onRefresh();
    } catch (err) {
      console.error('Error updating:', err);
      alert('Update failed');
    }
  };

  const handleSoftDelete = async (entry) => {
    if (window.confirm('Soft delete this job history entry?')) {
      const { error } = await softDeleteJobHistoryEntry(
        entry.empNo,
        entry.jobCode,
        entry.effDate,
        user?.email
      );
      if (!error) onRefresh();
    }
  };

  const handleRecover = async (entry) => {
    const { error } = await recoverJobHistoryEntry(
      entry.empNo,
      entry.jobCode,
      entry.effDate,
      user?.email
    );
    if (!error) onRefresh();
  };

  if (jobHistory.length === 0) {
    return <p className="text-gray-500 text-center py-4">No job history found</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Job Code</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Job Description</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Department</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Effective Date</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Salary</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Status</th>
            {(canEdit || canDelete) && (
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {jobHistory.map((entry, idx) => {
            const isEditing = editingRow === `${entry.empNo}-${entry.jobCode}-${entry.effDate}`;
            return (
              <tr key={idx} className={entry.record_status === 'INACTIVE' ? 'bg-gray-50' : ''}>
                <td className="px-4 py-3 text-sm">{entry.jobCode}</td>
                <td className="px-4 py-3 text-sm">{entry.jobDesc || '-'}</td>
                <td className="px-4 py-3 text-sm">{entry.deptName || entry.deptCode}</td>
                <td className="px-4 py-3 text-sm">{entry.effDate}</td>
                <td className="px-4 py-3 text-sm">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.salary}
                      onChange={(e) => setEditData({ ...editData, salary: e.target.value })}
                      className="border rounded px-2 py-1 w-24"
                    />
                  ) : (
                    `$${entry.salary?.toLocaleString()}`
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    entry.record_status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {entry.record_status}
                  </span>
                </td>
                {(canEdit || canDelete) && (
                  <td className="px-4 py-3 text-sm">
                    {isEditing ? (
                      <>
                        <button onClick={() => handleSaveEdit(entry)} className="text-green-600 mr-2">Save</button>
                        <button onClick={() => setEditingRow(null)} className="text-gray-500">Cancel</button>
                      </>
                    ) : (
                      <>
                        {canEdit && entry.record_status === 'ACTIVE' && (
                          <button onClick={() => handleEdit(entry)} className="text-blue-600 mr-2">Edit</button>
                        )}
                        {canDelete && entry.record_status === 'ACTIVE' && (
                          <button onClick={() => handleSoftDelete(entry)} className="text-red-600">Delete</button>
                        )}
                        {canDelete && entry.record_status === 'INACTIVE' && (
                          <button onClick={() => handleRecover(entry)} className="text-green-600">Recover</button>
                        )}
                      </>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Use memo to prevent unnecessary re-renders
export default memo(JobHistoryPanel);
export default memo(JobHistoryPanel);
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
