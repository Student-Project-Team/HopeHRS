import { useUserRights } from '../context/UserRightsContext';

export function useRights() {
  const { rights, userType } = useUserRights();

  // Job rights - Based on user type from database
  const canAddJob = () => {
    return userType === 'ADMIN' || userType === 'SUPERADMIN';
  };

  const canEditJob = () => {
    return userType === 'ADMIN' || userType === 'SUPERADMIN';
  };

  const canDeleteJob = () => {
    return userType === 'SUPERADMIN';
  };

  // Department rights - Based on user type from database
  const canAddDepartment = () => {
    return userType === 'ADMIN' || userType === 'SUPERADMIN';
  };

  const canEditDepartment = () => {
    return userType === 'ADMIN' || userType === 'SUPERADMIN';
  };

  const canDeleteDepartment = () => {
    return userType === 'SUPERADMIN';
  };

  // Employee rights - Based on rights from user_rights table
  const canAddEmployee = () => {
    return rights?.EMP_ADD === true;
  };

  const canEditEmployee = () => {
    return rights?.EMP_EDIT === true;
  };

  const canDeleteEmployee = () => {
    return rights?.EMP_DEL === true;
  };

  // Job History rights - Based on rights from user_rights table
  const canViewJobHistory = () => {
    return true; // Everyone can view job history
  };

  const canAddJobHistory = () => {
    return rights?.JH_ADD === true;
  };

  const canEditJobHistory = () => {
    return rights?.JH_EDIT === true;
  };

  const canDeleteJobHistory = () => {
    return rights?.JH_DEL === true;
  };

  // FIXED: Admin Module rights - ADMIN and SUPERADMIN can manage users
  const canManageUsers = () => {
    return userType === 'ADMIN' || userType === 'SUPERADMIN';  // ← CHANGED THIS LINE
  };

  return {
    // Job rights
    canAddJob,
    canEditJob,
    canDeleteJob,
    // Department rights
    canAddDepartment,
    canEditDepartment,
    canDeleteDepartment,
    // Employee rights
    canAddEmployee,
    canEditEmployee,
    canDeleteEmployee,
    // Job History rights
    canViewJobHistory,
    canAddJobHistory,
    canEditJobHistory,
    canDeleteJobHistory,
    // Admin rights
    canManageUsers,
  };
}