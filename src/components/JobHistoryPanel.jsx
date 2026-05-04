import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';
import { memo, useMemo } from 'react';

function JobHistoryPanel({ history, onRefresh, onEdit, onDelete, onRecover, isLoading = false }) {
  const { user } = useAuth();
  const { canEditJobHistory, canDeleteJobHistory } = useRights();

  const userType = user?.user_type || 'USER';
  const isAdminPlus = userType === 'ADMIN' || userType === 'SUPERADMIN';

  const filteredHistory = useMemo(() => {
    if (!history) return [];
    if (!isAdminPlus) return history.filter(item => item.record_status === 'ACTIVE');
    return history;
  }, [history, isAdminPlus]);

  const showActions = canEditJobHistory() || canDeleteJobHistory();

  if (isLoading && filteredHistory.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
        <div className="flex items-center justify-center gap-2 text-slate-400">
          <div className="w-4 h-4 border-2 border-slate-200 border-t-blue-900 rounded-full animate-spin" />
          <span className="text-xs font-medium tracking-wide">Loading job history...</span>
        </div>
      </div>
    );
  }

  if (!filteredHistory || filteredHistory.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center">
        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">No job history records found.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <table className="w-full table-fixed">
        <colgroup>
          <col style={{ width: '22%' }} />
          <col style={{ width: '20%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '13%' }} />
          <col style={{ width: '10%' }} />
          {showActions && <col style={{ width: '20%' }} />}
        </colgroup>
        <thead>
          <tr className="border-b border-slate-100">
            {['Job Title', 'Department', 'Effective Date', 'Salary', 'Status', ...(showActions ? ['Actions'] : [])].map((col) => (
              <th key={col} className="px-3 py-3.5 text-left text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {filteredHistory.map((item, idx) => (
            <tr
              key={item.id ?? idx}
              className={`transition-colors duration-100 ${
                item.record_status === 'INACTIVE' ? 'opacity-50 bg-slate-50/50' : 'hover:bg-slate-50'
              }`}
            >
              <td className="px-3 py-3 text-xs font-semibold text-slate-700 truncate">
                {item.jobDesc || item.jobcode}
              </td>
              <td className="px-3 py-3 text-xs text-slate-600 truncate">
                {item.deptName || item.deptcode}
              </td>
              <td className="px-3 py-3 text-xs text-slate-600 tabular-nums">
                {item.effdate || item.effDate}
              </td>
              <td className="px-3 py-3 text-xs text-slate-600 tabular-nums">
                {item.salary ? `$${Number(item.salary).toLocaleString()}` : '—'}
              </td>
              <td className="px-3 py-3">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold border ${
                  item.record_status === 'ACTIVE'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : 'bg-white text-slate-400 border-slate-200'
                }`}>
                  {item.record_status === 'ACTIVE' && (
                    <span className="w-1 h-1 rounded-full bg-green-500 shrink-0" />
                  )}
                  {item.record_status || 'ACTIVE'}
                </span>
              </td>

              {showActions && (
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    {canEditJobHistory() && item.record_status === 'ACTIVE' && (
                      <button
                        onClick={() => onEdit?.(item)}
                        className="text-[11px] font-semibold text-blue-900 hover:text-blue-700 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    {canDeleteJobHistory() && item.record_status === 'ACTIVE' && (
                      <button
                        onClick={() => onDelete?.(item)}
                        className="text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Delete
                      </button>
                    )}
                    {isAdminPlus && item.record_status === 'INACTIVE' && (
                      <button
                        onClick={() => onRecover?.(item)}
                        className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        Recover
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default memo(JobHistoryPanel);