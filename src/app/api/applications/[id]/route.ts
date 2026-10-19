import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/database';
import { createSignedStorageUrl, DEFAULT_BUCKET } from '@/lib/supabase';
import Job from '@/models/job';
import { JobApplication } from '@/models/job-application';

// Define common interfaces
interface MonitoringImage {
  s3Key: string;
  timestamp: Date;
  signedUrl?: string;
}

interface InterviewMessage {
  text: string;
  sender: 'ai' | 'user' | 'system';
  timestamp: Date;
  questionId?: string;
  questionCategory?: string;
  feedback?: string;
  audioS3Key?: string;
  audioS3Bucket?: string;
  audioUrl?: string;
}

// Helper function to add signed URLs to audio messages
async function addAudioSignedUrls(messages: InterviewMessage[], defaultBucket: string) {
  return await Promise.all(
    messages.map(async (message) => {
      if (message.audioS3Key) {
        try {
          const bucket = message.audioS3Bucket || defaultBucket;
          const signedUrl = await createSignedStorageUrl(message.audioS3Key, 3600, bucket);
          return {
            ...message,
            audioUrl: signedUrl,
          };
        } catch (err) {
          console.error('Error generating audio signed URL:', err);
          return message;
        }
      }
      return message;
    })
  );
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();

    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to access application data',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch application by ID
    const application = await JobApplication.findById(id);

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    const job = await Job.findById(application.jobId);

    // Get query parameter to include base64 data or not
    const url = new URL(req.url);
    const includeBase64 = url.searchParams.get('includeBase64') === 'true';

    // Generate signed URLs for files stored in Supabase Storage
    const appData = typeof application.toJSON === 'function' ? application.toJSON() : { ...application };
    const bucketName = appData.s3Bucket || process.env.SUPABASE_STORAGE_BUCKET || DEFAULT_BUCKET;

    // Process monitoring images if they exist
    if (appData.monitoringImages && appData.monitoringImages.length > 0) {
      const monitoringImagesWithUrls = await Promise.all(
        appData.monitoringImages.map(async (image: MonitoringImage) => {
          try {
            const signedUrl = await createSignedStorageUrl(image.s3Key, 3600, bucketName);
            return {
              ...image,
              signedUrl,
            };
          } catch (err) {
            console.error('Error generating monitoring image signed URL:', err);
            return image;
          }
        })
      );

      appData.monitoringImages = monitoringImagesWithUrls;
    }

    // Process interview chat history audio files if they exist
    if (appData.interviewChatHistory && appData.interviewChatHistory.length > 0) {
      appData.interviewChatHistory = await addAudioSignedUrls(
        appData.interviewChatHistory,
        bucketName
      );
    }

    // Generate signed URL for resume if s3Key exists
    if (appData.s3Key) {
      try {
        const signedResumeUrl = await createSignedStorageUrl(appData.s3Key, 3600, bucketName);
        appData.signedResumeUrl = signedResumeUrl;
      } catch (err) {
        console.error('Error generating resume signed URL:', err);
      }
    }

    // Return application data with updated URLs
    const response = {
      success: true,
      application: {
        ...appData,
        resumeBase64: includeBase64 ? appData.resumeBase64 : '**base64 data stored**',
        job: job,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching application:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch application details' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase();

    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to update application data',
        },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Find the application
    const application = await JobApplication.findById(id);

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    // Get request body
    const data = await req.json();

    // Only allow specific fields to be updated
    const allowedUpdates = {
      ...(data.status ? { status: data.status } : {}),
    };

    // Update application
    const updatedApplication = await JobApplication.findByIdAndUpdate(
      id,
      { $set: allowedUpdates },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully',
      application: updatedApplication,
    });
  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update application' },
      { status: 500 }
    );
  }
}
