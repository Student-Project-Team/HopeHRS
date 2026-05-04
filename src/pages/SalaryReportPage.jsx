import { useState, useEffect } from 'react';
import { getSalarySummaryByJob } from '../services/reportService';

export default function SalaryReportPage() {
  const [salaryData, setSalaryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSalaryData();
  }, []);

  const fetchSalaryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSalarySummaryByJob();
      setSalaryData(data || []);
    } catch (err) {
      console.error('Error fetching salary data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const overallStats = salaryData.length > 0 ? {
    min: Math.min(...salaryData.map(job => job.minSalary || 0)),
    avg: salaryData.reduce((sum, job) => sum + (job.avgSalary || 0), 0) / salaryData.length,
    max: Math.max(...salaryData.map(job => job.maxSalary || 0)),
  } : null;

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
        <h1 className="text-xl font-bold text-slate-800 tracking-tight">Salary Summary by Job</h1>
        <p className="mt-0.5 text-xs text-slate-400">
          Minimum, maximum, and average salary per job position
        </p>
      </div>

      {/* Statistics Cards */}
      {overallStats && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-green-50 rounded-lg p-3 border border-green-100 text-center">
            <div className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Min Salary</div>
            <div className="text-lg font-bold text-green-700 mt-1">{formatCurrency(overallStats.min)}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 text-center">
            <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Avg Salary</div>
            <div className="text-lg font-bold text-blue-700 mt-1">{formatCurrency(overallStats.avg)}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100 text-center">
            <div className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Max Salary</div>
            <div className="text-lg font-bold text-purple-700 mt-1">{formatCurrency(overallStats.max)}</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto w-full">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Job Code</th>
              <th className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Job Description</th>
              <th className="px-4 py-2.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Min Salary</th>
              <th className="px-4 py-2.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Max Salary</th>
              <th className="px-4 py-2.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Avg Salary</th>
              <th className="px-4 py-2.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Assignments</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {salaryData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-16 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-500">No salary data available</p>
                  </div>
                </td>
              </tr>
            ) : (
              salaryData.map((job, idx) => (
                <tr key={job.jobCode || idx} className="hover:bg-slate-50 transition-colors duration-100">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[11px] font-bold font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {job.jobCode}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-medium text-slate-700">
                    {job.jobDesc}
                  </td>
                  <td className="px-4 py-3 text-xs text-center text-green-600 font-medium whitespace-nowrap">
                    {formatCurrency(job.minSalary)}
                  </td>
                  <td className="px-4 py-3 text-xs text-center text-red-500 font-medium whitespace-nowrap">
                    {formatCurrency(job.maxSalary)}
                  </td>
                  <td className="px-4 py-3 text-xs text-center text-blue-600 font-semibold whitespace-nowrap">
                    {formatCurrency(job.avgSalary)}
                  </td>
                  <td className="px-4 py-3 text-xs text-center text-slate-600 font-semibold whitespace-nowrap">
                    {job.totalAssignments || 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}