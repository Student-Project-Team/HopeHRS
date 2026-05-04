import { useState, useEffect } from 'react';

export default function AddJobModal({ isOpen, onClose, onSave, editingJob }) {
  const [jobCode, setJobCode] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingJob) {
        setJobCode(editingJob.jobcode || editingJob.jobCode || '');
        setJobDesc(editingJob.jobdesc || editingJob.jobDesc || '');
      } else {
        setJobCode('');
        setJobDesc('');
      }
    }
  }, [isOpen, editingJob]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave({ jobCode, jobDesc });
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold text-slate-800 tracking-tight">
              {editingJob ? 'Edit Job' : 'Add Job'}
            </h2>
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

          {/* Job Code */}
          <div>
            <label className={labelClass}>
              Job Code <span className="text-red-400 normal-case tracking-normal">*</span>
            </label>
            <input
              type="text"
              value={jobCode}
              onChange={(e) => setJobCode(e.target.value.toUpperCase())}
              className={editingJob
                ? 'w-full border border-slate-100 rounded-lg px-3.5 py-2.5 text-xs text-slate-400 bg-slate-50 cursor-not-allowed'
                : inputClass}
              placeholder="e.g. MGR"
              required
              disabled={!!editingJob}
              maxLength={4}
            />
            {editingJob && (
              <p className="text-[10px] text-slate-400 mt-1">Job code cannot be changed when editing</p>
            )}
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
                  Save
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}