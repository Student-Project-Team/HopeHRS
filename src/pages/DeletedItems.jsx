import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAllEmployees, recoverEmployee } from '../services/employeeService';
import { getAllJobs } from '../services/jobService';
import { getAllDepartments } from '../services/departmentService';
import { supabase } from '../lib/supabase';
import { makeStamp } from '../utils/stamp';

// ─── Tab config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'employees',   label: 'Employees' },
  { id: 'jobhistory',  label: 'Job History' },
  { id: 'jobs',        label: 'Jobs' },
  { id: 'departments', label: 'Departments' },
];

// ─── Th helper ────────────────────────────────────────────────────────────────
function Th({ children }) {
  return (
    <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}

// ─── Shared UI pieces ──────────────────────────────────────────────────────────
function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12" />
        </svg>
      </div>
      <p className="text-sm font-medium text-slate-500">No inactive {label.toLowerCase()} found</p>
      <p className="text-xs text-slate-400 mt-1">Items deactivated from other pages will appear here</p>
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

function ErrorState({ message }) {
  return (
    <div className="m-4 p-3.5 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2.5">
      <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm text-red-600">Error: {message}</p>
    </div>
  );
}

function RecoverButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-md transition-colors disabled:opacity-40"
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
      const data = await getAllEmployees('ADMIN');
      setRows((data || []).filter(e => e.record_status === 'INACTIVE'));
      setError(null);
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
  if (error) return <ErrorState message={error} />;
  if (!rows.length) return <EmptyState label="Employees" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {['Emp No', 'Last Name', 'First Name', 'Gender', 'Hire Date', 'Sep Date', 'Stamp', 'Actions'].map(h => (
              <Th key={h}>{h}</Th>
            ))}
           </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map(emp => (
            <tr key={emp.empno} className="hover:bg-slate-50 transition-colors duration-100">
              <td className="px-3 py-3">
                <span className="text-[11px] font-bold font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  {emp.empno}
                </span>
               </td>
              <td className="px-3 py-3 text-xs font-semibold text-slate-700 truncate">{emp.lastname}</td>
              <td className="px-3 py-3 text-xs text-slate-600 truncate">{emp.firstname}</td>
              <td className="px-3 py-3 text-xs text-slate-500">{emp.gender}</td>
              <td className="px-3 py-3 text-xs text-slate-600 tabular-nums">{emp.hiredate}</td>
              <td className="px-3 py-3 text-xs text-slate-400 tabular-nums">{emp.sepdate || '—'}</td>
              <td className="px-3 py-3 text-[10px] text-slate-400 truncate" title={emp.stamp}>{emp.stamp || '—'}</td>
              <td className="px-3 py-3">
                <RecoverButton onClick={() => handleRecover(emp)} loading={recoveringId === emp.empno} />
              </td>
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
      setError(null);
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
  if (error) return <ErrorState message={error} />;
  if (!rows.length) return <EmptyState label="Job History" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {['Emp No', 'Job Title', 'Department', 'Eff Date', 'Salary', 'Stamp', 'Actions'].map(h => (
              <Th key={h}>{h}</Th>
            ))}
           </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map(item => (
            <tr key={rowKey(item)} className="hover:bg-slate-50 transition-colors duration-100">
              <td className="px-3 py-3">
                <span className="text-[11px] font-bold font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  {item.empno}
                </span>
              </td>
              <td className="px-3 py-3 text-xs font-semibold text-slate-700 truncate">{item.job?.jobdesc || item.jobcode}</td>
              <td className="px-3 py-3 text-xs text-slate-600 truncate">{item.dept?.deptname || item.deptcode}</td>
              <td className="px-3 py-3 text-xs text-slate-600 tabular-nums">{item.effdate}</td>
              <td className="px-3 py-3 text-xs text-slate-600 tabular-nums">
                {item.salary ? `$${Number(item.salary).toLocaleString()}` : '—'}
              </td>
              <td className="px-3 py-3 text-[10px] text-slate-400 truncate" title={item.stamp}>{item.stamp || '—'}</td>
              <td className="px-3 py-3">
                <RecoverButton onClick={() => handleRecover(item)} loading={recoveringKey === rowKey(item)} />
              </td>
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
      const data = await getAllJobs('ADMIN');
      setRows((data || []).filter(j => j.record_status === 'INACTIVE'));
      setError(null);
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
  if (error) return <ErrorState message={error} />;
  if (!rows.length) return <EmptyState label="Jobs" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {['Job Code', 'Job Description', 'Stamp', 'Actions'].map(h => (
              <Th key={h}>{h}</Th>
            ))}
           </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map(job => (
            <tr key={job.jobCode} className="hover:bg-slate-50 transition-colors duration-100">
              <td className="px-3 py-3">
                <span className="text-[11px] font-bold font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  {job.jobCode}
                </span>
              </td>
              <td className="px-3 py-3 text-xs font-semibold text-slate-700 truncate">{job.jobDesc}</td>
              <td className="px-3 py-3 text-[10px] text-slate-400 truncate" title={job.stamp}>{job.stamp || '—'}</td>
              <td className="px-3 py-3">
                <RecoverButton onClick={() => handleRecover(job)} loading={recoveringCode === job.jobCode} />
              </td>
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
      const data = await getAllDepartments('ADMIN');
      setRows((data || []).filter(d => d.record_status === 'INACTIVE'));
      setError(null);
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
  if (error) return <ErrorState message={error} />;
  if (!rows.length) return <EmptyState label="Departments" />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {['Dept Code', 'Department Name', 'Stamp', 'Actions'].map(h => (
              <Th key={h}>{h}</Th>
            ))}
           </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map(dept => (
            <tr key={dept.deptCode} className="hover:bg-slate-50 transition-colors duration-100">
              <td className="px-3 py-3">
                <span className="text-[11px] font-bold font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                  {dept.deptCode}
                </span>
              </td>
              <td className="px-3 py-3 text-xs font-semibold text-slate-700 truncate">{dept.deptName}</td>
              <td className="px-3 py-3 text-[10px] text-slate-400 truncate" title={dept.stamp}>{dept.stamp || '—'}</td>
              <td className="px-3 py-3">
                <RecoverButton onClick={() => handleRecover(dept)} loading={recoveringCode === dept.deptCode} />
              </td>
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
        <div className="bg-white rounded-xl border border-slate-200 p-8 w-full max-w-sm text-center shadow-sm">
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
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Deleted Items</h1>
          <p className="mt-0.5 text-xs text-slate-400">View and recover deactivated records across all modules</p>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 mb-0 bg-slate-100 p-1 rounded-lg w-fit">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-white text-blue-900 shadow-sm font-semibold'
                : 'text-slate-500 hover:text-blue-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels — rendered once, shown/hidden via CSS to preserve state */}
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