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
    isAdminOrSuperAdmin,
    isSuperAdmin,
    
    // Employee rights
    canViewEmployees: () => isAdminOrSuperAdmin || hasRight('EMP_VIEW'),
    canAddEmployee: () => isAdminOrSuperAdmin || hasRight('EMP_ADD'),
    canEditEmployee: () => isAdminOrSuperAdmin || hasRight('EMP_EDIT'),
    canDeleteEmployee: () => isAdminOrSuperAdmin || hasRight('EMP_DEL'),
    
    // Job History rights
    canViewJobHistory: () => isAdminOrSuperAdmin || hasRight('JH_VIEW'),
    canAddJobHistory: () => isAdminOrSuperAdmin || hasRight('JH_ADD'),
    canEditJobHistory: () => isAdminOrSuperAdmin || hasRight('JH_EDIT'),
    canDeleteJobHistory: () => isAdminOrSuperAdmin || hasRight('JH_DEL'),
    
    // Job rights
    canViewJobs: () => isAdminOrSuperAdmin || hasRight('JOB_VIEW'),
    canAddJob: () => isAdminOrSuperAdmin || hasRight('JOB_ADD'),
    canEditJob: () => isAdminOrSuperAdmin || hasRight('JOB_EDIT'),
    canDeleteJob: () => isAdminOrSuperAdmin || hasRight('JOB_DEL'),
    
    // Department rights
    canViewDepartments: () => isAdminOrSuperAdmin || hasRight('DEPT_VIEW'),
    canAddDepartment: () => isAdminOrSuperAdmin || hasRight('DEPT_ADD'),
    canEditDepartment: () => isAdminOrSuperAdmin || hasRight('DEPT_EDIT'),
    canDeleteDepartment: () => isAdminOrSuperAdmin || hasRight('DEPT_DEL'),
    
    // Admin rights
    canManageUsers: () => isAdminOrSuperAdmin || hasRight('ADM_USER')
  }), [hasRight, rights, isAdminOrSuperAdmin]);

  return returnValue;
}