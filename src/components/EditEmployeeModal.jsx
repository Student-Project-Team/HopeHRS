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

  const inputClass =
    'w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-blue-900 transition bg-white placeholder:text-slate-300';

  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide';

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-slate-100">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Edit Employee</h2>
              {employee && (
                <p className="text-[10px] text-slate-400 mt-0.5">Emp No: {employee.empno}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                Last Name <span className="text-red-400 normal-case tracking-normal">*</span>
              </label>
              <input
                type="text"
                name="lastname"
                value={form.lastname}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                First Name <span className="text-red-400 normal-case tracking-normal">*</span>
              </label>
              <input
                type="text"
                name="firstname"
                value={form.firstname}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Gender */}
          <div>
            <label className={labelClass}>
              Gender <span className="text-red-400 normal-case tracking-normal">*</span>
            </label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
              className={inputClass}
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
            </select>
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>
                Birth Date <span className="text-red-400 normal-case tracking-normal">*</span>
              </label>
              <input
                type="date"
                name="birthdate"
                value={form.birthdate}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                Hire Date <span className="text-red-400 normal-case tracking-normal">*</span>
              </label>
              <input
                type="date"
                name="hiredate"
                value={form.hiredate}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
          </div>

          {/* Sep Date */}
          <div>
            <label className={labelClass}>
              Separation Date{' '}
              <span className="text-slate-400 font-normal normal-case tracking-normal">(optional)</span>
            </label>
            <input
              type="date"
              name="sepdate"
              value={form.sepdate}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {/* Footer */}
          <div className="border-t border-slate-100 pt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-950 rounded-lg disabled:opacity-60 flex items-center gap-2 transition shadow-sm"
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}