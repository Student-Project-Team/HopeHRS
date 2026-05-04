import { useState, useEffect } from 'react';
import { getHeadcountByDepartment } from '../services/reportService';

export default function HeadcountByDeptPage() {
  const [headcountData, setHeadcountData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHeadcountData();
  }, []);

  const fetchHeadcountData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHeadcountByDepartment();
      setHeadcountData(data || []);
    } catch (err) {
      console.error('Error fetching headcount data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalEmployees = headcountData.reduce((sum, dept) => sum + (dept.headcount || 0), 0);
  const maxHeadcount = Math.max(...headcountData.map(d => d.headcount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-slate-600 rounded-full animate-spin" />
          <p className="text-[11px] font-medium text-slate-400 tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="m-4 p-3.5 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2.5">
        <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Headcount by Department</h1>
        <p className="mt-0.5 text-xs text-slate-400">
          Active employee count per department
        </p>
      </div>

      {/* Summary Card */}
      <div className="bg-blue-900 rounded-xl p-5 mb-6 text-white shadow-sm">
        <div className="text-xs font-medium text-blue-200 mb-1 tracking-wide text-center">TOTAL ACTIVE EMPLOYEES</div>
        <div className="text-3xl font-bold text-center">{totalEmployees}</div>
        <div className="text-xs text-blue-300 mt-1 text-center">Across {headcountData.length} departments</div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto w-full">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Department Code</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Department Name</th>
              <th className="px-4 py-2.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Employee Count</th>
              <th className="px-4 py-2.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">% of Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {headcountData.length === 0 ? (
              <tr>
                <td colSpan="4" className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-500">No department data available</p>
                  </div>
                </td>
              </tr>
            ) : (
              headcountData.map((dept, idx) => (
                <tr key={dept.deptCode || idx} className="hover:bg-slate-50 transition-colors duration-100">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[11px] font-bold font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {dept.deptCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-700">
                    {dept.deptName}
                  </td>
                  <td className="px-4 py-3 text-xs text-center font-semibold text-slate-800 whitespace-nowrap">
                    {dept.headcount || 0}
                  </td>
                  <td className="px-4 py-3 text-xs text-center text-slate-500 whitespace-nowrap">
                    {totalEmployees > 0 
                      ? `${((dept.headcount || 0) / totalEmployees * 100).toFixed(1)}%`
                      : '0%'
                    }
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Bar Chart Visualization */}
      {headcountData.length > 0 && (
        <div className="mt-6 bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Visual Summary</h3>
          <div className="space-y-3">
            {headcountData.map((dept, idx) => (
              <div key={dept.deptCode || idx}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-slate-600">{dept.deptName}</span>
                  <span className="text-slate-400">{dept.headcount || 0}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-900 rounded-full h-2 transition-all duration-500"
                    style={{ 
                      width: `${maxHeadcount > 0 ? ((dept.headcount || 0) / maxHeadcount * 100) : 0}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}