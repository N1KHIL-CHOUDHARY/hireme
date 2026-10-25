/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabaseAdmin } from './supabase';
import { JobApplication } from '@/models/job-application';

/**
 * Modern database connection helper for Supabase
 */
export async function connectToDatabase() {
  return getSupabaseAdmin();
}

/**
 * Helper to safely update document with retry mechanism
 */
export async function safeDatabaseUpdate(
  applicationId: string,
  updateObj: any,
  options = { retries: 1, logPrefix: '[Database]' }
): Promise<any> {
  try {
    const result = await JobApplication.findByIdAndUpdate(applicationId, updateObj, { new: true });

    if (!result) {
      console.error(`${options.logPrefix} Update failed for application`, {
        applicationId,
      });
      return null;
    }

    return result;
  } catch (error: any) {
    console.error(`${options.logPrefix} Error during update:`, {
      error: error.message,
      applicationId,
    });

    if (options.retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return safeDatabaseUpdate(applicationId, updateObj, {
        ...options,
        retries: options.retries - 1,
      });
    }

    throw error;
  }
}

// Backward-compatible alias
export const safeMongoUpdate = safeDatabaseUpdate;

export function getDatabaseConnectionStatus() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isConnected = !!(url && key);

  return {
    isConnected,
    readyState: isConnected ? 1 : 0,
    status: isConnected ? 'connected' : 'disconnected',
  };
}

export const getMongoConnectionStatus = getDatabaseConnectionStatus;

export default connectToDatabase;
