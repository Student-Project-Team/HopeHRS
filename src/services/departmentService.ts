import { supabase } from '../lib/supabase';
import { makeStamp } from '../utils/stamp';
import { Department, CreateDepartmentData, UpdateDepartmentData } from '../types/department';

export async function getAllDepartments(userType: 'USER' | 'ADMIN' | 'SUPERADMIN') {
  try {
    let query = supabase.from('department').select('*').order('deptCode');
    
    if (userType === 'USER') {
      query = query.eq('record_status', 'ACTIVE');
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return { data: data as Department[], error: null };
  } catch (error) {
    console.error('Error fetching departments:', error);
    return { data: null, error };
  }
}

export async function getDepartmentById(deptCode: string) {
  try {
    const { data, error } = await supabase
      .from('department')
      .select('*')
      .eq('deptCode', deptCode)
      .single();
    
    if (error) throw error;
    return { data: data as Department, error: null };
  } catch (error) {
    console.error('Error fetching department:', error);
    return { data: null, error };
  }
}

export async function createDepartment(data: CreateDepartmentData, userId: string) {
  try {
    const { data: existing } = await supabase
      .from('department')
      .select('deptCode')
      .eq('deptCode', data.deptCode)
      .maybeSingle();
    
    if (existing) {
      throw new Error('Department code already exists');
    }
    
    const newDept = {
      ...data,
      record_status: 'ACTIVE',
      stamp: makeStamp('CREATED', userId)
    };
    
    const { data: result, error } = await supabase
      .from('department')
      .insert([newDept])
      .select()
      .single();
    
    if (error) throw error;
    return { data: result as Department, error: null };
  } catch (error) {
    console.error('Error creating department:', error);
    return { data: null, error };
  }
}

export async function updateDepartment(deptCode: string, updates: UpdateDepartmentData, userId: string) {
  try {
    const updateData = {
      ...updates,
      stamp: makeStamp('UPDATED', userId)
    };
    
    const { data, error } = await supabase
      .from('department')
      .update(updateData)
      .eq('deptCode', deptCode)
      .select()
      .single();
    
    if (error) throw error;
    return { data: data as Department, error: null };
  } catch (error) {
    console.error('Error updating department:', error);
    return { data: null, error };
  }
}

export async function softDeleteDepartment(deptCode: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('department')
      .update({
        record_status: 'INACTIVE',
        stamp: makeStamp('DEACTIVATED', userId)
      })
      .eq('deptCode', deptCode)
      .select()
      .single();
    
    if (error) throw error;
    return { data: data as Department, error: null };
  } catch (error) {
    console.error('Error deleting department:', error);
    return { data: null, error };
  }
}

export async function recoverDepartment(deptCode: string, userId: string) {
  try {
    const { data, error } = await supabase
      .from('department')
      .update({
        record_status: 'ACTIVE',
        stamp: makeStamp('RECOVERED', userId)
      })
      .eq('deptCode', deptCode)
      .select()
      .single();
    
    if (error) throw error;
    return { data: data as Department, error: null };
  } catch (error) {
    console.error('Error recovering department:', error);
    return { data: null, error };
  }
}
