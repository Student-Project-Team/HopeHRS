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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
