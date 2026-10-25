import { v4 as uuidv4 } from 'uuid';
import { createSignedStorageUrl, DEFAULT_BUCKET, uploadToStorage } from './supabase';

/**
 * Uploads an audio buffer to Supabase Storage
 * @param audioBuffer The audio buffer to upload
 * @param applicationId The application ID to associate the audio with
 * @returns The storage key of the uploaded audio file
 */
export async function uploadAudioToS3(
  audioBuffer: Buffer,
  applicationId: string
): Promise<{
  s3Key: string;
  s3Bucket: string;
}> {
  try {
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;

    // Generate a unique filename with timestamp
    const timestamp = new Date().getTime();
    const randomId = uuidv4().substring(0, 8);
    const key = `audio/${applicationId}/${timestamp}-${randomId}.mp3`;

    // Upload to Supabase Storage
    await uploadToStorage(key, audioBuffer, 'audio/mpeg', bucketName);

    return {
      s3Key: key,
      s3Bucket: bucketName,
    };
  } catch (error) {
    console.error('Error uploading audio to Supabase Storage:', error);
    throw error;
  }
}

/**
 * Generates a signed URL for a stored audio file
 * @param s3Key The storage key of the audio file
 * @param s3Bucket The bucket containing the audio file
 * @returns The signed URL for the audio file
 */
export async function getAudioSignedUrl(s3Key: string, s3Bucket?: string): Promise<string> {
  try {
    const bucketName = s3Bucket || process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;
    const signedUrl = await createSignedStorageUrl(s3Key, 3600, bucketName);
    return signedUrl;
  } catch (error) {
    console.error('Error generating audio signed URL from Supabase:', error);
    throw error;
  }
}
