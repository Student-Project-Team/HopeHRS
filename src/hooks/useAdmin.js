import { useState, useCallback } from 'react';
import { getUsers, activateUser, deactivateUser, changeUserType } from '../services/adminService';
import { useAuth } from './useAuth';

export function useAdmin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUsers();
      setUsers(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleActivateUser = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);
      const result = await activateUser(email, user?.email);
      await fetchUsers(); // Refresh the list
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.email, fetchUsers]);

  const handleDeactivateUser = useCallback(async (email) => {
    try {
      setLoading(true);
      setError(null);
      const result = await deactivateUser(email, user?.email);
      await fetchUsers(); // Refresh the list
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.email, fetchUsers]);

  const handleChangeUserType = useCallback(async (email, newUserType) => {
    try {
      setLoading(true);
      setError(null);
      const result = await changeUserType(email, newUserType, user?.email);
      await fetchUsers(); // Refresh the list
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.email, fetchUsers]);

  return {
    users,
    loading,
    error,
    fetchUsers,
    activateUser: handleActivateUser,
    deactivateUser: handleDeactivateUser,
    changeUserType: handleChangeUserType,
  };
}
