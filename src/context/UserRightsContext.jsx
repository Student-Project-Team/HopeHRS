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
      } finally {
        setLoading(false);
      }
    };

    fetchUserRights();
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
