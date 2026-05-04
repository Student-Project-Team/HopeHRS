import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';
import { getAllDepartments, createDepartment, updateDepartment } from '../services/departmentService';
import AddDeptModal from '../components/AddDeptModal';
import EditDeptModal from '../components/EditDeptModal';

export default function Departments() {
  const { user } = useAuth();
  const { canAddDepartment, canEditDepartment } = useRights();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const userType = user?.user_type || 'USER';

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await getAllDepartments(userType);
      setDepartments(data || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, [userType]);

  const handleAdd = async (deptData) => {
    await createDepartment(deptData, user?.email);
    setShowAddModal(false);
    await fetchDepartments();
  };

  const handleEdit = async (deptData) => {
    await updateDepartment(editingDept.deptCode, deptData, user?.email);
    setShowEditModal(false);
    setEditingDept(null);
    await fetchDepartments();
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

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Departments</h1>
          <p className="mt-0.5 text-xs text-slate-400">
            {departments.length} {departments.length === 1 ? 'department' : 'departments'} shown
          </p>
        </div>
        {canAddDepartment() && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-950 text-white px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-colors shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            Add Department
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden w-full">
        {departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-500">No departments found</p>
          </div>
        ) : (
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['Dept Code', 'Department Name', ...(canEditDepartment() ? ['Actions'] : [])].map((col) => (
                  <th key={col} className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {departments.map((dept) => (
                <tr key={dept.deptCode} className="hover:bg-slate-50 transition-colors duration-100">
                  <td className="px-3 py-3">
                    <span className="text-[11px] font-bold font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                      {dept.deptCode}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs font-semibold text-slate-700 truncate">{dept.deptName}</td>
                  {canEditDepartment() && (
                    <td className="px-3 py-3">
                      {dept.record_status === 'ACTIVE' && (
                        <button
                          onClick={() => { setEditingDept(dept); setShowEditModal(true); }}
                          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddDeptModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSave={handleAdd} />
      <EditDeptModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingDept(null); }}
        onSave={handleEdit}
        dept={editingDept}
      />
    </div>
  );
}