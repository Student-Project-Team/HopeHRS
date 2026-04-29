import { supabase } from '../lib/supabase';
import { makeStamp } from '../utils/stamp';

export async function getJobHistoryByEmployee(empno, userType) {
  try {
    const { data, error } = await supabase
      .from('jobhistory')
      .select(`
        *,
        job:jobcode (jobdesc),
        department:deptcode (deptname)
      `)
      .eq('empno', empno)
      .order('effdate', { ascending: false });

    if (error) throw error;

    const transformedData = data?.map((item) => ({
      ...item,
      jobDesc: item.job?.jobdesc,
      deptName: item.department?.deptname,
    })) || [];

    return transformedData;
  } catch (error) {
    console.error('Error fetching job history:', error);
    return [];
  }
}

export async function getCurrentJobForEmployee(empno) {
  try {
    const { data, error } = await supabase
      .from('jobhistory')
      .select('*')
      .eq('empno', empno)
      .eq('record_status', 'ACTIVE')
      .order('effdate', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching current job:', error);
    return null;
  }
}

export async function createJobHistory(data, userId) {
  try {
    const { data: result, error } = await supabase
      .from('jobhistory')
      .insert([{
        empno: data.empNo,
        jobcode: data.jobCode,
        deptcode: data.deptCode,
        effdate: data.effDate,
        record_status: 'ACTIVE',
        salary: data.salary || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return result;
  } catch (error) {
    console.error('createJobHistory error:', error);
    throw error;
  }
}

/**
 * Updates a job history record.
 * Requires JH_EDIT right — enforce on the calling layer.
 */
export async function updateJobHistory(id, updates, userId) {
  try {
    const stamp = makeStamp('UPDATED', userId);
    const { data, error } = await supabase
      .from('jobhistory')
      .update({
        jobcode: updates.jobCode,
        deptcode: updates.deptCode,
        effdate: updates.effDate,
        salary: updates.salary || null,
        stamp,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('updateJobHistory error:', error);
    throw error;
  }
}

/**
 * Soft-deletes a job history record: sets record_status = 'INACTIVE'.
 * Requires JH_DEL right — enforce on the calling layer.
 */
export async function softDeleteJobHistory(id, userId) {
  try {
    const stamp = makeStamp('DEACTIVATED', userId);
    const { data, error } = await supabase
      .from('jobhistory')
      .update({ record_status: 'INACTIVE', stamp })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('softDeleteJobHistory error:', error);
    throw error;
  }
}