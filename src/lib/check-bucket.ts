import { checkStorageBucketAccess, DEFAULT_BUCKET } from '@/lib/supabase';

export const checkBucketAccess = async () => {
  try {
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;
    console.log(`Checking access to Supabase bucket: ${bucketName}...`);

    const hasAccess = await checkStorageBucketAccess(bucketName);

    if (hasAccess) {
      console.log(`✅ Successfully connected to Supabase bucket: ${bucketName}`);
      return true;
    } else {
      console.error(`❌ Failed to access Supabase bucket: ${bucketName}`);
      return false;
    }
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error(`❌ Failed to access Supabase bucket: ${error.message}`);
    return false;
  }
};
