/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export const UserRightsContext = createContext();

const RIGHTS_BY_TYPE = {
  SUPERADMIN: {
    EMP_VIEW: true, EMP_ADD: true, EMP_EDIT: true, EMP_DEL: true,
    JH_VIEW: true,  JH_ADD: true,  JH_EDIT: true,  JH_DEL: true,
    JOB_VIEW: true, JOB_ADD: true, JOB_EDIT: true, JOB_DEL: true,
    DEPT_VIEW: true, DEPT_ADD: true, DEPT_EDIT: true, DEPT_DEL: true,
    ADM_USER: true,
  },
  ADMIN: {
    EMP_VIEW: true, EMP_ADD: true, EMP_EDIT: true, EMP_DEL: false,
    JH_VIEW: true,  JH_ADD: true,  JH_EDIT: true,  JH_DEL: false,
    JOB_VIEW: true, JOB_ADD: true, JOB_EDIT: true, JOB_DEL: false,
    DEPT_VIEW: true, DEPT_ADD: true, DEPT_EDIT: true, DEPT_DEL: false,
    ADM_USER: false,
  },
  USER: {
    EMP_VIEW: true,  EMP_ADD: false, EMP_EDIT: false, EMP_DEL: false,
    JH_VIEW: true,   JH_ADD: false,  JH_EDIT: false,  JH_DEL: false,
    JOB_VIEW: true,  JOB_ADD: false, JOB_EDIT: false, JOB_DEL: false,
    DEPT_VIEW: true, DEPT_ADD: false, DEPT_EDIT: false, DEPT_DEL: false,
    ADM_USER: false,
  },
};

export function UserRightsProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [rights, setRights] = useState({});
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserType = async () => {
      if (!user?.email) {
        setRights({});
        setUserType(null);
        setLoading(false);
        return;
      }

      try {
        const { data: userData, error } = await supabase
          .from('users')
          .select('user_type')
          .eq('email', user.email)
          .single();

        if (error) throw error;

        const currentUserType = userData?.user_type || 'USER';
        setUserType(currentUserType);
        setRights(RIGHTS_BY_TYPE[currentUserType] ?? RIGHTS_BY_TYPE.USER);
      } catch (error) {
        console.error('Error fetching user type:', error);
        setRights(RIGHTS_BY_TYPE.USER);
        setUserType('USER');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserType();
    }
  }, [user?.email, authLoading]);

  const hasRight = (rightCode) => {
    // SUPERADMIN has all rights
    if (userType === 'SUPERADMIN') {
      return true;
    }
    return rights[rightCode] === true;
  };

  const value = {
    rights,
    userType,
    loading,
    hasRight,
    allRights: Object.keys(RIGHTS_BY_TYPE.SUPERADMIN),
  };

  return (
    <UserRightsContext.Provider value={value}>
      {children}
    </UserRightsContext.Provider>
  );
}

export function useUserRights() {
  const context = useContext(UserRightsContext);
  if (!context) {
    throw new Error('useUserRights must be used within UserRightsProvider');
  }
  return context;
}