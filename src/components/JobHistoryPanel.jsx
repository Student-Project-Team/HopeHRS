import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';
import { memo } from 'react';

function JobHistoryPanel({ history, onRefresh, onEdit, onDelete, onRecover }) {
  const { user } = useAuth();
  const { canEditJobHistory, canDeleteJobHistory } = useRights();

  const userType = user?.user_type || 'USER';
  const isAdminPlus = userType === 'ADMIN' || userType === 'SUPERADMIN';

  // Whether the Actions column should render at all
  const showActions = canEditJobHistory() || canDeleteJobHistory();

  if (!history || history.length === 0) {
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
              {/* Stamp column - visible only for ADMIN/SUPERADMIN */}
              {isAdminPlus && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Stamp
                </th>
              )}
              {showActions && (
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {history.map((item, idx) => (
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

                {/* Stamp column - visible only for ADMIN/SUPERADMIN */}
                {isAdminPlus && (
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-[180px] truncate" title={item.stamp}>
                    {item.stamp || '-'}
                  </td>
                )}

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

export default memo(JobHistoryPanel);