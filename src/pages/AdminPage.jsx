import { useEffect, useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { useAuth } from '../hooks/useAuth';
import { useRights } from '../hooks/useRights';

export default function Admin() {
  const { users, loading, fetchUsers, activateUser, deactivateUser, changeUserType } = useAdmin();
  const { user: currentUser } = useAuth();
  const { canManageUsers } = useRights();
  const [actionLoading, setActionLoading] = useState(null);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUserType, setNewUserType] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  if (!canManageUsers()) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 w-full max-w-sm text-center shadow-sm">
          <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Access Restricted</p>
          <p className="text-sm font-medium text-slate-700">You don't have permission to manage users.</p>
        </div>
      </div>
    );
  }

  const handleActivate = async (email) => {
    if (!window.confirm(`Activate user ${email}?`)) return;
    setActionLoading(email);
    try {
      await activateUser(email);
      alert('User activated successfully!');
    } catch (err) {
      alert('Failed to activate user: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (email) => {
    if (!window.confirm(`Deactivate user ${email}?`)) return;
    setActionLoading(email);
    try {
      await deactivateUser(email);
      alert('User deactivated successfully!');
    } catch (err) {
      alert('Failed to deactivate user: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleChangeUserType = async () => {
    if (!selectedUser) return;
    setActionLoading(selectedUser.email);
    try {
      await changeUserType(selectedUser.email, newUserType);
      alert(`User type changed to ${newUserType} successfully!`);
      setShowTypeModal(false);
      setSelectedUser(null);
      setNewUserType('');
    } catch (err) {
      alert('Failed to change user type: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const openTypeModal = (user) => {
    setSelectedUser(user);
    setNewUserType(user.user_type === 'ADMIN' ? 'USER' : 'ADMIN');
    setShowTypeModal(true);
  };

  const isSuperAdmin = (userType) => userType === 'SUPERADMIN';
  const isCurrentUserSuperAdmin = currentUser?.user_type === 'SUPERADMIN';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-[3px] border-slate-200 border-t-blue-900 rounded-full animate-spin" />
          <p className="text-[11px] font-medium text-slate-400 tracking-widest uppercase">Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">User Management</h1>
          <p className="mt-0.5 text-[11px] sm:text-xs text-slate-400">Manage user accounts and permissions</p>
        </div>
      </div>

      {/* Table - Mobile friendly with horizontal scroll */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto w-full">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="pl-6 pr-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Email
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                User Type
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Status
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Stamp
              </th>
              <th className="px-3 py-2.5 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                      <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-slate-500">No users found</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isSuperAdminRow = isSuperAdmin(user.user_type);
                const isProtected = isSuperAdminRow;

                return (
                  <tr
                    key={user.email}
                    className={`transition-colors duration-100 ${
                      isProtected ? 'bg-slate-50/70 opacity-60' : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Email - with break-all for mobile and left padding */}
                    <td className="pl-6 pr-3 py-3">
                      <span className="text-xs font-semibold text-slate-700 break-all block max-w-[200px] sm:max-w-none">
                        {user.email}
                      </span>
                    </td>
                    
                    {/* User Type */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        user.user_type === 'SUPERADMIN'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : user.user_type === 'ADMIN'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}>
                        {user.user_type}
                      </span>
                    </td>
                    
                    {/* Status */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                        user.record_status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}>
                        {user.record_status === 'ACTIVE' && (
                          <span className="w-1 h-1 rounded-full bg-green-500 shrink-0" />
                        )}
                        {user.record_status || 'ACTIVE'}
                      </span>
                    </td>
                    
                    {/* Stamp */}
                    <td className="px-3 py-3">
                      <span 
                        className="text-[10px] text-slate-400 block max-w-[150px] truncate" 
                        title={user.stamp}
                      >
                        {user.stamp || '—'}
                      </span>
                    </td>
                    
                    {/* Actions - Mobile friendly flex wrap */}
                    <td className="px-3 py-3 whitespace-nowrap pr-8">
                      {isProtected ? (
                        <span className="text-[11px] font-semibold text-slate-400 cursor-not-allowed whitespace-nowrap" title="SUPERADMIN accounts cannot be modified">
                          Protected
                        </span>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          {user.record_status === 'INACTIVE' ? (
                            <button
                              onClick={() => handleActivate(user.email)}
                              disabled={actionLoading === user.email}
                              className="text-[11px] font-semibold text-green-600 hover:text-green-700 transition-colors disabled:opacity-40 whitespace-nowrap"
                            >
                              {actionLoading === user.email ? (
                                <span className="inline-flex items-center gap-1">
                                  <span className="w-3 h-3 border-2 border-green-300 border-t-green-600 rounded-full animate-spin" />
                                  ...
                                </span>
                              ) : (
                                'Activate'
                              )}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeactivate(user.email)}
                              disabled={actionLoading === user.email}
                              className="text-[11px] font-semibold text-red-400 hover:text-red-600 transition-colors disabled:opacity-40 whitespace-nowrap"
                            >
                              {actionLoading === user.email ? (
                                <span className="inline-flex items-center gap-1">
                                  <span className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                  ...
                                </span>
                              ) : (
                                'Deactivate'
                              )}
                            </button>
                          )}
                          {isCurrentUserSuperAdmin && (
                            <button
                              onClick={() => openTypeModal(user)}
                              disabled={actionLoading === user.email}
                              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors disabled:opacity-40 whitespace-nowrap"
                            >
                              Change Type
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Change User Type Modal - Mobile responsive */}
      {showTypeModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4"
          onClick={(e) => e.target === e.currentTarget && setShowTypeModal(false)}
        >
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-[95%] sm:max-w-md">
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-100">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">User Management</p>
                <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">Change User Type</h2>
              </div>
              <button
                onClick={() => setShowTypeModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-4 sm:px-5 py-4 sm:py-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">User</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-700 break-all">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Type</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">{selectedUser.user_type}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">New Type</p>
                <select
                  value={newUserType}
                  onChange={(e) => setNewUserType(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-900 transition"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="USER">USER</option>
                </select>
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Cannot change to SUPERADMIN. Only SUPERADMIN can change user types.
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowTypeModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleChangeUserType}
                  disabled={actionLoading === selectedUser.email}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-900 hover:bg-blue-950 rounded-lg disabled:opacity-60 flex items-center justify-center gap-2 transition"
                >
                  {actionLoading === selectedUser.email ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}