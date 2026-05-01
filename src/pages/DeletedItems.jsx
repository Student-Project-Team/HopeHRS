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

// ─── Shared UI pieces ──────────────────────────────────────────────────────────
function EmptyState({ label }) {
  return (
    <div className="py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="flex items-center justify-center gap-2 py-16 text-slate-500">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600" />
      <span className="text-sm">Loading...</span>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="m-4 p-4 text-red-600 bg-red-50 rounded-lg border border-red-200 text-sm">
      Error: {message}
    </div>
  );
}

function RecoverButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 text-sm font-medium transition disabled:opacity-50"
    >
      {loading ? (
        <span className="w-3.5 h-3.5 border-2 border-emerald-300 border-t-emerald-600 rounded-full animate-spin" />
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

function DeletedEmployees({ userEmail }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recoveringId, setRecoveringId] = useState(null);

  const fetch = useCallback(async () => {
// ─── Th helper ────────────────────────────────────────────────────────────────
function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
      {children}
    </th>
  );
}

// ─── Tab: Deleted Employees ────────────────────────────────────────────────────
function DeletedEmployees({ userEmail }) {
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [recoveringId, setRecId]  = useState(null);

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

  useEffect(() => { fetch(); }, [fetch]);

  const handleRecover = async (emp) => {
    if (!window.confirm(`Recover employee ${emp.firstname} ${emp.lastname}?`)) return;
    setRecoveringId(emp.empno);
    try {
      await recoverEmployee(emp.empno, userEmail);
      await fetch();
    } catch (err) {
      alert('Failed to recover: ' + err.message);
    } finally {
      setRecoveringId(null);
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
  if (rows.length === 0) return <EmptyState label="Employees" />;
  if (error)   return <ErrorState message={error} />;
  if (!rows.length) return <EmptyState label="Employees" />;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50">
          <tr>
            {['Emp No', 'Last Name', 'First Name', 'Gender', 'Hire Date', 'Sep Date', 'Stamp', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            {['Emp No','Last Name','First Name','Gender','Hire Date','Sep Date','Stamp','Actions'].map(h => (
              <Th key={h}>{h}</Th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map(emp => (
            <tr key={emp.empno} className="hover:bg-slate-50 transition opacity-75">
              <td className="px-4 py-3 text-sm font-medium text-slate-700">{emp.empno}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{emp.lastname}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{emp.firstname}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{emp.gender}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{emp.hiredate}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{emp.sepdate || '-'}</td>
              <td className="px-4 py-3 text-xs text-slate-400 max-w-[180px] truncate" title={emp.stamp}>
                {emp.stamp || '-'}
              </td>
              <td className="px-4 py-3">
                <RecoverButton onClick={() => handleRecover(emp)} loading={recoveringId === emp.empno} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeletedJobHistory({ userEmail }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recoveringKey, setRecoveringKey] = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      // FIXED: No 'id' column - select only existing columns
      const { data, error: dbErr } = await supabase
        .from('jobhistory')
        .select('empno, jobcode, deptcode, effdate, salary, stamp, record_status')
// ─── Tab: Deleted Job History ─────────────────────────────────────────────────
// jobhistory table uses a composite PK: empno + jobcode + effdate (no id column)
function DeletedJobHistory({ userEmail }) {
  const [rows, setRows]           = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [recoveringKey, setRecKey] = useState(null); // "empno|jobcode|effdate"

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: dbErr } = await supabase
        .from('jobhistory')
        .select(`
          empno,
          jobcode,
          deptcode,
          effdate,
          salary,
          stamp,
          record_status,
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

  useEffect(() => { fetch(); }, [fetch]);

  const handleRecover = async (item) => {
    if (!window.confirm('Recover this job history record?')) return;
    const compositeKey = `${item.empno}-${item.jobcode}-${item.effdate}`;
    setRecoveringKey(compositeKey);
    try {
      const stamp = makeStamp('RECOVERED', userEmail);
      // FIXED: Use composite key instead of 'id'
      const { error: dbErr } = await supabase
        .from('jobhistory')
        .update({ record_status: 'ACTIVE', stamp })
        .eq('empno', item.empno)
        .eq('jobcode', item.jobcode)
        .eq('effdate', item.effdate);
      if (dbErr) throw dbErr;
      await fetch();
    } catch (err) {
      alert('Failed to recover: ' + err.message);
    } finally {
      setRecoveringKey(null);
  useEffect(() => { load(); }, [load]);

  // Build a unique string key from the composite PK
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
        .eq('empno',   item.empno)
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
  if (rows.length === 0) return <EmptyState label="Job History" />;
  if (error)   return <ErrorState message={error} />;
  if (!rows.length) return <EmptyState label="Job History" />;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50">
          <tr>
            {['Emp No', 'Job Code', 'Dept Code', 'Eff Date', 'Salary', 'Stamp', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                {h}
              </th>
            {['Emp No','Job Title','Department','Eff Date','Salary','Stamp','Actions'].map(h => (
              <Th key={h}>{h}</Th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map((item, idx) => {
            const compositeKey = `${item.empno}-${item.jobcode}-${item.effdate}`;
            return (
              <tr key={compositeKey + idx} className="hover:bg-slate-50 transition opacity-75">
                <td className="px-4 py-3 text-sm font-medium text-slate-700">{item.empno}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{item.jobcode}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{item.deptcode}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{item.effdate}</td>
                <td className="px-4 py-3 text-sm text-slate-600">
                  {item.salary ? `$${Number(item.salary).toLocaleString()}` : '-'}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 max-w-[180px] truncate" title={item.stamp}>
                  {item.stamp || '-'}
                </td>
                <td className="px-4 py-3">
                  <RecoverButton 
                    onClick={() => handleRecover(item)} 
                    loading={recoveringKey === compositeKey} 
                  />
                </td>
              </tr>
            );
          })}
          {rows.map(item => (
            <tr key={rowKey(item)} className="hover:bg-slate-50 transition opacity-75">
              <td className="px-4 py-3 text-sm font-medium text-slate-700">{item.empno}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{item.job?.jobdesc || item.jobcode}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{item.dept?.deptname || item.deptcode}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{item.effdate}</td>
              <td className="px-4 py-3 text-sm text-slate-600">
                {item.salary ? `$${Number(item.salary).toLocaleString()}` : '-'}
              </td>
              <td className="px-4 py-3 text-xs text-slate-400 max-w-[180px] truncate" title={item.stamp}>
                {item.stamp || '-'}
              </td>
              <td className="px-4 py-3">
                <RecoverButton onClick={() => handleRecover(item)} loading={recoveringKey === rowKey(item)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeletedJobs({ userEmail }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recoveringCode, setRecoveringCode] = useState(null);

  const fetch = useCallback(async () => {
// ─── Tab: Deleted Jobs ────────────────────────────────────────────────────────
function DeletedJobs({ userEmail }) {
  const [rows, setRows]              = useState([]);
  const [loading, setLoading]        = useState(true);
  const [error, setError]            = useState(null);
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

  useEffect(() => { fetch(); }, [fetch]);

  const handleRecover = async (job) => {
    if (!window.confirm(`Recover job "${job.jobDesc}"?`)) return;
    setRecoveringCode(job.jobCode);
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
      await fetch();
    } catch (err) {
      alert('Failed to recover: ' + err.message);
    } finally {
      setRecoveringCode(null);
      await load();
    } catch (err) {
      alert('Failed to recover: ' + err.message);
    } finally {
      setRecCode(null);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (rows.length === 0) return <EmptyState label="Jobs" />;
  if (error)   return <ErrorState message={error} />;
  if (!rows.length) return <EmptyState label="Jobs" />;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50">
          <tr>
            {['Job Code', 'Job Description', 'Stamp', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {h}
              </th>
            {['Job Code','Job Description','Stamp','Actions'].map(h => (
              <Th key={h}>{h}</Th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map(job => (
            <tr key={job.jobCode} className="hover:bg-slate-50 transition opacity-75">
              <td className="px-4 py-3 text-sm font-medium text-slate-700">{job.jobCode}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{job.jobDesc}</td>
              <td className="px-4 py-3 text-xs text-slate-400 max-w-[200px] truncate" title={job.stamp}>
                {job.stamp || '-'}
              </td>
              <td className="px-4 py-3">
                <RecoverButton onClick={() => handleRecover(job)} loading={recoveringCode === job.jobCode} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DeletedDepartments({ userEmail }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recoveringCode, setRecoveringCode] = useState(null);

  const fetch = useCallback(async () => {
// ─── Tab: Deleted Departments ─────────────────────────────────────────────────
function DeletedDepartments({ userEmail }) {
  const [rows, setRows]              = useState([]);
  const [loading, setLoading]        = useState(true);
  const [error, setError]            = useState(null);
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

  useEffect(() => { fetch(); }, [fetch]);

  const handleRecover = async (dept) => {
    if (!window.confirm(`Recover department "${dept.deptName}"?`)) return;
    setRecoveringCode(dept.deptCode);
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
      await fetch();
    } catch (err) {
      alert('Failed to recover: ' + err.message);
    } finally {
      setRecoveringCode(null);
      await load();
    } catch (err) {
      alert('Failed to recover: ' + err.message);
    } finally {
      setRecCode(null);
    }
  };

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (rows.length === 0) return <EmptyState label="Departments" />;
  if (error)   return <ErrorState message={error} />;
  if (!rows.length) return <EmptyState label="Departments" />;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-100">
        <thead className="bg-slate-50">
          <tr>
            {['Dept Code', 'Department Name', 'Stamp', 'Actions'].map(h => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                {h}
              </th>
            {['Dept Code','Department Name','Stamp','Actions'].map(h => (
              <Th key={h}>{h}</Th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {rows.map(dept => (
            <tr key={dept.deptCode} className="hover:bg-slate-50 transition opacity-75">
              <td className="px-4 py-3 text-sm font-medium text-slate-700">{dept.deptCode}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{dept.deptName}</td>
              <td className="px-4 py-3 text-xs text-slate-400 max-w-[200px] truncate" title={dept.stamp}>
                {dept.stamp || '-'}
              </td>
              <td className="px-4 py-3">
                <RecoverButton onClick={() => handleRecover(dept)} loading={recoveringCode === dept.deptCode} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DeletedItems() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('employees');

  const userType = user?.user_type || 'USER';
  const isAdminPlus = userType === 'ADMIN' || userType === 'SUPERADMIN';
// ─── Page root ────────────────────────────────────────────────────────────────
export default function DeletedItems() {
  const { user }        = useAuth();
  const [activeTab, setActiveTab] = useState('employees');

  const userType    = user?.user_type || 'USER';
  const isAdminPlus = userType === 'ADMIN' || userType === 'SUPERADMIN';
  const userEmail   = user?.email;

  if (!isAdminPlus) {
    return (
      <div className="p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <svg className="w-8 h-8 text-amber-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm font-medium text-amber-700">Access Restricted</p>
          <p className="text-xs text-amber-600 mt-1">Only admins can view deleted items.</p>
        </div>
      </div>
    );
  }

  const userEmail = user?.email;

  const tabContent = {
    employees:   <DeletedEmployees   userEmail={userEmail} />,
    jobhistory:  <DeletedJobHistory  userEmail={userEmail} />,
    jobs:        <DeletedJobs        userEmail={userEmail} />,
    departments: <DeletedDepartments userEmail={userEmail} />,
  };

  return (
    <div className="p-4 md:p-6">
  // Render all tab panels but only show the active one.
  // This keeps each panel's state alive while switching tabs.
  return (
    <div className="p-4 md:p-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Deleted Items</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          View and recover deactivated records across all modules
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition -mb-px border-b-2 ${
              activeTab === tab.id
                ? 'text-slate-800 border-slate-700 bg-white'
                : 'text-slate-500 border-transparent hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-t-0 border-slate-200 overflow-hidden">
        {tabContent[activeTab]}
      {/* Tab panels — rendered once, shown/hidden via CSS to preserve state */}
      <div className="bg-white rounded-b-xl rounded-tr-xl shadow-sm border border-t-0 border-slate-200 overflow-hidden">
        <div className={activeTab === 'employees'   ? '' : 'hidden'}>
          <DeletedEmployees   userEmail={userEmail} />
        </div>
        <div className={activeTab === 'jobhistory'  ? '' : 'hidden'}>
          <DeletedJobHistory  userEmail={userEmail} />
        </div>
        <div className={activeTab === 'jobs'        ? '' : 'hidden'}>
          <DeletedJobs        userEmail={userEmail} />
        </div>
        <div className={activeTab === 'departments' ? '' : 'hidden'}>
          <DeletedDepartments userEmail={userEmail} />
        </div>
      </div>
    </div>
  );
}