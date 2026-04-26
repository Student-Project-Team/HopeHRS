import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';
import { getAllDepartments, createDepartment, updateDepartment, softDeleteDepartment, recoverDepartment } from '../services/departmentService';
import AddDeptModal from '../components/AddDeptModal';

export default function DeptListPage() {
  const { user } = useAuth();
  const { canAddDepartment, canEditDepartment, canDeleteDepartment } = useRights();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDept, setEditingDept] = useState(null);

  const userType = user?.user_type || 'USER';

  useEffect(() => {
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

    fetchDepartments();
  }, [userType]);

  const handleSave = async (deptData) => {
    try {
      if (editingDept) {
        await updateDepartment(editingDept.deptCode, deptData, user?.email);
      } else {
        await createDepartment(deptData, user?.email);
      }
      setShowModal(false);
      setEditingDept(null);
      const data = await getAllDepartments(userType);
      setDepartments(data || []);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (deptCode) => {
    if (window.confirm('Soft delete this department?')) {
      await softDeleteDepartment(deptCode, user?.email);
      const data = await getAllDepartments(userType);
      setDepartments(data || []);
    }
  };

  const handleRecover = async (deptCode) => {
    await recoverDepartment(deptCode, user?.email);
    const data = await getAllDepartments(userType);
    setDepartments(data || []);
  };

  if (loading) return <div className="p-6 text-center">Loading departments...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Departments</h1>
        {canAddDepartment() && (
          <button onClick={() => { setEditingDept(null); setShowModal(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            + Add Department
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Dept Code</th>
              <th className="px-6 py-3 text-left">Department Name</th>
              <th className="px-6 py-3 text-left">Status</th>
              {(canEditDepartment() || canDeleteDepartment()) && <th className="px-6 py-3 text-left">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept.deptCode} className="border-t">
                <td className="px-6 py-4">{dept.deptCode}</td>
                <td className="px-6 py-4">{dept.deptName}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${dept.record_status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {dept.record_status}
                  </span>
                </td>
                {(canEditDepartment() || canDeleteDepartment()) && (
                  <td className="px-6 py-4">
                    {canEditDepartment() && dept.record_status === 'ACTIVE' && (
                      <button onClick={() => { setEditingDept(dept); setShowModal(true); }} className="text-blue-600 mr-2">Edit</button>
                    )}
                    {canDeleteDepartment() && dept.record_status === 'ACTIVE' && (
                      <button onClick={() => handleDelete(dept.deptCode)} className="text-red-600 mr-2">Delete</button>
                    )}
                    {canDeleteDepartment() && dept.record_status === 'INACTIVE' && (
                      <button onClick={() => handleRecover(dept.deptCode)} className="text-green-600">Recover</button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddDeptModal 
        isOpen={showModal} 
        onClose={() => { setShowModal(false); setEditingDept(null); }} 
        onSave={handleSave} 
        editingDept={editingDept} 
      />
    </div>
  );
}
