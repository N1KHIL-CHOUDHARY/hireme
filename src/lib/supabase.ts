import { createClient, SupabaseClient } from '@supabase/supabase-js';

const stripQuotes = (val?: string) => (val || '').trim().replace(/^["']|["']$/g, '');

const supabaseUrl = stripQuotes(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co');
const supabaseAnonKey = stripQuotes(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder');
const supabaseServiceKey = stripQuotes(process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey);

export const DEFAULT_BUCKET = stripQuotes(process.env.SUPABASE_STORAGE_BUCKET) || 'hirelytics';

// Client for public operations (can be used in client components)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client using service role key (bypasses RLS, for server-side API routes & actions)
let _supabaseAdmin: SupabaseClient | null = null;
export function getSupabaseAdmin(): SupabaseClient {
  if (!_supabaseAdmin) {
    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn(
        'Supabase URL or Key is missing. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env'
      );
    }
    _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _supabaseAdmin;
}

export const supabaseAdmin = getSupabaseAdmin();

/**
 * Upload a file to Supabase Storage
 */
export async function uploadToStorage(
  path: string,
  data: Buffer | ArrayBuffer | Blob | Uint8Array,
  contentType: string,
  bucketName: string = DEFAULT_BUCKET
): Promise<{ path: string; bucket: string; publicUrl: string }> {
  const client = getSupabaseAdmin();

  const { error } = await client.storage.from(bucketName).upload(path, data, {
    contentType,
    upsert: true,
  });

  if (error) {
    console.error(`Error uploading to Supabase Storage (${bucketName}/${path}):`, error);
    throw new Error(`Failed to upload to Supabase storage: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = client.storage.from(bucketName).getPublicUrl(path);

  return {
    path,
    bucket: bucketName,
    publicUrl,
  };
}

/**
 * Generate a signed URL for a file in Supabase Storage
 */
export async function createSignedStorageUrl(
  path: string,
  expiresInSeconds: number = 3600,
  bucketName: string = DEFAULT_BUCKET
): Promise<string> {
  const client = getSupabaseAdmin();
  const cleanPath = path.trim().replace(/^\/+/, '');

  const { data, error } = await client.storage
    .from(bucketName)
    .createSignedUrl(cleanPath, expiresInSeconds);

  if (error) {
    console.error(`Error generating signed URL for ${bucketName}/${cleanPath}:`, error);
    // Fallback to public URL if signed URL generation fails (e.g. public bucket)
    const {
      data: { publicUrl },
    } = client.storage.from(bucketName).getPublicUrl(cleanPath);
    return publicUrl;
  }

  return data.signedUrl;
}

/**
 * Download a file from Supabase Storage
 */
export async function downloadFromStorage(
  path: string,
  bucketName: string = DEFAULT_BUCKET
): Promise<Buffer> {
  const client = getSupabaseAdmin();
  const cleanPath = path.trim().replace(/^\/+/, '');

  const { data, error } = await client.storage.from(bucketName).download(cleanPath);

  if (error || !data) {
    console.error(`Error downloading from Supabase Storage (${bucketName}/${cleanPath}):`, error);
    throw new Error(`Failed to download file from Supabase storage: ${error?.message || 'File not found'}`);
  }

  const arrayBuffer = await data.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Check if the Supabase Storage bucket exists and is accessible
 */
export async function checkStorageBucketAccess(bucketName: string = DEFAULT_BUCKET): Promise<boolean> {
  try {
    const client = getSupabaseAdmin();
    const { data: buckets, error } = await client.storage.listBuckets();

    if (error) {
      console.error(`Failed to list Supabase storage buckets: ${error.message}`);
      return false;
    }

    const bucketExists = buckets?.some((b) => b.name === bucketName || b.id === bucketName);
    if (!bucketExists) {
      // Try creating bucket if it doesn't exist
      const { error: createError } = await client.storage.createBucket(bucketName, {
        public: true,
      });
      if (createError) {
        console.warn(`Could not create bucket '${bucketName}':`, createError.message);
      } else {
        console.log(`✅ Created Supabase bucket '${bucketName}'`);
        return true;
      }
    }

    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to check bucket '${bucketName}':`, message);
    return false;
  }
}

