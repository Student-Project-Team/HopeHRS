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
              className="w-full border rounded-lg px-3 py-2"
              required
              disabled={!!editingJob}
              maxLength={4}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Job Description</label>
            <input
              type="text"
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
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
