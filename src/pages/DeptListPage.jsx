import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';
import { getAllDepartments, createDepartment, updateDepartment } from '../services/departmentService';
import AddDeptModal from '../components/AddDeptModal';
import EditDeptModal from '../components/EditDeptModal';

export default function DeptListPage() {
  const { user } = useAuth();
  const { canAddDepartment, canEditDepartment } = useRights();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const userType = user?.user_type || 'USER';
  const isAdminPlus = userType === 'ADMIN' || userType === 'SUPERADMIN';

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
        {canAddDepartment() && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Add Department
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Dept Code</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Department Name</th>
                {isAdminPlus && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Stamp</th>
                )}
                {canEditDepartment() && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {departments.length === 0 ? (
                <tr>
                  <td colSpan={isAdminPlus ? 4 : 3} className="px-6 py-12 text-center text-slate-400 text-sm">
                    No departments found
                  </td>
                </tr>
              ) : (
                departments.map((dept) => (
                  <tr key={dept.deptCode} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">{dept.deptCode}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{dept.deptName}</td>
                    {isAdminPlus && (
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate" title={dept.stamp}>
                        {dept.stamp || '-'}
                      </td>
                    )}
                    {canEditDepartment() && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {canEditDepartment() && dept.record_status === 'ACTIVE' && (
                          <button
                            onClick={() => { setEditingDept(dept); setShowEditModal(true); }}
                            className="text-slate-600 hover:text-slate-800 text-sm font-medium transition"
                          >
                            Edit
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
      />

      <EditDeptModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingDept(null); }}
        onSave={handleEdit}
        dept={editingDept}
      />
    </div>
  );
}