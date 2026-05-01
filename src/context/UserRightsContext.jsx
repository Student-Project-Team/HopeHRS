import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const UserRightsContext = createContext();

export function UserRightsProvider({ children }) {
  const { user } = useAuth();
  const [rights, setRights] = useState({});
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRights = async () => {
      if (!user?.email) {
        setRights({});
        setUserType(null);
/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

export const UserRightsContext = createContext();

export function UserRightsProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [rights, setRights] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user?.email) {
      setRights({});
      setLoading(false);
      return;
    }

    const fetchUserRights = async () => {
      try {
        setLoading(true);
        
        const userType = user?.user_type || 'USER';
        
        // For SUPERADMIN - grant all rights (including DELETE)
        if (userType === 'SUPERADMIN') {
          console.log('SUPERADMIN detected - granting all rights (including delete)');
          const allRights = {
            EMP_VIEW: true, EMP_ADD: true, EMP_EDIT: true, EMP_DEL: true,
            JH_VIEW: true, JH_ADD: true, JH_EDIT: true, JH_DEL: true,
            JOB_VIEW: true, JOB_ADD: true, JOB_EDIT: true, JOB_DEL: true,
            DEPT_VIEW: true, DEPT_ADD: true, DEPT_EDIT: true, DEPT_DEL: true,
            ADM_USER: true
          };
          setRights(allRights);
          setLoading(false);
          return;
        }
        
        // For ADMIN - grant all rights EXCEPT DELETE
        if (userType === 'ADMIN') {
          console.log('ADMIN detected - granting all rights EXCEPT delete');
          const adminRights = {
            EMP_VIEW: true, EMP_ADD: true, EMP_EDIT: true, EMP_DEL: false,
            JH_VIEW: true, JH_ADD: true, JH_EDIT: true, JH_DEL: false,
            JOB_VIEW: true, JOB_ADD: true, JOB_EDIT: true, JOB_DEL: false,
            DEPT_VIEW: true, DEPT_ADD: true, DEPT_EDIT: true, DEPT_DEL: false,
            ADM_USER: true
          };
          setRights(adminRights);
          setLoading(false);
          return;
        }
        
        // For USER role, try to fetch from DB
        const { data: sampleData, error: sampleError } = await supabase
          .from('UserModule_Rights')
          .select('*')
          .limit(1);
        
        if (sampleError) {
          console.warn('Cannot access UserModule_Rights table:', sampleError.message);
          const defaultRights = {
            EMP_VIEW: true, EMP_ADD: false, EMP_EDIT: false, EMP_DEL: false,
            JH_VIEW: true, JH_ADD: false, JH_EDIT: false, JH_DEL: false,
            JOB_VIEW: true, JOB_ADD: false, JOB_EDIT: false, JOB_DEL: false,
            DEPT_VIEW: true, DEPT_ADD: false, DEPT_EDIT: false, DEPT_DEL: false,
            ADM_USER: false
          };
          setRights(defaultRights);
          setLoading(false);
          return;
        }
        
        // Detect column names dynamically
        let codeColumn = null;
        let valueColumn = null;
        
        if (sampleData && sampleData.length > 0) {
          const firstRow = sampleData[0];
          if ('right_code' in firstRow) codeColumn = 'right_code';
          else if ('code' in firstRow) codeColumn = 'code';
          else if ('rightCode' in firstRow) codeColumn = 'rightCode';
          
          if ('right_value' in firstRow) valueColumn = 'right_value';
          else if ('value' in firstRow) valueColumn = 'value';
          else if ('rightValue' in firstRow) valueColumn = 'rightValue';
          else if ('has_right' in firstRow) valueColumn = 'has_right';
        }
        
        if (!codeColumn || !valueColumn) {
          console.warn('Could not detect column names, using default USER rights');
          const defaultRights = {
            EMP_VIEW: true, EMP_ADD: false, EMP_EDIT: false, EMP_DEL: false,
            JH_VIEW: true, JH_ADD: false, JH_EDIT: false, JH_DEL: false,
            JOB_VIEW: true, JOB_ADD: false, JOB_EDIT: false, JOB_DEL: false,
            DEPT_VIEW: true, DEPT_ADD: false, DEPT_EDIT: false, DEPT_DEL: false,
            ADM_USER: false
          };
          setRights(defaultRights);
          setLoading(false);
          return;
        }
        
        // Fetch user's rights with detected column names
        const { data: rightsData, error } = await supabase
          .from('UserModule_Rights')
          .select(`${codeColumn}, ${valueColumn}`)
          .eq('email', user.email);

        if (error) {
          console.warn('Rights fetch failed, using default USER rights:', error.message);
          const defaultRights = {
            EMP_VIEW: true, EMP_ADD: false, EMP_EDIT: false, EMP_DEL: false,
            JH_VIEW: true, JH_ADD: false, JH_EDIT: false, JH_DEL: false,
            JOB_VIEW: true, JOB_ADD: false, JOB_EDIT: false, JOB_DEL: false,
            DEPT_VIEW: true, DEPT_ADD: false, DEPT_EDIT: false, DEPT_DEL: false,
            ADM_USER: false
          };
          setRights(defaultRights);
          setLoading(false);
          return;
        }
        
        // Build rights map
        const rightsMap = {
          EMP_VIEW: false, EMP_ADD: false, EMP_EDIT: false, EMP_DEL: false,
          JH_VIEW: false, JH_ADD: false, JH_EDIT: false, JH_DEL: false,
          JOB_VIEW: false, JOB_ADD: false, JOB_EDIT: false, JOB_DEL: false,
          DEPT_VIEW: false, DEPT_ADD: false, DEPT_EDIT: false, DEPT_DEL: false,
          ADM_USER: false
        };
        
        if (rightsData && rightsData.length > 0) {
          rightsData.forEach(item => {
            const code = item[codeColumn];
            const value = item[valueColumn];
            if (code && rightsMap.hasOwnProperty(code)) {
              rightsMap[code] = value === 1 || value === true;
            }
          });
        }
        
        setRights(rightsMap);
      } catch (error) {
        console.error('Error in fetchUserRights:', error);
        const defaultRights = {
          EMP_VIEW: true, EMP_ADD: false, EMP_EDIT: false, EMP_DEL: false,
          JH_VIEW: true, JH_ADD: false, JH_EDIT: false, JH_DEL: false,
          JOB_VIEW: true, JOB_ADD: false, JOB_EDIT: false, JOB_DEL: false,
          DEPT_VIEW: true, DEPT_ADD: false, DEPT_EDIT: false, DEPT_DEL: false,
          ADM_USER: false
        };
        setRights(defaultRights);
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
      if (!user?.id) {
        setRights({});
        setLoading(false);
        return;
      }

      try {
        // First, get the user_type from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('user_type')
          .eq('email', user.email)
          .single();

        if (userError) throw userError;

        const currentUserType = userData?.user_type || 'USER';
        setUserType(currentUserType);

        // For ADMIN and SUPERADMIN, they have all rights by default
        if (currentUserType === 'SUPERADMIN') {
          setRights({
            EMP_ADD: true,
            EMP_EDIT: true,
            EMP_DEL: true,
            JH_ADD: true,
            JH_EDIT: true,
            JH_DEL: true,
          });
        } else if (currentUserType === 'ADMIN') {
          setRights({
            EMP_ADD: true,
            EMP_EDIT: true,
            EMP_DEL: false,  // ADMIN cannot delete employees
            JH_ADD: true,
            JH_EDIT: true,
            JH_DEL: false,   // ADMIN cannot delete job history
          });
        } else {
          // For USER type, fetch specific rights from user_rights table
          const { data: rightsData, error: rightsError } = await supabase
            .from('user_rights')
            .select('right_name')
            .eq('email', user.email);

          if (rightsError) throw rightsError;

          const rightsMap = {};
          if (rightsData) {
            rightsData.forEach((item) => {
              rightsMap[item.right_name] = true;
            });
          }

          // Set default false for all rights if not present
          setRights({
            EMP_ADD: rightsMap.EMP_ADD || false,
            EMP_EDIT: rightsMap.EMP_EDIT || false,
            EMP_DEL: rightsMap.EMP_DEL || false,
            JH_ADD: rightsMap.JH_ADD || false,
            JH_EDIT: rightsMap.JH_EDIT || false,
            JH_DEL: rightsMap.JH_DEL || false,
          });
        }
      } catch (error) {
        console.error('Error fetching user rights:', error);
        setRights({});
        setUserType('USER');
        setLoading(true);
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
      } catch (error) {
        console.error('Error fetching user rights:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRights();
  }, [user?.email, user?.user_type, authLoading]);

  const hasRight = (rightCode) => {
    const userType = user?.user_type;
    // SUPERADMIN has all rights
    if (userType === 'SUPERADMIN') {
      return true;
    }
    // ADMIN only has non-delete rights (handled by the rights map)
  }, [user]);

  return (
    <UserRightsContext.Provider value={{ rights, userType, loading }}>
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
    if (!authLoading) {
      fetchUserRights();
    }
  }, [user?.id, authLoading]);

  const hasRight = (rightCode) => {
    return rights[rightCode] === true;
  };

  return (
    <UserRightsContext.Provider value={{ rights, loading, hasRight }}>
    <UserRightsContext.Provider value={{ rights, loading, hasRight, allRights }}>
      {children}
    </UserRightsContext.Provider>
  );
}
