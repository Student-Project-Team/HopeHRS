import { supabase } from '../lib/supabase';

/**
 * Get all users for Admin Module
 * Returns all users from the 'users' table
 * SUPERADMIN rows are visible but protected from modification
 */
export async function getUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('email');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('getUsers error:', error);
    throw error;
  }
}

/**
 * Get a single user by email
 */
export async function getUserByEmail(email) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('getUserByEmail error:', error);
    throw error;
  }
}

/**
 * Activate a user account
 * Sets record_status = 'ACTIVE'
 * BLOCKED for SUPERADMIN accounts
 */
export async function activateUser(email, currentUserEmail) {
  try {
    // First, check if target user is SUPERADMIN
    const { data: targetUser, error: checkError } = await supabase
      .from('users')
      .select('user_type')
      .eq('email', email)
      .single();

    if (checkError) throw checkError;

    // BLOCK: Cannot modify SUPERADMIN accounts
    if (targetUser?.user_type === 'SUPERADMIN') {
      throw new Error('SUPERADMIN accounts cannot be modified');
    }

    // Check if current user has permission (ADM_USER right)
    const { data: currentUser, error: permError } = await supabase
      .from('users')
      .select('user_type')
      .eq('email', currentUserEmail)
      .single();

    if (permError) throw permError;

    // Only ADMIN and SUPERADMIN can activate users
    if (currentUser?.user_type !== 'ADMIN' && currentUser?.user_type !== 'SUPERADMIN') {
      throw new Error('You do not have permission to activate users');
    }

    const stamp = `ACTIVATED by ${currentUserEmail} on ${new Date().toISOString()}`;

    const { data, error } = await supabase
      .from('users')
      .update({ 
        record_status: 'ACTIVE',
        stamp: stamp
      })
      .eq('email', email)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('activateUser error:', error);
    throw error;
  }
}

/**
 * Deactivate a user account
 * Sets record_status = 'INACTIVE'
 * BLOCKED for SUPERADMIN accounts
 */
export async function deactivateUser(email, currentUserEmail) {
  try {
    // First, check if target user is SUPERADMIN
    const { data: targetUser, error: checkError } = await supabase
      .from('users')
      .select('user_type')
      .eq('email', email)
      .single();

    if (checkError) throw checkError;

    // BLOCK: Cannot modify SUPERADMIN accounts
    if (targetUser?.user_type === 'SUPERADMIN') {
      throw new Error('SUPERADMIN accounts cannot be modified');
    }

    // Check if current user has permission (ADM_USER right)
    const { data: currentUser, error: permError } = await supabase
      .from('users')
      .select('user_type')
      .eq('email', currentUserEmail)
      .single();

    if (permError) throw permError;

    // Only ADMIN and SUPERADMIN can deactivate users
    if (currentUser?.user_type !== 'ADMIN' && currentUser?.user_type !== 'SUPERADMIN') {
      throw new Error('You do not have permission to deactivate users');
    }

    const stamp = `DEACTIVATED by ${currentUserEmail} on ${new Date().toISOString()}`;

    const { data, error } = await supabase
      .from('users')
      .update({ 
        record_status: 'INACTIVE',
        stamp: stamp
      })
      .eq('email', email)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('deactivateUser error:', error);
    throw error;
  }
}

/**
 * Change user type (ADMIN, USER)
 * BLOCKED for SUPERADMIN accounts
 * BLOCKED from changing to/from SUPERADMIN
 */
export async function changeUserType(email, newUserType, currentUserEmail) {
  try {
    // Validate newUserType
    if (newUserType !== 'ADMIN' && newUserType !== 'USER') {
      throw new Error('Invalid user type. Allowed values: ADMIN, USER');
    }

    // First, check if target user is SUPERADMIN
    const { data: targetUser, error: checkError } = await supabase
      .from('users')
      .select('user_type')
      .eq('email', email)
      .single();

    if (checkError) throw checkError;

    // BLOCK: Cannot modify SUPERADMIN accounts at all
    if (targetUser?.user_type === 'SUPERADMIN') {
      throw new Error('SUPERADMIN accounts cannot be modified');
    }

    // Check current user permission
    const { data: currentUser, error: permError } = await supabase
      .from('users')
      .select('user_type')
      .eq('email', currentUserEmail)
      .single();

    if (permError) throw permError;

    // Only SUPERADMIN can change user types
    if (currentUser?.user_type !== 'SUPERADMIN') {
      throw new Error('Only SUPERADMIN can change user types');
    }

    const stamp = `USER_TYPE_CHANGED from ${targetUser?.user_type} to ${newUserType} by ${currentUserEmail} on ${new Date().toISOString()}`;

    const { data, error } = await supabase
      .from('users')
      .update({ 
        user_type: newUserType,
        stamp: stamp
      })
      .eq('email', email)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('changeUserType error:', error);
    throw error;
  }
}
