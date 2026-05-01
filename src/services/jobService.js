import { supabase } from '../lib/supabase';

export async function getAllJobs(userType) {
  try {
    let query = supabase.from('job').select('*').order('jobcode');
    
    if (userType === 'USER') {
      query = query.eq('record_status', 'ACTIVE');
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Normalize column names to match what UI expects
    const normalizedData = data?.map(job => ({
      jobCode: job.jobcode,
      jobDesc: job.jobdesc,
      record_status: job.record_status,
      stamp: job.stamp
    })) || [];
    
    return normalizedData;
  } catch (error) {
    console.error('getAllJobs error:', error);
    return [];
  }
}

export async function createJob(data, userId) {
  try {
    const { data: result, error } = await supabase
      .from('job')
      .insert([{
        jobcode: data.jobCode,
        jobdesc: data.jobDesc,
        record_status: 'ACTIVE',
        stamp: `CREATED by ${userId} on ${new Date().toISOString()}`
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      jobCode: result.jobcode,
      jobDesc: result.jobdesc,
      record_status: result.record_status,
      stamp: result.stamp
    };
  } catch (error) {
    console.error('createJob error:', error);
    throw error;
  }
}

export async function updateJob(jobCode, updates, userId) {
  try {
    const { data, error } = await supabase
      .from('job')
      .update({
        jobdesc: updates.jobDesc,
        stamp: `UPDATED by ${userId} on ${new Date().toISOString()}`
      })
      .eq('jobcode', jobCode)
      .select()
      .single();
    
    if (error) throw error;
    
    // Return normalized data
    return {
      jobCode: data.jobcode,
      jobDesc: data.jobdesc,
      record_status: data.record_status,
      stamp: data.stamp
    };
  } catch (error) {
    console.error('updateJob error:', error);
    throw error;
  }
}

export async function softDeleteJob(jobCode, userId) {
  try {
    const { data, error } = await supabase
      .from('job')
      .update({
        record_status: 'INACTIVE',
        stamp: `DEACTIVATED by ${userId} on ${new Date().toISOString()}`
      })
      .eq('jobcode', jobCode)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('softDeleteJob error:', error);
    throw error;
  }
}

export async function recoverJob(jobCode, userId) {
  try {
    const { data, error } = await supabase
      .from('job')
      .update({
        record_status: 'ACTIVE',
        stamp: `RECOVERED by ${userId} on ${new Date().toISOString()}`
      })
      .eq('jobcode', jobCode)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('recoverJob error:', error);
    throw error;
  }
}
}
}
