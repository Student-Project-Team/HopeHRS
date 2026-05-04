import { useState, useEffect } from 'react';

export default function EditJobModal({ isOpen, onClose, onSave, job }) {
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && job) {
      // Handle both camelCase and lowercase property names
      setJobDesc(job.jobDesc || job.jobdesc || '');
      setJobDesc(job.jobdesc || job.jobDesc || '');
    }
  }, [isOpen, job]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobDesc.trim()) {
      alert('Job description is required');
      return;
    }
    setLoading(true);
    try {
      // Pass the job code and updated description
      await onSave({ jobDesc: jobDesc.trim() });
      onClose();
    } catch (err) {
      alert(err.message || 'Failed to update job');
    setLoading(true);
    try {
      await onSave({ jobDesc });
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-900 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">Edit Job</h2>
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

          {/* Job Code (disabled) */}
          <div>
            <label className={labelClass}>Job Code</label>
            <input
              type="text"
              value={job?.jobCode || job?.jobcode || ''}
              disabled
              className="w-full border border-slate-100 rounded-lg px-3.5 py-2.5 text-xs text-slate-400 bg-slate-50 cursor-not-allowed"
            />
            <p className="text-[10px] text-slate-400 mt-1">Job code cannot be changed</p>
          </div>

          {/* Job Description */}
          <div>
            <label className={labelClass}>
              Job Description <span className="text-red-400 normal-case tracking-normal">*</span>
            </label>
            <input
              type="text"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className={inputClass}
              placeholder="e.g. Manager"
              required
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