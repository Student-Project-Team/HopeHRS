import { useState, useEffect } from 'react';

export default function EditEmployeeModal({ isOpen, onClose, onSave, employee }) {
  const [form, setForm] = useState({
    lastname: '',
    firstname: '',
    gender: 'M',
    birthdate: '',
    hiredate: '',
    sepdate: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && employee) {
      setForm({
        lastname: employee.lastname || '',
        firstname: employee.firstname || '',
        gender: employee.gender || 'M',
        birthdate: employee.birthdate || '',
        hiredate: employee.hiredate || '',
        sepdate: employee.sepdate || '',
      });
    }
  }, [isOpen, employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        lastname: form.lastname.trim(),
        firstname: form.firstname.trim(),
        gender: form.gender,
        birthdate: form.birthdate,
        hiredate: form.hiredate,
        sepdate: form.sepdate || null,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Edit Employee</h2>
            {employee && (
              <p className="text-xs text-slate-400 mt-0.5">Emp No: {employee.empno}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
                required
                className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition bg-white"
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>

          {/* Birthdate */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Birth Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="birthdate"
              value={form.birthdate}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
            />
          </div>

          {/* Hire Date */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Hire Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="hiredate"
              value={form.hiredate}
              onChange={handleChange}
              required
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
            />
          </div>

          {/* Sep Date (optional) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Separation Date <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              name="sepdate"
              value={form.sepdate}
              onChange={handleChange}
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 rounded-lg disabled:opacity-60 flex items-center gap-2 transition"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}