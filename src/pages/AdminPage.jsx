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

  // Check if current user has admin rights
  if (!canManageUsers()) {
    return (
      <div className="p-6">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <svg className="w-8 h-8 text-amber-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm font-medium text-amber-700">Access Restricted</p>
          <p className="text-xs text-amber-600 mt-1">You don't have permission to manage users.</p>
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
      <div className="flex items-center justify-center gap-2 p-8">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-600" />
        Loading users...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">User Management</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage user accounts and permissions
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  User Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Stamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => {
                const isSuperAdminRow = isSuperAdmin(user.user_type);
                const isProtected = isSuperAdminRow;

                return (
                  <tr 
                    key={user.email} 
                    className={`hover:bg-slate-50 transition ${
                      isProtected ? 'bg-slate-50 opacity-75' : ''
                    }`}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-md ${
                        user.user_type === 'SUPERADMIN' 
                          ? 'bg-purple-100 text-purple-700'
                          : user.user_type === 'ADMIN'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.user_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs rounded-md ${
                        user.record_status === 'ACTIVE'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.record_status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 max-w-[200px] truncate" title={user.stamp}>
                      {user.stamp || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {isProtected ? (
                        <span 
                          className="text-slate-400 text-sm font-medium cursor-not-allowed"
                          title="SUPERADMIN accounts cannot be modified"
                        >
                          Protected
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          {user.record_status === 'INACTIVE' ? (
                            <button
                              onClick={() => handleActivate(user.email)}
                              disabled={actionLoading === user.email}
                              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition disabled:opacity-50"
                            >
                              {actionLoading === user.email ? '...' : 'Activate'}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleDeactivate(user.email)}
                              disabled={actionLoading === user.email}
                              className="text-red-600 hover:text-red-700 text-sm font-medium transition disabled:opacity-50"
                            >
                              {actionLoading === user.email ? '...' : 'Deactivate'}
                            </button>
                          )}
                          
                          {isCurrentUserSuperAdmin && (
                            <button
                              onClick={() => openTypeModal(user)}
                              disabled={actionLoading === user.email}
                              className="text-slate-600 hover:text-slate-700 text-sm font-medium transition disabled:opacity-50"
                              title="Change user type (ADMIN/USER)"
                            >
                              Change Type
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Change User Type Modal */}
      {showTypeModal && selectedUser && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowTypeModal(false)}
        >
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                Change User Type
              </h2>
              <button
                onClick={() => setShowTypeModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  User
                </label>
                <p className="text-sm text-slate-800">{selectedUser.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Current User Type
                </label>
                <p className="text-sm text-slate-800">{selectedUser.user_type}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  New User Type
                </label>
                <select
                  value={newUserType}
                  onChange={(e) => setNewUserType(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <option value="ADMIN">ADMIN</option>
                  <option value="USER">USER</option>
                </select>
                <p className="text-xs text-slate-400 mt-1">
                  Cannot change to SUPERADMIN. Only SUPERADMIN can change user types.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTypeModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleChangeUserType}
                  disabled={actionLoading === selectedUser.email}
                  className="px-4 py-2 text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 rounded-lg disabled:opacity-60 flex items-center gap-2 transition"
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
