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
