import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/database';
import { DEFAULT_BUCKET, uploadToStorage } from '@/lib/supabase';
import { JobApplication } from '@/models/job-application';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image, timestamp } = await request.json();

    // Convert base64 to buffer
    const buffer = Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    // Generate unique key
    const key = `monitoring/${id}/${uuidv4()}.jpg`;
    const bucketName = process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;

    // Upload to Supabase Storage
    await uploadToStorage(key, buffer, 'image/jpeg', bucketName);

    // Update application document
    await connectToDatabase();
    await JobApplication.updateOne(
      { _id: id },
      {
        $push: {
          monitoringImages: {
            s3Key: key,
            timestamp: new Date(timestamp),
          },
        },
      }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error uploading monitoring image to Supabase:', error);
    return NextResponse.json({ error: 'Failed to upload monitoring image' }, { status: 500 });
  }
}
