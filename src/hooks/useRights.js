import { useContext } from 'react';
import { UserRightsContext } from '../context/UserRightsContext';

export function useRights() {
  const { hasRight, rights } = useContext(UserRightsContext);
  
  const canViewEmployees = () => hasRight('EMP_VIEW');
  const canAddEmployee = () => hasRight('EMP_ADD');
  const canEditEmployee = () => hasRight('EMP_EDIT');
  const canDeleteEmployee = () => hasRight('EMP_DEL');
  
  const canViewJobHistory = () => hasRight('JH_VIEW');
  const canAddJobHistory = () => hasRight('JH_ADD');
  const canEditJobHistory = () => hasRight('JH_EDIT');
  const canDeleteJobHistory = () => hasRight('JH_DEL');
  
  const canViewJobs = () => hasRight('JOB_VIEW');
  const canAddJob = () => hasRight('JOB_ADD');
  const canEditJob = () => hasRight('JOB_EDIT');
  const canDeleteJob = () => hasRight('JOB_DEL');
  
  const canViewDepartments = () => hasRight('DEPT_VIEW');
  const canAddDepartment = () => hasRight('DEPT_ADD');
  const canEditDepartment = () => hasRight('DEPT_EDIT');
  const canDeleteDepartment = () => hasRight('DEPT_DEL');
  
  const canManageUsers = () => hasRight('ADM_USER');
  
  return {
    rights,
    canViewEmployees,
    canAddEmployee,
    canEditEmployee,
    canDeleteEmployee,
    canViewJobHistory,
    canAddJobHistory,
    canEditJobHistory,
    canDeleteJobHistory,
    canViewJobs,
    canAddJob,
    canEditJob,
    canDeleteJob,
    canViewDepartments,
    canAddDepartment,
    canEditDepartment,
    canDeleteDepartment,
    canManageUsers
  };
}
