import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/database';
import Job from '@/models/job';

// Helper function to check if user is admin
async function isAdmin() {
  const session = await auth();
  return session?.user?.role === 'admin';
}

export async function GET(req: NextRequest) {
  try {
    // Check if user is admin
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 403 });
    }

    // Connect to database
    await connectToDatabase();

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';

    // Build query
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};

    // Search by title, company name, or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const total = await Job.countDocuments(query);

    // Get jobs with pagination and populate recruiter info
    const jobs = await Job.find(query)
      .populate('recruiter', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Return jobs with pagination metadata
    return NextResponse.json({
      jobs: jobs.map((job) => {
        const recruiterObj = typeof job.recruiter === 'object' && job.recruiter ? job.recruiter : null;
        return {
          id: job._id.toString(),
          title: job.title,
          description: job.description,
          companyName: job.companyName,
          location: job.location,
          skills: job.skills,
          expiryDate: job.expiryDate,
          urlId: job.urlId,
          isActive: job.isActive,
          createdAt: job.createdAt,
          recruiter: {
            id: recruiterObj ? (recruiterObj.id || recruiterObj._id)?.toString() : String(job.recruiter || ''),
            name: recruiterObj?.name || '',
            email: recruiterObj?.email || '',
          },
        };
      }),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
  }
}
