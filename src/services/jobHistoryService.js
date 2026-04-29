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
      `)
      .eq('empno', empno)
      .order('effdate', { ascending: false });
    
    // USER can only see ACTIVE records
    if (userType === 'USER') {
      query = query.eq('record_status', 'ACTIVE');
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data || [];
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
        empno: data.empNo,
        jobcode: data.jobCode,
        deptcode: data.deptCode,
        effdate: data.effDate,
        record_status: 'ACTIVE',
        salary: data.salary || null,
        stamp: makeStamp('CREATED', userId),
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
 * Update a job history record using composite key (empno, jobcode, effdate)
 * @param {string} empno - Employee number
 * @param {string} oldJobCode - Original job code
 * @param {string} oldEffDate - Original effective date
 * @param {Object} updates - { jobCode, deptCode, effDate, salary }
 * @param {string} userId - User email for stamp
 * @returns {Promise<Object>} - Updated record
 */
export async function updateJobHistory(empno, oldJobCode, oldEffDate, updates, userId) {
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
      .eq('empno', empno)
      .eq('jobcode', oldJobCode)
      .eq('effdate', oldEffDate)
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
 * Soft delete a job history record (set record_status = 'INACTIVE')
 * @param {string} empno - Employee number
 * @param {string} jobCode - Job code
 * @param {string} effDate - Effective date
 * @param {string} userId - User email for stamp
 * @returns {Promise<Object>} - Updated record
 */
export async function softDeleteJobHistory(empno, jobCode, effDate, userId) {
  try {
    const stamp = makeStamp('DEACTIVATED', userId);
    const { data, error } = await supabase
      .from('jobhistory')
      .update({ record_status: 'INACTIVE', stamp })
      .eq('empno', empno)
      .eq('jobcode', jobCode)
      .eq('effdate', effDate)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('softDeleteJobHistory error:', error);
    throw error;
  }
}

/**
 * Recover a soft deleted job history record (set record_status = 'ACTIVE')
 * @param {string} empno - Employee number
 * @param {string} jobCode - Job code
 * @param {string} effDate - Effective date
 * @param {string} userId - User email for stamp
 * @returns {Promise<Object>} - Updated record
 */
export async function recoverJobHistory(empno, jobCode, effDate, userId) {
  try {
    const stamp = makeStamp('RECOVERED', userId);
    const { data, error } = await supabase
      .from('jobhistory')
      .update({ record_status: 'ACTIVE', stamp })
      .eq('empno', empno)
      .eq('jobcode', jobCode)
      .eq('effdate', effDate)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('recoverJobHistory error:', error);
    throw error;
  }
}