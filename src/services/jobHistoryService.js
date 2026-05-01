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
    
    // USER can only see ACTIVE records
    if (userType === 'USER') {
      query = query.eq('record_status', 'ACTIVE');
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return data || [];
    const { data, error } = await query;
    if (error) throw error;

    const transformedData = data?.map((item) => ({
      ...item,
      jobDesc: item.job?.jobdesc,
      deptName: item.department?.deptname,
      // Create a composite key for unique identification
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
        empno: data.empNo,
        jobcode: data.jobCode,
        deptcode: data.deptCode,
        effdate: data.effDate,
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
 * Updates a job history record using composite key (empno, jobcode, effdate)
 * Requires JH_EDIT right — enforce on the calling layer.
 */
export async function updateJobHistory(empno, jobcode, effdate, updates, userId) {
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

/**
 * Soft delete a job history record (set record_status = 'INACTIVE')
 * @param {string} empno - Employee number
 * @param {string} jobCode - Job code
 * @param {string} effDate - Effective date
 * @param {string} userId - User email for stamp
 * @returns {Promise<Object>} - Updated record
 */
export async function softDeleteJobHistory(empno, jobCode, effDate, userId) {
 * Soft-deletes a job history record using composite key
 * Requires JH_DEL right — enforce on the calling layer.
 */
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

/**
 * Recover a soft deleted job history record (set record_status = 'ACTIVE')
 * @param {string} empno - Employee number
 * @param {string} jobCode - Job code
 * @param {string} effDate - Effective date
 * @param {string} userId - User email for stamp
 * @returns {Promise<Object>} - Updated record
 */
export async function recoverJobHistory(empno, jobCode, effDate, userId) {
 * Recovers a soft-deleted job history record using composite key
 */
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
}
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
