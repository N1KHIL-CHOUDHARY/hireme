import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { connectToDatabase } from '@/lib/database';
import Job from '@/models/job';
import { JobApplication } from '@/models/job-application';
import User from '@/models/user';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { role, id: userId } = session.user;

    // Common statistics for all dashboards
    const totalJobs = await Job.countDocuments({ isActive: true }).catch(() => 0);
    const totalCandidates = await User.countDocuments({
      role: 'candidate',
      isActive: true,
    }).catch(() => 0);
    const totalRecruiters = await User.countDocuments({
      role: 'recruiter',
      isActive: true,
    }).catch(() => 0);

    // Role-specific data
    switch (role) {
      case 'admin': {
        const recentJobsAdmin = await Job.find({ isActive: true })
          .sort({ createdAt: -1 })
          .limit(5)
          .populate('recruiter', 'name')
          .catch(() => []);

        const applicationStatusData = await JobApplication.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]).catch(() => []);

        const jobsPerRecruiter = await Job.aggregate([
          { $match: { isActive: true } },
        ]).catch(() => []);

        return NextResponse.json({
          totalJobs,
          totalCandidates,
          totalRecruiters,
          recentJobs: recentJobsAdmin,
          applicationStatusData,
          jobsPerRecruiter,
        });
      }

      case 'recruiter': {
        const myJobs = await Job.countDocuments({
          recruiter: userId,
          isActive: true,
        }).catch(() => 0);

        const recruiterJobs = await Job.find({
          recruiter: userId,
          isActive: true,
        }).catch(() => []);
        const jobIdStrings = recruiterJobs.map((job: any) => job._id.toString());

        const totalApplications = await JobApplication.countDocuments({
          jobId: { $in: jobIdStrings },
        }).catch(() => 0);

        const applicationsByStatus = await JobApplication.aggregate([
          { $match: { jobId: { $in: jobIdStrings } } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]).catch(() => []);

        const recentApplications = await JobApplication.aggregate([
          { $match: { jobId: { $in: jobIdStrings } } },
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'jobs',
              localField: 'jobId',
              foreignField: '_id',
              as: 'jobInfo',
            },
          },
        ]).catch(() => []);

        return NextResponse.json({
          myJobs,
          totalApplications,
          applicationsByStatus,
          recentApplications,
        });
      }

      case 'candidate': {
        const myApplicationsCount = await JobApplication.countDocuments({
          userId: userId,
        }).catch(() => 0);

        const myApplicationsByStatus = await JobApplication.aggregate([
          { $match: { userId: userId } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]).catch(() => []);

        const recentJobsCandidate = await Job.find({ isActive: true })
          .sort({ createdAt: -1 })
          .limit(5)
          .catch(() => []);

        const myRecentApplications = await JobApplication.aggregate([
          { $match: { userId: userId } },
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'jobs',
              localField: 'jobId',
              foreignField: '_id',
              as: 'jobInfo',
            },
          },
        ]).catch(() => []);

        return NextResponse.json({
          myApplicationsCount,
          myApplicationsByStatus,
          recentJobs: recentJobsCandidate,
          myRecentApplications,
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard statistics' }, { status: 500 });
  }
}
