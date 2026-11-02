import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/database';
import Job from '@/models/job';
import { JobApplication } from '@/models/job-application';

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const data = await req.json();

    // Validate required fields
    if (!data.jobId || !data.userId || !data.resumeUrl || !data.resumeBase64 || !data.fileName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const applicationData = {
      jobId: data.jobId,
      userId: data.userId,
      ...(data.candidateName ? { candidateName: data.candidateName } : {}),
      ...(data.email ? { email: data.email } : {}),
      resumeUrl: data.resumeUrl,
      resumeBase64: data.resumeBase64,
      fileName: data.fileName,
      ...(data.s3Key ? { s3Key: data.s3Key } : {}),
      ...(data.s3Bucket ? { s3Bucket: data.s3Bucket } : {}),
      preferredLanguage: data.preferredLanguage || 'en',
      status: 'pending',
    };

    const jobApplication = await JobApplication.create(applicationData);

    return NextResponse.json(
      {
        success: true,
        application: {
          ...(jobApplication && typeof jobApplication.toJSON === 'function'
            ? jobApplication.toJSON()
            : jobApplication),
          resumeBase64: '**base64 data stored**',
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating job application:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'You must be logged in to access applications',
        },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');
    const requestedUserId = url.searchParams.get('userId');
    const id = url.searchParams.get('id');

    // If candidate, enforce scoped user ID
    const effectiveUserId =
      session.user.role === 'candidate' ? session.user.id : requestedUserId || session.user.id;

    // If requesting a specific application by ID
    if (id) {
      const application = await JobApplication.findById(id);

      if (!application) {
        return NextResponse.json(
          { success: false, message: 'Application not found' },
          { status: 404 }
        );
      }

      // Check access permission
      if (session.user.role === 'candidate' && application.userId !== session.user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      let job = null;
      if (application.jobId) {
        try {
          job = await Job.findById(application.jobId)
            .select('title companyName location urlId')
            .lean();
        } catch {
          // ignore
        }
      }

      return NextResponse.json({
        success: true,
        application: {
          ...(application && typeof application.toJSON === 'function'
            ? application.toJSON()
            : application),
          resumeBase64: '**base64 data stored**',
          job,
        },
      });
    }

    // Build filter for listing applications
    const filter: { jobId?: string; userId?: string } = {};
    if (jobId) filter.jobId = jobId;
    if (effectiveUserId) filter.userId = effectiveUserId;

    const jobApplications = await JobApplication.find(filter)
      .select({
        jobId: 1,
        userId: 1,
        fileName: 1,
        status: 1,
        resumeUrl: 1,
        preferredLanguage: 1,
        interviewState: 1,
        interviewEvaluation: 1,
        createdAt: 1,
        updatedAt: 1,
        'parsedResume.matchScore': 1,
        'parsedResume.matchedAt': 1,
        'parsedResume.skills': 1,
        'parsedResume.topSkillMatches': 1,
        'parsedResume.missingSkills': 1,
      })
      .sort({ createdAt: -1 });

    // Join job details in parallel for instant client rendering
    const enhancedApplications = await Promise.all(
      jobApplications.map(async (app) => {
        let job = null;
        if (app.jobId) {
          try {
            job = await Job.findById(app.jobId).select('title companyName location urlId').lean();
          } catch {
            // ignore
          }
        }

        return {
          ...(typeof app.toJSON === 'function' ? app.toJSON() : app),
          job: job
            ? {
                title: job.title || 'Unknown Job',
                companyName: job.companyName || 'Unknown Company',
                location: job.location || '',
                urlId: job.urlId || '',
              }
            : null,
        };
      })
    );

    return NextResponse.json({
      success: true,
      applications: enhancedApplications,
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}
