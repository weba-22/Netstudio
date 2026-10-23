import { createClient, SupabaseClient } from '@supabase/supabase-js';
import path from 'path';
import fs from 'fs';

let supabaseInstance: SupabaseClient | null = null;
let hasCheckedCredentials = false;
let hasValidCredentials = false;

function checkHasCredentials(): boolean {
  if (hasCheckedCredentials) return hasValidCredentials;
  hasCheckedCredentials = true;

  // For Supabase, we check if the URL and key are configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    hasValidCredentials = true;
    return true;
  }

  hasValidCredentials = false;
  return false;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!checkHasCredentials()) {
    // Avoid calling Supabase when not configured
    return null;
  }

  if (supabaseInstance) {
    return supabaseInstance;
  }

  try {
    // Create Supabase client with service role for admin operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return null;
    }

    supabaseInstance = createClient(supabaseUrl, supabaseServiceRoleKey);
    return supabaseInstance;
  } catch (err) {
    return null;
  }
}

