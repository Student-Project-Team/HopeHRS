import { useContext, useMemo } from 'react';
import { UserRightsContext } from '../context/UserRightsContext';

export function useRights() {
  const { hasRight, rights } = useContext(UserRightsContext);
  
  const returnValue = useMemo(() => ({
    rights,
    canViewEmployees: () => hasRight('EMP_VIEW'),
    canAddEmployee: () => hasRight('EMP_ADD'),
    canEditEmployee: () => hasRight('EMP_EDIT'),
    canDeleteEmployee: () => hasRight('EMP_DEL'),
    
    canViewJobHistory: () => hasRight('JH_VIEW'),
    canAddJobHistory: () => hasRight('JH_ADD'),
    canEditJobHistory: () => hasRight('JH_EDIT'),
    canDeleteJobHistory: () => hasRight('JH_DEL'),
    
    canViewJobs: () => hasRight('JOB_VIEW'),
    canAddJob: () => hasRight('JOB_ADD'),
    canEditJob: () => hasRight('JOB_EDIT'),
    canDeleteJob: () => hasRight('JOB_DEL'),
    
    canViewDepartments: () => hasRight('DEPT_VIEW'),
    canAddDepartment: () => hasRight('DEPT_ADD'),
    canEditDepartment: () => hasRight('DEPT_EDIT'),
    canDeleteDepartment: () => hasRight('DEPT_DEL'),
    
    canManageUsers: () => hasRight('ADM_USER')
  }), [hasRight, rights]);

  return returnValue;
}