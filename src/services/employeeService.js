import { supabase } from '../lib/supabase';

export async function getAllEmployees(userType) {
  try {
    let query = supabase.from('employee').select('*');
    if (userType === 'USER') {
      query = query.eq('record_status', 'ACTIVE');
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('getAllEmployees error:', error);
    throw error;
  }
}

export async function getEmployeeById(empno) {
  try {
    const { data, error } = await supabase
      .from('employee')
      .select('*')
      .eq('empno', empno)
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('getEmployeeById error:', error);
    throw error;
  }
}

export async function createEmployee(data, userId) {
  try {
    const { data: created, error } = await supabase
      .from('employee')
      .insert({
        ...data,
        record_status: 'ACTIVE',
        stamp: `CREATED by ${userId} on ${new Date().toISOString()}`
      })
      .select()
      .single();
    if (error) throw error;
    return created;
  } catch (error) {
    console.error('createEmployee error:', error);
    throw error;
  }
}

export async function updateEmployee(empno, updates, userId) {
  try {
    const { data, error } = await supabase
      .from('employee')
      .update({
        ...updates,
        stamp: `UPDATED by ${userId} on ${new Date().toISOString()}`
      })
      .eq('empno', empno)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('updateEmployee error:', error);
    throw error;
  }
}

export async function softDeleteEmployee(empno, userId) {
  try {
    const { data, error } = await supabase
      .from('employee')
      .update({
        record_status: 'INACTIVE',
        stamp: `DEACTIVATED by ${userId} on ${new Date().toISOString()}`
      })
      .eq('empno', empno)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('softDeleteEmployee error:', error);
    throw error;
  }
}

export async function recoverEmployee(empno, userId) {
  try {
    const { data, error } = await supabase
      .from('employee')
      .update({
        record_status: 'ACTIVE',
        stamp: `RECOVERED by ${userId} on ${new Date().toISOString()}`
      })
      .eq('empno', empno)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('recoverEmployee error:', error);
    throw error;
  }
}
