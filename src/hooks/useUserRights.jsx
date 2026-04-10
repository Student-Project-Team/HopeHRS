// src/hooks/useUserRights.js
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export function useUserRights() {
  const { currentUser } = useAuth();
  const [rights, setRights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    const fetchRights = async () => {
      // Use currentUser.id directly (UUID from Supabase Auth)
      // Assumes UserModule_Rights.user_id stores the auth UUID
      const { data: userRights, error } = await supabase
        .from('UserModule_Rights')
        .select('module_id, right_id')
        .eq('user_id', currentUser.id);

      if (error || !userRights?.length) {
        setLoading(false);
        return;
      }

      const moduleIds = userRights.map(r => r.module_id);
      const rightIds = userRights.map(r => r.right_id);

      const { data: modules } = await supabase
        .from('Module')
        .select('id, module_name')
        .in('id', moduleIds);
      const { data: rightsData } = await supabase
        .from('rights')
        .select('id, right_name')
        .in('id', rightIds);

      const moduleMap = Object.fromEntries(modules?.map(m => [m.id, m.module_name]) || []);
      const rightMap = Object.fromEntries(rightsData?.map(r => [r.id, r.right_name]) || []);

      const userPermissions = userRights
        .map(item => ({
          module_name: moduleMap[item.module_id],
          right_name: rightMap[item.right_id],
        }))
        .filter(p => p.module_name && p.right_name);

      setRights(userPermissions);
      setLoading(false);
    };

    fetchRights();
  }, [currentUser]);

  const canView = moduleName => rights.some(r => r.module_name === moduleName && r.right_name === 'view');
  const canCreate = moduleName => rights.some(r => r.module_name === moduleName && r.right_name === 'create');
  const canEdit = moduleName => rights.some(r => r.module_name === moduleName && r.right_name === 'edit');
  const canDelete = moduleName => rights.some(r => r.module_name === moduleName && r.right_name === 'delete');

  return { rights, loading, canView, canCreate, canEdit, canDelete };
}