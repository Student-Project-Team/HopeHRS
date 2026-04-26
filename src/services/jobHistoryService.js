import { supabase } from '../lib/supabase';

export async function getJobHistoryByEmployee(empno, userType) {
  try {
    let query = supabase
      .from('jobHistory')
      .select(`
        *,
        job:jobCode (jobDesc),
        department:deptCode (deptName)
      `)
      .eq('empNo', empno)
      .order('effDate', { ascending: false });
    
    if (userType === 'USER') {
      query = query.eq('record_status', 'ACTIVE');
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Transform data to include joined fields
    const transformedData = data?.map(item => ({
      ...item,
      jobDesc: item.job?.jobDesc,
      deptName: item.department?.deptName
    })) || [];
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching job history:', error);
    return [];
  }
}

// Keep other functions...
