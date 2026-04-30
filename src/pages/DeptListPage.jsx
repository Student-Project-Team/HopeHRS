import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';
import { getAllDepartments, createDepartment, updateDepartment, softDeleteDepartment, recoverDepartment } from '../services/departmentService';
import AddDeptModal from '../components/AddDeptModal';
import EditDeptModal from '../components/EditDeptModal';
import SoftDeleteConfirmDialog from '../components/SoftDeleteConfirmDialog';

export default function DeptListPage() {
  const { user } = useAuth();
  const { canAddDepartment, canEditDepartment, canDeleteDepartment } = useRights();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ACTIVE');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  const userType = user?.user_type || 'USER';
  const isAdminPlus = userType === 'ADMIN' || userType === 'SUPERADMIN';
  const isSuperAdmin = userType === 'SUPERADMIN';

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

  const filteredDepartments = departments.filter((dept) => {
    if (statusFilter === 'ALL') return true;
    return dept.record_status === statusFilter;
  });

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

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await softDeleteDepartment(deleteTarget.deptCode, user?.email);
      setDeleteTarget(null);
      await fetchDepartments();
    } catch (err) {
      alert('Failed to delete department: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRecover = async (deptCode) => {
    if (!window.confirm('Recover this department?')) return;
    setActionLoading(deptCode);
    try {
      await recoverDepartment(deptCode, user?.email);
      await fetchDepartments();
    } catch (err) {
      alert('Failed to recover department: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center gap-2 text-slate-500 py-8">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600" />
      Loading departments...
    </div>
  );

  if (error) return (
    <div className="p-4 text-red-600 bg-red-50 rounded-lg border border-red-200">
      Error: {error}
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Departments</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage organizational departments</p>
        </div>
        {/* Add Department button - DEPT_ADD (ADMIN, SUPERADMIN) */}
        {canAddDepartment() && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Add Department
          </button>
        )}
      </div>

      {/* Status Filter - ADMIN+ only */}
      {isAdminPlus && (
        <div className="flex flex-wrap gap-2 mb-4">
          {['ACTIVE', 'INACTIVE', 'ALL'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 text-sm rounded-md transition ${
                statusFilter === f
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 'ALL' ? 'All Departments' : f === 'ACTIVE' ? 'Active Only' : 'Inactive Only'}
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Dept Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Department Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                {isAdminPlus && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Stamp</th>
                )}
                {isAdminPlus && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No departments found
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => (
                  <tr key={dept.deptCode} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{dept.deptCode}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{dept.deptName}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-md ${
                        dept.record_status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {dept.record_status}
                      </span>
                    </td>
                    {isAdminPlus && (
                      <td className="px-6 py-4 text-xs text-slate-500 truncate max-w-[200px]" title={dept.stamp}>
                        {dept.stamp || '-'}
                      </td>
                    )}
                    {/* Actions column - ADMIN+ only */}
                    {isAdminPlus && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {/* Edit Department button - DEPT_EDIT (ADMIN, SUPERADMIN) - only on ACTIVE records */}
                        {canEditDepartment() && dept.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => { setEditingDept(dept); setShowEditModal(true); }}
                            className="text-slate-600 hover:text-slate-800 mr-3 text-sm font-medium transition"
                          >
                            Edit
                          </button>
                        )}

                        {/* Delete Department button - DEPT_DEL (SUPERADMIN only) - only on ACTIVE records */}
                        {canDeleteDepartment() && isSuperAdmin && dept.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => setDeleteTarget(dept)}
                            className="text-red-600 hover:text-red-700 text-sm font-medium transition"
                          >
                            Delete
                          </button>
                        )}

                        {/* Recover Department button - ADMIN+ - only on INACTIVE records */}
                        {dept.record_status === 'INACTIVE' && (
                          <button
                            onClick={() => handleRecover(dept.deptCode)}
                            disabled={actionLoading === dept.deptCode}
                            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition disabled:opacity-50"
                          >
                            {actionLoading === dept.deptCode ? '...' : 'Recover'}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddDeptModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={handleAdd}
        editingDept={null}
      />

      <EditDeptModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingDept(null); }}
        onSave={handleEdit}
        dept={editingDept}
      />

      <SoftDeleteConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        item={deleteTarget}
        itemType="department"
        loading={deleteLoading}
      />
    </div>
  );
}