import { supabase } from '../lib/supabase';
import { makeStamp } from '../utils/stamp';
import type { Employee, CreateEmployeeData, UpdateEmployeeData } from '../types/employee';

/**
* Returns all ACTIVE employees for USER, or all employees for
ADMIN/SUPERADMIN.
*/
export async function getAllEmployees(
  userType: 'USER' | 'ADMIN' | 'SUPERADMIN'
): Promise<Employee[]> {
  try {
    let query = supabase.from('employee').select('*');
    if (userType === 'USER') {
      query = query.eq('record_status', 'ACTIVE');
    }
    const { data, error } = await query;
    if (error) throw error;
    return data as Employee[];
  } catch (error) {
    console.error('getAllEmployees error:', error);
    throw error;
  }
}

/**
* Fetches a single employee by empno (VARCHAR PK).
*/
export async function getEmployeeById(empno: string): Promise<Employee | null> {
  try {
    const { data, error } = await supabase
      .from('employee')
      .select('*')
      .eq('empno', empno)
      .single();

    if (error) throw error;
    return data as Employee;
  } catch (error) {
    console.error('getEmployeeById error:', error);
    throw error;
  }
}

/**
* Creates a new employee record.
* Requires EMP_ADD right — enforce on the calling layer.
*/
export async function createEmployee(data: CreateEmployeeData): Promise<Employee> {
  try {
    const { data: created, error } = await supabase
      .from('employee')
      .insert({
        ...data,
        record_status: 'ACTIVE',
        stamp: null,
      })
      .select()
      .single();
    if (error) throw error;
    return created as Employee;
  } catch (error) {
    console.error('createEmployee error:', error);
    throw error;
  }
}

/**
* Updates an existing employee by empno.
* Requires EMP_EDIT right — enforce on the calling layer.
*/
export async function updateEmployee(
  empno: string,
  updates: UpdateEmployeeData
): Promise<Employee> {
  try {
    const { data, error } = await supabase
      .from('employee')
      .update(updates)
      .eq('empno', empno)
      .select()
      .single();
    if (error) throw error;
    return data as Employee;
  } catch (error) {
    console.error('updateEmployee error:', error);
    throw error;
  }
}

/**
* Soft-deletes an employee: sets record_status = 'INACTIVE' and generates a stamp.
* Requires EMP_DEL right — SUPERADMIN only; enforce on the calling layer.
*/
export async function softDeleteEmployee(
  empno: string,
  userId: string
): Promise<Employee> {
  try {
    const stamp = makeStamp('DEACTIVATED', userId);
    const { data, error } = await supabase
      .from('employee')
      .update({ record_status: 'INACTIVE', stamp })
      .eq('empno', empno)
      .select()
      .single();
    if (error) throw error;
    return data as Employee;
  } catch (error) {
    console.error('softDeleteEmployee error:', error);
    throw error;
  }
}

/**
* Recovers a soft-deleted employee: sets record_status = 'ACTIVE' and generates a stamp.
* ADMIN/SUPERADMIN only — enforce on the calling layer.
*/
export async function recoverEmployee(
  empno: string,
  userId: string
): Promise<Employee> {
  try {
    const stamp = makeStamp('RECOVERED', userId);
    const { data, error } = await supabase
      .from('employee')
      .update({ record_status: 'ACTIVE', stamp })
      .eq('empno', empno)
      .select()
      .single();
    if (error) throw error;
    return data as Employee;
  } catch (error) {
    console.error('recoverEmployee error:', error);
    throw error;
  }
}