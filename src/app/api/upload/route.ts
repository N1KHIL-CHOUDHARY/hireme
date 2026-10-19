import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { DEFAULT_BUCKET, uploadToStorage } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to upload files',
        },
        { status: 401 }
      );
    }

    // Get form data with the file
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type (PDF only)
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const timestamp = new Date().getTime();
    const fileName = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
    const key = `resumes/${timestamp.toString().slice(0, 6)}/${fileName}`;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;

    // Convert file to buffer for Supabase Storage upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { publicUrl } = await uploadToStorage(key, buffer, file.type, bucketName);

    // Convert file to base64 for database storage
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    // Return success response with file info and key for generating signed URLs later
    return NextResponse.json({
      success: true,
      file: {
        url: publicUrl,
        fileName: fileName,
        base64: `data:${file.type};base64,${base64}`,
        key: key,
        bucket: bucketName,
      },
    });
  } catch (error) {
    console.error('Error uploading file to Supabase Storage:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
