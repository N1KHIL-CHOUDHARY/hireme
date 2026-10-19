import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { createSignedStorageUrl, DEFAULT_BUCKET } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to access files',
        },
        { status: 401 }
      );
    }

    // Get file key and bucket from request
    const { key, bucket } = await req.json();

    if (!key) {
      return NextResponse.json(
        {
          error: 'Bad Request',
          message: 'File key is required',
        },
        { status: 400 }
      );
    }

    const bucketName = bucket || process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;

    // Generate a signed URL that expires in 15 minutes (900 seconds)
    const signedUrl = await createSignedStorageUrl(key, 900, bucketName);

    // Return the signed URL
    return NextResponse.json({
      success: true,
      signedUrl,
    });
  } catch (error) {
    console.error('Error generating signed URL from Supabase:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Failed to generate signed URL',
      },
      { status: 500 }
    );
  }
}
