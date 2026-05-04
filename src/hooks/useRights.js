// hooks/useRights.js
import { useContext, useMemo } from 'react';
import { UserRightsContext } from '../context/UserRightsContext';
import { useAuth } from './useAuth';
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