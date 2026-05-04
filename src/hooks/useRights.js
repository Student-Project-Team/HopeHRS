// hooks/useRights.js
import { useContext, useMemo } from 'react';
import { UserRightsContext } from '../context/UserRightsContext';
import { useAuth } from './useAuth';
import { useUserRights } from '../context/UserRightsContext';

export function useRights() {
  const { hasRight, rights: contextRights } = useContext(UserRightsContext);
  const { user } = useAuth();
  const { rights: userRights, userType: dbUserType } = useUserRights();
  
  const userType = user?.user_type || 'USER';
  const isAdmin = userType === 'ADMIN';
  const isSuperAdmin = userType === 'SUPERADMIN';
  const isAdminOrSuperAdmin = isAdmin || isSuperAdmin;
  
  // Use database user type for certain permissions
  const dbUserTypeValue = dbUserType || userType;
  
  const returnValue = useMemo(() => ({
    rights: contextRights,
    isAdmin,
    isSuperAdmin,
    isAdminOrSuperAdmin,
    
    // Employee rights (from context rights)
    canViewEmployees: () => isAdminOrSuperAdmin || hasRight('EMP_VIEW'),
    canAddEmployee: () => (isAdminOrSuperAdmin || hasRight('EMP_ADD')) && (userRights?.EMP_ADD === true),
    canEditEmployee: () => (isAdminOrSuperAdmin || hasRight('EMP_EDIT')) && (userRights?.EMP_EDIT === true),
    canDeleteEmployee: () => (isSuperAdmin || hasRight('EMP_DEL')) && (userRights?.EMP_DEL === true),
    
    // Job History rights
    canViewJobHistory: () => true,
    canAddJobHistory: () => (isAdminOrSuperAdmin || hasRight('JH_ADD')) && (userRights?.JH_ADD === true),
    canEditJobHistory: () => (isAdminOrSuperAdmin || hasRight('JH_EDIT')) && (userRights?.JH_EDIT === true),
    canDeleteJobHistory: () => (isSuperAdmin || hasRight('JH_DEL')) && (userRights?.JH_DEL === true),
    
    // Job rights
    canViewJobs: () => isAdminOrSuperAdmin || hasRight('JOB_VIEW'),
    canAddJob: () => (isAdminOrSuperAdmin || hasRight('JOB_ADD')) && (dbUserTypeValue === 'ADMIN' || dbUserTypeValue === 'SUPERADMIN'),
    canEditJob: () => (isAdminOrSuperAdmin || hasRight('JOB_EDIT')) && (dbUserTypeValue === 'ADMIN' || dbUserTypeValue === 'SUPERADMIN'),
    canDeleteJob: () => (isSuperAdmin || hasRight('JOB_DEL')) && (dbUserTypeValue === 'SUPERADMIN'),
    
    // Department rights
    canViewDepartments: () => isAdminOrSuperAdmin || hasRight('DEPT_VIEW'),
    canAddDepartment: () => (isAdminOrSuperAdmin || hasRight('DEPT_ADD')) && (dbUserTypeValue === 'ADMIN' || dbUserTypeValue === 'SUPERADMIN'),
    canEditDepartment: () => (isAdminOrSuperAdmin || hasRight('DEPT_EDIT')) && (dbUserTypeValue === 'ADMIN' || dbUserTypeValue === 'SUPERADMIN'),
    canDeleteDepartment: () => (isSuperAdmin || hasRight('DEPT_DEL')) && (dbUserTypeValue === 'SUPERADMIN'),
    
    // Admin rights
    canManageUsers: () => (isAdminOrSuperAdmin || hasRight('ADM_USER')) && (dbUserTypeValue === 'SUPERADMIN')
  }), [hasRight, contextRights, userRights, isAdmin, isSuperAdmin, isAdminOrSuperAdmin, dbUserTypeValue]);

  return returnValue;
}