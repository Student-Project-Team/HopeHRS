// src/pages/Admin.jsx
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

const Admin = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const { currentUser, logout } = useAuth()

  const fetchUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_user_profiles')
    if (error) {
      console.error(error)
      setMessage('Error loading user profiles')
      setLoading(false)
      return
    }
    setUsers(data || [])
    setLoading(false)
  }

  const toggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    const { error } = await supabase
      .from('user_profiles')
      .update({ record_status: newStatus, updated_at: new Date() })
      .eq('id', userId)

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage(`✅ User status changed to ${newStatus}`)
      fetchUsers() // refresh list

      // If the logged-in admin deactivates their own account, force logout
      if (userId === currentUser?.id && newStatus === 'INACTIVE') {
        setMessage('⚠️ Your own account was deactivated. You will be logged out.')
        setTimeout(async () => {
          await logout()
          window.location.href = '/login'
        }, 2000)
      }
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) return <div className="p-4 text-center">Loading users...</div>

  return (
    <div className="p-4 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      {message && (
        <div className="mb-4 p-3 rounded bg-blue-100 text-blue-800 border border-blue-200">
          {message}
        </div>
      )}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.record_status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.record_status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => toggleStatus(user.id, user.record_status)}
                    className={`px-3 py-1 rounded-md text-white font-medium ${
                      user.record_status === 'ACTIVE'
                        ? 'bg-red-600 hover:bg-red-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } transition`}
                  >
                    {user.record_status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Admin