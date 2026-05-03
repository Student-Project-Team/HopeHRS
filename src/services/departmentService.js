import { supabase } from '../lib/supabase';

export async function getAllDepartments(userType) {
  try {
    let query = supabase.from('department').select('*').order('deptcode');
    
    if (userType === 'USER') {
      query = query.eq('record_status', 'ACTIVE');
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    // Normalize: Convert lowercase database columns to camelCase for UI
    const normalizedData = data?.map(dept => ({
      deptCode: dept.deptcode,
      deptName: dept.deptname,
      record_status: dept.record_status,
      stamp: dept.stamp
    })) || [];
    
    return normalizedData;
  } catch (error) {
    console.error('getAllDepartments error:', error);
    return [];
  }
}

export async function createDepartment(data, userId) {
  try {
    const { data: result, error } = await supabase
      .from('department')
      .insert([{
        deptcode: data.deptCode,
        deptname: data.deptName,
        record_status: 'ACTIVE',
        stamp: `CREATED by ${userId} on ${new Date().toISOString()}`
      }])
      .select()
      .single();
    
    if (error) throw error;
    
    // Return normalized data
    return {
      deptCode: result.deptcode,
      deptName: result.deptname,
      record_status: result.record_status,
      stamp: result.stamp
    };
  } catch (error) {
    console.error('createDepartment error:', error);
    throw error;
  }
}

export async function updateDepartment(deptCode, updates, userId) {
  try {
    const { data, error } = await supabase
      .from('department')
      .update({
        deptname: updates.deptName,
        stamp: `UPDATED by ${userId} on ${new Date().toISOString()}`
      })
      .eq('deptcode', deptCode)
      .select()
      .single();
    
    if (error) throw error;
    
    // Return normalized data
    return {
      deptCode: data.deptcode,
      deptName: data.deptname,
      record_status: data.record_status,
      stamp: data.stamp
    };
  } catch (error) {
    console.error('updateDepartment error:', error);
    throw error;
  }
}

export async function softDeleteDepartment(deptCode, userId) {
  try {
    const { data, error } = await supabase
      .from('department')
      .update({
        record_status: 'INACTIVE',
        stamp: `DEACTIVATED by ${userId} on ${new Date().toISOString()}`
      })
      .eq('deptcode', deptCode)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('softDeleteDepartment error:', error);
    throw error;
  }
}

export async function recoverDepartment(deptCode, userId) {
  try {
    const { data, error } = await supabase
      .from('department')
      .update({
        record_status: 'ACTIVE',
        stamp: `RECOVERED by ${userId} on ${new Date().toISOString()}`
      })
      .eq('deptcode', deptCode)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('recoverDepartment error:', error);
    throw error;
  }
}
