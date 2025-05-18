import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { connectToDatabase } from '@/lib/database/connection';
import User from '@/lib/database/models/User';
import Chapter from '@/lib/database/models/Chapter';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Connect to the database
    await connectToDatabase();

    // Get total members
    const totalMembers = await User.countDocuments({});

    // Get active members (non-alumni)
    const activeMembers = await User.countDocuments({
      'personal.isAlumni': false,
    });

    // Get total chapters
    const totalChapters = await Chapter.countDocuments({});

    // Get user counts by permissionLevel
    const adminCount = await User.countDocuments({
      'org.permissionLevel': 'admin',
    });
    const leadCount = await User.countDocuments({
      'org.permissionLevel': 'lead',
    });
    const memberCount = await User.countDocuments({
      'org.permissionLevel': 'member',
    });

    // Get user counts by track
    const quantCount = await User.countDocuments({ 'org.track': 'quant' });
    const valueCount = await User.countDocuments({ 'org.track': 'value' });
    const noTrackCount = await User.countDocuments({
      'org.track': { $exists: false },
    });

    // Get user counts by status
    const activeCount = await User.countDocuments({ 'org.status': 'active' });
    const inactiveCount = await User.countDocuments({
      'org.status': 'inactive',
    });
    const pendingCount = await User.countDocuments({ 'org.status': 'pending' });

    // Get user counts by alumni status
    const alumniCount = await User.countDocuments({
      'personal.isAlumni': true,
    });
    const currentStudentCount = await User.countDocuments({
      'personal.isAlumni': false,
    });

    // Get counts by track roles
    const trackRolesData = await User.aggregate([
      {
        $match: {
          'org.trackRoles': { $exists: true, $ne: [] },
        },
      },
      { $unwind: '$org.trackRoles' },
      { $group: { _id: '$org.trackRoles', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const trackRoles = trackRolesData.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get counts by exec roles
    const execRolesData = await User.aggregate([
      {
        $match: {
          'org.execRoles': { $exists: true, $ne: [] },
        },
      },
      { $unwind: '$org.execRoles' },
      { $group: { _id: '$org.execRoles', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const execRoles = execRolesData.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get user counts by graduation year (bucketed)
    const gradYearData = await User.aggregate([
      {
        $match: {
          'personal.gradYear': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: '$personal.gradYear',
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const gradYears = gradYearData.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<string, number>
    );

    // Calculate graduation year ranges
    const currentYear = new Date().getFullYear();
    const gradYearRanges = {
      past: await User.countDocuments({
        'personal.gradYear': { $lt: currentYear },
      }),
      current: await User.countDocuments({ 'personal.gradYear': currentYear }),
      next: await User.countDocuments({ 'personal.gradYear': currentYear + 1 }),
      future: await User.countDocuments({
        'personal.gradYear': { $gt: currentYear + 1 },
      }),
    };

    // Get user counts by chapter
    const chapterData = await User.aggregate([
      {
        $match: {
          'org.chapterId': { $exists: true },
        },
      },
      {
        $lookup: {
          from: 'chapters',
          localField: 'org.chapterId',
          foreignField: '_id',
          as: 'chapterInfo',
        },
      },
      {
        $group: {
          _id: {
            chapterId: '$org.chapterId',
            chapterName: { $arrayElemAt: ['$chapterInfo.name', 0] },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const chapterCounts = chapterData.reduce(
      (acc, item) => {
        const chapterName = item._id.chapterName || 'No Chapter';
        acc[chapterName] = item.count;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get top skills
    const skillsData = await User.aggregate([
      {
        $match: {
          'profile.skills': { $exists: true, $ne: [] },
        },
      },
      { $unwind: '$profile.skills' },
      { $group: { _id: '$profile.skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const topSkills = skillsData.reduce(
      (acc, item) => {
        acc[item._id] = item.count;
        return acc;
      },
      {} as Record<string, number>
    );

    // Get profile completion statistics
    const profileStats = {
      withBio: await User.countDocuments({
        'personal.bio': { $exists: true, $ne: '' },
      }),
      withLinkedin: await User.countDocuments({
        'profile.linkedin': { $exists: true, $ne: '' },
      }),
      withGithub: await User.countDocuments({
        'profile.github': { $exists: true, $ne: '' },
      }),
      withResume: await User.countDocuments({
        'profile.resumeUrl': { $exists: true, $ne: '' },
      }),
      withSkills: await User.countDocuments({
        'profile.skills.0': { $exists: true },
      }),
      withAvatar: await User.countDocuments({
        'profile.avatarUrl': { $exists: true, $ne: '' },
      }),
      withExperiences: await User.countDocuments({
        'profile.experiences.0': { $exists: true },
      }),
      withProjects: await User.countDocuments({
        'profile.projects.0': { $exists: true },
      }),
    };

    // Get activity stats
    const activeUsers = await User.countDocuments({
      'activity.lastLogin': {
        $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Count users who posted internships
    const postedInternships = await User.countDocuments({
      'activity.internshipsPosted': { $gt: 0 },
    });

    // Time-based metrics - joinDate distribution
    const joinDateData = await User.aggregate([
      {
        $match: {
          'org.joinDate': { $exists: true, $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$org.joinDate' },
            month: { $month: '$org.joinDate' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const joinDistribution = joinDateData.map(item => ({
      date: item._id
        ? `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
        : 'unknown',
      count: item.count,
    }));

    // New vs returning users
    const firstLoginUsers = await User.countDocuments({
      'system.firstLogin': true,
    });
    const returningUsers = await User.countDocuments({
      'system.firstLogin': false,
    });

    // Return comprehensive stats
    return NextResponse.json({
      totalMembers,
      activeMembers,
      totalChapters,
      byRole: {
        admin: adminCount,
        lead: leadCount,
        member: memberCount,
      },
      byTrack: {
        quant: quantCount,
        value: valueCount,
        none: noTrackCount,
      },
      byStatus: {
        active: activeCount,
        inactive: inactiveCount,
        pending: pendingCount,
      },
      byAlumniStatus: {
        alumni: alumniCount,
        current: currentStudentCount,
      },
      byTrackRoles: trackRoles,
      byExecRoles: execRoles,
      byGradYear: gradYears,
      gradYearRanges,
      byChapter: chapterCounts,
      topSkills,
      profileCompletion: profileStats,
      userActivity: {
        activeLastMonth: activeUsers,
        postedInternships,
      },
      joinTrends: joinDistribution,
      loginStatus: {
        firstLogin: firstLoginUsers,
        returning: returningUsers,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user stats' },
      { status: 500 }
    );
  }
}
