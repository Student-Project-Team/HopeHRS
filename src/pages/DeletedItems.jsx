import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAllEmployees, recoverEmployee } from '../services/employeeService';
import { getAllJobs } from '../services/jobService';
import { getAllDepartments } from '../services/departmentService';
import { supabase } from '../lib/supabase';
import { makeStamp } from '../utils/stamp';

// ─── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'employees', label: 'Employees' },
  { id: 'jobhistory', label: 'Job History' },
  { id: 'jobs', label: 'Jobs' },
  { id: 'departments', label: 'Departments' },
];

// ─── Table Helper Components ───────────────────────────────────────────────────
function Th({ children, className = '' }) {
  return (
    <th className={`px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap ${className}`}>
      {children}
    </th>
  );
}

function Td({ children, className = '' }) {
  return (
    <td className={`px-3 py-3 ${className}`}>
      {children}
    </td>
  );
}

// ─── Shared UI pieces ──────────────────────────────────────────────────────────
function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-500 text-center">No inactive {label.toLowerCase()} found</p>
      <p className="text-xs text-slate-400 mt-1 text-center">Items deactivated from other pages will appear here</p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-900 rounded-full animate-spin" />
        <p className="text-[11px] font-medium text-slate-400 tracking-widest uppercase">Loading</p>
      </div>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="m-4 p-4 bg-red-50 border border-red-100 rounded-xl flex flex-col items-center gap-3 text-center">
      <div className="flex items-start gap-2.5">
        <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-red-600">Error: {message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-semibold transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Try Again
        </button>
      )}
    </div>
  );
}

function RecoverButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-md transition-colors disabled:opacity-40 whitespace-nowrap"
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      )}
      Recover
    </button>
  );
}

// ─── Tab: Deleted Employees ────────────────────────────────────────────────────
function DeletedEmployees({ userEmail }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recoveringId, setRecId] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllEmployees('ADMIN');
      setRows((data || []).filter(e => e.record_status === 'INACTIVE'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRecover = async (emp) => {
    if (!window.confirm(`Recover employee ${emp.firstname} ${emp.lastname}?`)) return;
    setRecId(emp.empno);
    try {
      await recoverEmployee(emp.empno, userEmail);
      await load();
    } catch (err) {
      alert('Failed to recover: ' + err.message);
    } finally {
      setRecId(null);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows.length) return <EmptyState label="Employees" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <Th className="pl-6 pr-3">Emp No</Th>
            <Th>Last Name</Th>
            <Th>First Name</Th>
            <Th>Gender</Th>
            <Th>Hire Date</Th>
            <Th>Sep Date</Th>
            <Th>Stamp</Th>
            <Th className="pr-8">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map(emp => (
            <tr key={emp.empno} className="hover:bg-slate-50 transition-colors duration-100">
              <Td className="pl-6 pr-3"><span className="text-[11px] font-bold font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap">{emp.empno}</span></Td>
              <Td><span className="text-xs font-semibold text-slate-700 break-words block max-w-[120px]">{emp.lastname}</span></Td>
              <Td><span className="text-xs text-slate-600 break-words block max-w-[120px]">{emp.firstname}</span></Td>
              <Td><span className="text-xs text-slate-500 whitespace-nowrap">{emp.gender}</span></Td>
              <Td><span className="text-xs text-slate-600 tabular-nums whitespace-nowrap">{emp.hiredate}</span></Td>
              <Td><span className="text-xs text-slate-400 tabular-nums whitespace-nowrap">{emp.sepdate || '—'}</span></Td>
              <Td><span className="text-[10px] text-slate-400 block max-w-[150px] truncate" title={emp.stamp}>{emp.stamp || '—'}</span></Td>
              <Td className="pr-8"><RecoverButton onClick={() => handleRecover(emp)} loading={recoveringId === emp.empno} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tab: Deleted Job History ─────────────────────────────────────────────────
function DeletedJobHistory({ userEmail }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recoveringKey, setRecKey] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: dbErr } = await supabase
        .from('jobhistory')
        .select(`
          empno, jobcode, deptcode, effdate, salary, stamp, record_status,
          job:jobcode ( jobdesc ),
          dept:deptcode ( deptname )
        `)
        .eq('record_status', 'INACTIVE')
        .order('effdate', { ascending: false });
      if (dbErr) throw dbErr;
      setRows(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const rowKey = (item) => `${item.empno}|${item.jobcode}|${item.effdate}`;

  const handleRecover = async (item) => {
    if (!window.confirm('Recover this job history record?')) return;
    const key = rowKey(item);
    setRecKey(key);
    try {
      const stamp = makeStamp('RECOVERED', userEmail);
      const { error: dbErr } = await supabase
        .from('jobhistory')
        .update({ record_status: 'ACTIVE', stamp })
        .eq('empno', item.empno)
        .eq('jobcode', item.jobcode)
        .eq('effdate', item.effdate);
      if (dbErr) throw dbErr;
      await load();
    } catch (err) {
      alert('Failed to recover: ' + err.message);
    } finally {
      setRecKey(null);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows.length) return <EmptyState label="Job History" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <Th className="pl-6 pr-3">Emp No</Th>
            <Th>Job Title</Th>
            <Th>Department</Th>
            <Th>Eff Date</Th>
            <Th>Salary</Th>
            <Th>Stamp</Th>
            <Th className="pr-8">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map(item => (
            <tr key={rowKey(item)} className="hover:bg-slate-50 transition-colors duration-100">
              <Td className="pl-6 pr-3"><span className="text-[11px] font-bold font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap">{item.empno}</span></Td>
              <Td><span className="text-xs font-semibold text-slate-700 break-words block max-w-[150px]">{item.job?.jobdesc || item.jobcode}</span></Td>
              <Td><span className="text-xs text-slate-600 break-words block max-w-[120px]">{item.dept?.deptname || item.deptcode}</span></Td>
              <Td><span className="text-xs text-slate-600 tabular-nums whitespace-nowrap">{item.effdate}</span></Td>
              <Td><span className="text-xs text-slate-600 tabular-nums whitespace-nowrap">{item.salary ? `$${Number(item.salary).toLocaleString()}` : '—'}</span></Td>
              <Td><span className="text-[10px] text-slate-400 block max-w-[150px] truncate" title={item.stamp}>{item.stamp || '—'}</span></Td>
              <Td className="pr-8"><RecoverButton onClick={() => handleRecover(item)} loading={recoveringKey === rowKey(item)} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tab: Deleted Jobs ────────────────────────────────────────────────────────
function DeletedJobs({ userEmail }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recoveringCode, setRecCode] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllJobs('ADMIN');
      setRows((data || []).filter(j => j.record_status === 'INACTIVE'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRecover = async (job) => {
    if (!window.confirm(`Recover job "${job.jobDesc}"?`)) return;
    setRecCode(job.jobCode);
    try {
      const stamp = makeStamp('RECOVERED', userEmail);
      const { error: dbErr } = await supabase
        .from('job')
        .update({ record_status: 'ACTIVE', stamp })
        .eq('jobcode', job.jobCode);
      if (dbErr) throw dbErr;
      await load();
    } catch (err) {
      alert('Failed to recover: ' + err.message);
    } finally {
      setRecCode(null);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows.length) return <EmptyState label="Jobs" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <Th className="pl-6 pr-3">Job Code</Th>
            <Th>Job Description</Th>
            <Th>Stamp</Th>
            <Th className="pr-8">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map(job => (
            <tr key={job.jobCode} className="hover:bg-slate-50 transition-colors duration-100">
              <Td className="pl-6 pr-3"><span className="text-[11px] font-bold font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap">{job.jobCode}</span></Td>
              <Td><span className="text-xs font-semibold text-slate-700 break-words block max-w-[200px]">{job.jobDesc}</span></Td>
              <Td><span className="text-[10px] text-slate-400 block max-w-[150px] truncate" title={job.stamp}>{job.stamp || '—'}</span></Td>
              <Td className="pr-8"><RecoverButton onClick={() => handleRecover(job)} loading={recoveringCode === job.jobCode} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Tab: Deleted Departments ─────────────────────────────────────────────────
function DeletedDepartments({ userEmail }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recoveringCode, setRecCode] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllDepartments('ADMIN');
      setRows((data || []).filter(d => d.record_status === 'INACTIVE'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleRecover = async (dept) => {
    if (!window.confirm(`Recover department "${dept.deptName}"?`)) return;
    setRecCode(dept.deptCode);
    try {
      const stamp = makeStamp('RECOVERED', userEmail);
      const { error: dbErr } = await supabase
        .from('department')
        .update({ record_status: 'ACTIVE', stamp })
        .eq('deptcode', dept.deptCode);
      if (dbErr) throw dbErr;
      await load();
    } catch (err) {
      alert('Failed to recover: ' + err.message);
    } finally {
      setRecCode(null);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!rows.length) return <EmptyState label="Departments" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            <Th className="pl-6 pr-3">Dept Code</Th>
            <Th>Department Name</Th>
            <Th>Stamp</Th>
            <Th className="pr-8">Actions</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map(dept => (
            <tr key={dept.deptCode} className="hover:bg-slate-50 transition-colors duration-100">
              <Td className="pl-6 pr-3"><span className="text-[11px] font-bold font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded whitespace-nowrap">{dept.deptCode}</span></Td>
              <Td><span className="text-xs font-semibold text-slate-700 break-words block max-w-[200px]">{dept.deptName}</span></Td>
              <Td><span className="text-[10px] text-slate-400 block max-w-[150px] truncate" title={dept.stamp}>{dept.stamp || '—'}</span></Td>
              <Td className="pr-8"><RecoverButton onClick={() => handleRecover(dept)} loading={recoveringCode === dept.deptCode} /></Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────
export default function DeletedItems() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('employees');

  const userType = user?.user_type || 'USER';
  const isAdminPlus = userType === 'ADMIN' || userType === 'SUPERADMIN';
  const userEmail = user?.email;

  if (!isAdminPlus) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 w-full max-w-sm text-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Access Restricted</p>
          <p className="text-sm font-medium text-slate-700">Only admins can view deleted items.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">Deleted Items</h1>
          <p className="mt-0.5 text-[11px] sm:text-xs text-slate-400">View and recover deactivated records across all modules</p>
        </div>
      </div>

      {/* Tab bar - responsive */}
      <div className="flex flex-wrap gap-1 mb-0 bg-slate-100 p-1 rounded-lg">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-all duration-150 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-blue-900 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-blue-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-t-0 border-slate-200 overflow-hidden">
        <div className={activeTab === 'employees' ? '' : 'hidden'}>
          <DeletedEmployees userEmail={userEmail} />
        </div>
        <div className={activeTab === 'jobhistory' ? '' : 'hidden'}>
          <DeletedJobHistory userEmail={userEmail} />
        </div>
        <div className={activeTab === 'jobs' ? '' : 'hidden'}>
          <DeletedJobs userEmail={userEmail} />
        </div>
        <div className={activeTab === 'departments' ? '' : 'hidden'}>
          <DeletedDepartments userEmail={userEmail} />
        </div>
      </div>
    </div>
  );
}
