import { useState, useEffect } from 'react';

export default function AddDeptModal({ isOpen, onClose, onSave, editingDept }) {
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingDept) {
        setDeptCode(editingDept.deptcode || editingDept.deptCode || '');
        setDeptName(editingDept.deptname || editingDept.deptName || '');
      } else {
        setDeptCode('');
        setDeptName('');
      }
    }
  }, [isOpen, editingDept]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ deptCode, deptName });
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">{editingDept ? 'Edit Department' : 'Add Department'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Department Code</label>
            <input
              type="text"
              value={deptCode}
              onChange={(e) => setDeptCode(e.target.value.toUpperCase())}
              className="w-full border rounded-lg px-3 py-2"
              required
              disabled={!!editingDept}
              maxLength={3}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Department Name</label>
            <input
              type="text"
              value={deptName}
              onChange={(e) => setDeptName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
