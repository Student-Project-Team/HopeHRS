import { supabase } from '../lib/supabase';
import { makeStamp } from '../utils/stamp';

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
    
    return { data: transformedData, error: null };
  } catch (error) {
    console.error('Error fetching job history:', error);
    return { data: null, error: error.message };
  }
}

export async function getCurrentJob(empno) {
  try {
    const { data, error } = await supabase
      .from('jobHistory')
      .select('*')
      .eq('empNo', empno)
      .eq('record_status', 'ACTIVE')
      .order('effDate', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    if (error) throw error;
    return { data: data, error: null };
  } catch (error) {
    console.error('Error fetching current job:', error);
    return { data: null, error: error.message };
  }
}

export async function addJobHistoryEntry(data, userId) {
  try {
    // Check if entry already exists
    const { data: existing } = await supabase
      .from('jobHistory')
      .select('empNo, jobCode, effDate')
      .eq('empNo', data.empNo)
      .eq('jobCode', data.jobCode)
      .eq('effDate', data.effDate)
      .maybeSingle();
    
    if (existing) {
      throw new Error('Job history entry already exists for this employee, job, and date');
    }
    
    const newEntry = {
      ...data,
      record_status: 'ACTIVE',
      stamp: makeStamp('CREATED', userId)
    };
    
    const { data: result, error } = await supabase
      .from('jobHistory')
      .insert([newEntry])
      .select()
      .single();
    
    if (error) throw error;
    return { data: result, error: null };
  } catch (error) {
    console.error('Error adding job history:', error);
    return { data: null, error: error.message };
  }
}

export async function updateJobHistoryEntry(empno, jobCode, effDate, updates, userId) {
  try {
    const updateData = {
      ...updates,
      stamp: makeStamp('UPDATED', userId)
    };
    
    const { data, error } = await supabase
      .from('jobHistory')
      .update(updateData)
      .eq('empNo', empno)
      .eq('jobCode', jobCode)
      .eq('effDate', effDate)
      .select()
      .single();
    
    if (error) throw error;
    return { data: data, error: null };
  } catch (error) {
    console.error('Error updating job history:', error);
    return { data: null, error: error.message };
  }
}

export async function softDeleteJobHistoryEntry(empno, jobCode, effDate, userId) {
  try {
    const { data, error } = await supabase
      .from('jobHistory')
      .update({
        record_status: 'INACTIVE',
        stamp: makeStamp('DEACTIVATED', userId)
      })
      .eq('empNo', empno)
      .eq('jobCode', jobCode)
      .eq('effDate', effDate)
      .select()
      .single();
    
    if (error) throw error;
    return { data: data, error: null };
  } catch (error) {
    console.error('Error deleting job history:', error);
    return { data: null, error: error.message };
  }
}

export async function recoverJobHistoryEntry(empno, jobCode, effDate, userId) {
  try {
    const { data, error } = await supabase
      .from('jobHistory')
      .update({
        record_status: 'ACTIVE',
        stamp: makeStamp('RECOVERED', userId)
      })
      .eq('empNo', empno)
      .eq('jobCode', jobCode)
      .eq('effDate', effDate)
      .select()
      .single();
    
    if (error) throw error;
    return { data: data, error: null };
  } catch (error) {
    console.error('Error recovering job history:', error);
    return { data: null, error: error.message };
  }
}
    return transformedData;
  } catch (error) {
    console.error('Error fetching job history:', error);
    return [];
  }
}

// Keep other functions...
