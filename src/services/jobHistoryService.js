import { supabase } from '../lib/supabase';
import { makeStamp } from '../utils/stamp';

/**
 * Get job history by employee number
 * @param {string} empno - Employee number
 * @param {string} userType - USER, ADMIN, or SUPERADMIN
 * @returns {Promise<Array>} - Array of job history records
 */
export async function getJobHistoryByEmployee(empno, userType) {
  try {
    let query = supabase
      .from('jobhistory')
      .select(`
        empno,
        jobcode,
        deptcode,
        effdate,
        salary,
        record_status,
        stamp
        *,
        job:jobcode (jobdesc),
        department:deptcode (deptname)
      `)
      .eq('empno', empno)
      .order('effdate', { ascending: false });
    
    if (userType === 'USER') {
      query = query.eq('record_status', 'ACTIVE');
    }
    
    const { data, error } = await query;
    if (error) throw error;

    const transformedData = data?.map((item) => ({
      ...item,
      jobDesc: item.job?.jobdesc,
      deptName: item.department?.deptname,
      uniqueId: `${item.empno}-${item.jobcode}-${item.effdate}`
    })) || [];
    
    return transformedData;
  } catch (error) {
    console.error('Error fetching job history:', error);
    return [];
  }
}

/**
 * Get current (most recent ACTIVE) job for an employee
 * @param {string} empno - Employee number
 * @returns {Promise<Object|null>} - Current job or null
 */
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

/**
 * Create a new job history entry
 * @param {Object} data - { empNo, jobCode, deptCode, effDate, salary, endDate? }
 * @param {string} userId - User email for stamp
 * @returns {Promise<Object>} - Created record
 */
export async function createJobHistory(data, userId) {
  try {
    const { data: result, error } = await supabase
      .from('jobhistory')
      .insert([{
        empno: data.empNo || data.empno,
        jobcode: data.jobCode || data.jobcode,
        deptcode: data.deptCode || data.deptcode,
        effdate: data.effDate || data.effdate,
        record_status: 'ACTIVE',
        salary: data.salary || null,
        stamp: makeStamp('CREATED', userId),
        stamp: makeStamp('CREATED', userId)
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

export async function updateJobHistory(empno, jobcode, effdate, updates, userId) {
  try {
    const stamp = makeStamp('UPDATED', userId);
    const { data, error } = await supabase
      .from('jobhistory')
      .update({
        jobcode: updates.jobCode || updates.jobcode,
        deptcode: updates.deptCode || updates.deptcode,
        effdate: updates.effDate || updates.effdate,
        salary: updates.salary || null,
        stamp,
      })
      .eq('empno', empno)
      .eq('jobcode', oldJobCode)
      .eq('effdate', oldEffDate)
      .eq('jobcode', jobcode)
      .eq('effdate', effdate)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('updateJobHistory error:', error);
    throw error;
  }
}

export async function softDeleteJobHistory(empno, jobcode, effdate, userId) {
  try {
    const stamp = makeStamp('DEACTIVATED', userId);
    const { data, error } = await supabase
      .from('jobhistory')
      .update({ record_status: 'INACTIVE', stamp })
      .eq('empno', empno)
      .eq('jobcode', jobCode)
      .eq('effdate', effDate)
      .eq('jobcode', jobcode)
      .eq('effdate', effdate)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('softDeleteJobHistory error:', error);
    throw error;
  }
}

export async function recoverJobHistory(empno, jobcode, effdate, userId) {
  try {
    const stamp = makeStamp('RECOVERED', userId);
    const { data, error } = await supabase
      .from('jobhistory')
      .update({ record_status: 'ACTIVE', stamp })
      .eq('empno', empno)
      .eq('jobcode', jobCode)
      .eq('effdate', effDate)
      .eq('jobcode', jobcode)
      .eq('effdate', effdate)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('recoverJobHistory error:', error);
    throw error;
  }
}
