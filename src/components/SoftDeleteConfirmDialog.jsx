export default function SoftDeleteConfirmDialog({ isOpen, onClose, onConfirm, employee, loading }) {
  if (!isOpen || !employee) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
        <div className="px-6 py-5">
          {/* Icon */}
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>

          <h3 className="text-center text-lg font-semibold text-slate-800 mb-1">
            Deactivate Employee?
          </h3>
          <p className="text-center text-sm text-slate-500 mb-1">
            You are about to deactivate:
          </p>
          <p className="text-center text-sm font-medium text-slate-700 mb-4">
            {employee.firstname} {employee.lastname} ({employee.empno})
          </p>
          <p className="text-center text-xs text-slate-400 mb-6">
            This sets the employee to INACTIVE. This action can be reversed by an ADMIN.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg disabled:opacity-60 flex items-center justify-center gap-2 transition"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Deactivating...
                </>
              ) : (
                'Deactivate'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}