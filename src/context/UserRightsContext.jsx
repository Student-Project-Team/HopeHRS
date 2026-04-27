/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export const UserRightsContext = createContext();

export function UserRightsProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [rights, setRights] = useState({});
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const allRights = [
    'EMP_VIEW', 'EMP_ADD', 'EMP_EDIT', 'EMP_DEL',
    'JH_VIEW', 'JH_ADD', 'JH_EDIT', 'JH_DEL',
    'JOB_VIEW', 'JOB_ADD', 'JOB_EDIT', 'JOB_DEL',
    'DEPT_VIEW', 'DEPT_ADD', 'DEPT_EDIT', 'DEPT_DEL',
    'ADM_USER'
  ];

  const rightIdToCode = {
    1: 'EMP_VIEW', 2: 'EMP_ADD', 3: 'EMP_EDIT', 4: 'EMP_DEL',
    5: 'JH_VIEW', 6: 'JH_ADD', 7: 'JH_EDIT', 8: 'JH_DEL',
    9: 'JOB_VIEW', 10: 'JOB_ADD', 11: 'JOB_EDIT', 12: 'JOB_DEL',
    13: 'DEPT_VIEW', 14: 'DEPT_ADD', 15: 'DEPT_EDIT', 16: 'DEPT_DEL',
    17: 'ADM_USER'
  };

  useEffect(() => {
    const fetchUserRights = async () => {
      if (hasFetched.current) {
        setLoading(false);
        return;
      }

      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data: rightsData, error: rightsError } = await supabase
          .from('UserModule_Rights')
          .select('right_id, is_allowed')
          .eq('user_id', user.id);

        if (rightsError) throw rightsError;

        const rightsMap = {};
        rightsData?.forEach(item => {
          const rightCode = rightIdToCode[item.right_id];
          if (rightCode) {
            rightsMap[rightCode] = item.is_allowed === 1;
          }
        });

        setRights(rightsMap);
        hasFetched.current = true;
      } catch (error) {
        console.error('Error fetching user rights:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserRights();
    }
  }, [user, authLoading]);

  const hasRight = (rightCode) => {
    return rights[rightCode] === true;
  };

  return (
    <UserRightsContext.Provider value={{ rights, loading: false, hasRight, allRights }}>
      {children}
    </UserRightsContext.Provider>
  );
}
