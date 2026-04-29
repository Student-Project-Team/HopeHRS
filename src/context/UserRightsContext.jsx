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
    if (authLoading) return;

    if (!user?.email) {
      setRights({});
      setLoading(false);
      return;
    }

    const fetchUserRights = async () => {
      try {
        setLoading(true);
        console.log('Fetching rights for email:', user.email);

        const { data: rightsData, error } = await supabase
          .from('usermodule_rights')
          .select('right_code, right_value')
          .eq('email', user.email);

        if (error) throw error;

        console.log('Raw rights data:', rightsData);

        const rightsMap = {};
        rightsData?.forEach(item => {
          if (item.right_code) {
            rightsMap[item.right_code] = item.right_value === 1;
          }
        });

        console.log('Mapped rights:', rightsMap);
        setRights(rightsMap);
      } catch (error) {
        console.error('Error fetching user rights:', error);
        setRights({});
      } finally {
        setLoading(false);
      }
    };

    fetchUserRights();
  }, [user?.email, authLoading]);

  const hasRight = (rightCode) => rights[rightCode] === true;

  return (
    <UserRightsContext.Provider value={{ rights, loading, hasRight }}>
      {children}
    </UserRightsContext.Provider>
  );
}