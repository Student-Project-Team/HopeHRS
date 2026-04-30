import { supabase } from '../lib/supabase';
import { makeStamp } from '../utils/stamp';
import { JobHistoryEntry, CreateJobHistoryData, UpdateJobHistoryData } from '../types/jobHistory';

export async function getJobHistoryByEmployee(empno: string, userType: 'USER' | 'ADMIN' | 'SUPERADMIN') {
  try {
    let query = supabase
      .from('jobHistory')
      .select('*')
      .eq('empNo', empno)
      .order('effDate', { ascending: false });
    
    if (userType === 'USER') {
      query = query.eq('record_status', 'ACTIVE');
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { data: data as JobHistoryEntry[], error: null };
  } catch (error) {
    console.error('Error fetching job history:', error);
    return { data: null, error };
  }
}

export async function getCurrentJob(empno: string) {
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
    return { data: data as JobHistoryEntry | null, error: null };
  } catch (error) {
    console.error('Error fetching current job:', error);
    return { data: null, error };
  }
}

export async function addJobHistoryEntry(data: CreateJobHistoryData, userId: string) {
  try {
    const { data: existing } = await supabase
      .from('jobHistory')
      .select('empNo, jobCode, effDate')
      .eq('empNo', data.empNo)
      .eq('jobCode', data.jobCode)
      .eq('effDate', data.effDate)
      .maybeSingle();
    
    if (existing) {
      throw new Error('Job history entry already exists');
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
    return { data: result as JobHistoryEntry, error: null };
  } catch (error) {
    console.error('Error adding job history:', error);
    return { data: null, error };
  }
}

export async function updateJobHistoryEntry(
  empno: string, 
  jobCode: string, 
  effDate: string, 
  updates: UpdateJobHistoryData, 
  userId: string
) {
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
    return { data: data as JobHistoryEntry, error: null };
  } catch (error) {
    console.error('Error updating job history:', error);
    return { data: null, error };
  }
}

export async function softDeleteJobHistoryEntry(
  empno: string, 
  jobCode: string, 
  effDate: string, 
  userId: string
) {
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
    return { data: data as JobHistoryEntry, error: null };
  } catch (error) {
    console.error('Error deleting job history:', error);
    return { data: null, error };
  }
}

export async function recoverJobHistoryEntry(
  empno: string, 
  jobCode: string, 
  effDate: string, 
  userId: string
) {
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
    return { data: data as JobHistoryEntry, error: null };
  } catch (error) {
    console.error('Error recovering job history:', error);
    return { data: null, error };
  }
}
