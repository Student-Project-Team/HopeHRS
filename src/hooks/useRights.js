// hooks/useRights.js
import { useContext, useMemo } from 'react';
import { UserRightsContext } from '../context/UserRightsContext';
import { useAuth } from './useAuth';

export function useRights() {
  const { hasRight, rights } = useContext(UserRightsContext);
  const { user } = useAuth();
  
  const userType = user?.user_type || 'USER';
  const isAdmin = userType === 'ADMIN';
  const isSuperAdmin = userType === 'SUPERADMIN';
  const isAdminOrSuperAdmin = isAdmin || isSuperAdmin;
  
  const returnValue = useMemo(() => ({
    rights,
    isAdmin,
    isSuperAdmin,
    isAdminOrSuperAdmin,
    
    // Employee rights
    canViewEmployees: () => isAdminOrSuperAdmin || hasRight('EMP_VIEW'),
    canAddEmployee: () => isAdminOrSuperAdmin || hasRight('EMP_ADD'),
    canEditEmployee: () => isAdminOrSuperAdmin || hasRight('EMP_EDIT'),
    canDeleteEmployee: () => isSuperAdmin || hasRight('EMP_DEL'), // ONLY SUPERADMIN
    
    // Job History rights
    canViewJobHistory: () => isAdminOrSuperAdmin || hasRight('JH_VIEW'),
    canAddJobHistory: () => isAdminOrSuperAdmin || hasRight('JH_ADD'),
    canEditJobHistory: () => isAdminOrSuperAdmin || hasRight('JH_EDIT'),
    canDeleteJobHistory: () => isSuperAdmin || hasRight('JH_DEL'), // ONLY SUPERADMIN
    
    // Job rights
    canViewJobs: () => isAdminOrSuperAdmin || hasRight('JOB_VIEW'),
    canAddJob: () => isAdminOrSuperAdmin || hasRight('JOB_ADD'),
    canEditJob: () => isAdminOrSuperAdmin || hasRight('JOB_EDIT'),
    canDeleteJob: () => isSuperAdmin || hasRight('JOB_DEL'), // ONLY SUPERADMIN
    
    // Department rights
    canViewDepartments: () => isAdminOrSuperAdmin || hasRight('DEPT_VIEW'),
    canAddDepartment: () => isAdminOrSuperAdmin || hasRight('DEPT_ADD'),
    canEditDepartment: () => isAdminOrSuperAdmin || hasRight('DEPT_EDIT'),
    canDeleteDepartment: () => isSuperAdmin || hasRight('DEPT_DEL'), // ONLY SUPERADMIN
    
    // Admin rights
    canManageUsers: () => isAdminOrSuperAdmin || hasRight('ADM_USER')
  }), [hasRight, rights, isAdmin, isSuperAdmin, isAdminOrSuperAdmin]);

  return returnValue;
}
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

  // ADD THIS - Admin Module rights
  const canManageUsers = () => {
    return userType === 'SUPERADMIN';  // Only SUPERADMIN can manage users
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
    canManageUsers,  // ← ADD THIS
  };
}
