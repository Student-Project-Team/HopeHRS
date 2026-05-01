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

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">
            {editingJob ? 'Edit Job' : 'Add Job'}
          </h2>
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Job Code <span className="text-red-500">*</span>
            </label>
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">{editingJob ? 'Edit Job' : 'Add Job'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Job Code</label>
            <input
              type="text"
              value={jobCode}
              onChange={(e) => setJobCode(e.target.value.toUpperCase())}
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
              placeholder="e.g. MGR"
              className="w-full border rounded-lg px-3 py-2"
              required
              disabled={!!editingJob}
              maxLength={4}
            />
            {editingJob && (
              <p className="text-xs text-slate-400 mt-1">Job code cannot be changed when editing</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Job Description <span className="text-red-500">*</span>
            </label>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Job Description</label>
            <input
              type="text"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition"
              placeholder="e.g. Manager"
              required
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
                'Save'
              )}
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
}
