import { supabase } from '../lib/supabase';
import { makeStamp } from '../utils/stamp';
import { Job, CreateJobData, UpdateJobData } from '../types/job';

export async function getAllJobs(userType: 'USER' | 'ADMIN' | 'SUPERADMIN') {
  try {
    let query = supabase.from('job').select('*').order('jobCode');
    
    if (userType === 'USER') {
      query = query.eq('record_status', 'ACTIVE');
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { data: data as Job[], error: null };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return { data: null, error };
  }
}

export async function getJobById(jobCode: string) {
  try {
    const { data, error } = await supabase
      .from('job')
      .select('*')
      .eq('jobCode', jobCode)
      .single();
    
    if (error) throw error;
    return { data: data as Job, error: null };
  } catch (error) {
    console.error('Error fetching job:', error);
    return { data: null, error };
  }
}

export async function createJob(data: CreateJobData, userId: string) {
  try {
    const { data: existing } = await supabase
      .from('job')
      .select('jobCode')
      .eq('jobCode', data.jobCode)
      .maybeSingle();
    
    if (existing) {
      throw new Error('Job code already exists');
    }
    
    const newJob = {
      ...data,
      record_status: 'ACTIVE',
      stamp: makeStamp('CREATED', userId)
    };
    
    const { data: result, error } = await supabase
      .from('job')
      .insert([newJob])
      .select()
      .single();
    
    if (error) throw error;
    return { data: result as Job, error: null };
  } catch (error) {
    console.error('Error creating job:', error);
    return { data: null, error };
  }
}

export async function updateJob(jobCode: string, updates: UpdateJobData, userId: string) {
  try {
    const updateData = {
      ...updates,
      stamp: makeStamp('UPDATED', userId)
    };
    
    const { data, error } = await supabase
      .from('job')
      .update(updateData)
      .eq('jobCode', jobCode)
      .select()
      .single();
    
    if (error) throw error;
    return { data: data as Job, error: null };
  } catch (error) {
    console.error('Error updating job:', error);
    return { data: null, error };
  }
}

export async function softDeleteJob(jobCode: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('job')
      .update({
        record_status: 'INACTIVE',
        stamp: makeStamp('DEACTIVATED', userId)
      })
      .eq('jobCode', jobCode)
      .select()
      .single();
    
    if (error) throw error;
    return { data: data as Job, error: null };
  } catch (error) {
    console.error('Error deleting job:', error);
    return { data: null, error };
  }
}

export async function recoverJob(jobCode: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('job')
      .update({
        record_status: 'ACTIVE',
        stamp: makeStamp('RECOVERED', userId)
      })
      .eq('jobCode', jobCode)
      .select()
      .single();
    
    if (error) throw error;
    return { data: data as Job, error: null };
  } catch (error) {
    console.error('Error recovering job:', error);
    return { data: null, error };
  }
}
