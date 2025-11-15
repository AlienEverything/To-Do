import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/user/stats - Get user statistics
export async function GET(request: NextRequest) {
  try {
    const userId = "user_1";
    
    // Get user info
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        tasks: {
          where: { completed: true }
        },
        studySessions: true,
        pomodoroSessions: {
          where: { completed: true }
        }
      }
    });

    if (!user) {
      // Create user if doesn't exist
      const newUser = await db.user.create({
        data: {
          id: userId,
          email: "user@example.com",
          name: "Study User"
        }
      });
      
      return NextResponse.json({
        level: newUser.level,
        totalXP: newUser.totalXP,
        currentLevelXP: 0,
        nextLevelXP: 500,
        streak: newUser.streak,
        totalStudyTime: 0,
        completedTasks: 0,
        pomodoroSessions: 0
      });
    }

    // Calculate stats
    const totalStudyTime = user.studySessions.reduce((sum, session) => sum + session.duration, 0) +
                         user.pomodoroSessions.reduce((sum, session) => sum + session.duration, 0);

    const nextLevelXP = user.level * 500; // Simple formula: 500 XP per level
    const currentLevelXP = user.totalXP % nextLevelXP;

    return NextResponse.json({
      level: user.level,
      totalXP: user.totalXP,
      currentLevelXP,
      nextLevelXP,
      streak: user.streak,
      totalStudyTime,
      completedTasks: user.tasks.length,
      pomodoroSessions: user.pomodoroSessions.length
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
  }
}

// PUT /api/user/stats - Update user statistics
export async function PUT(request: NextRequest) {
  try {
    const userId = "user_1";
    const { xp, level, streak } = await request.json();

    const user = await db.user.update({
      where: { id: userId },
      data: {
        ...(xp !== undefined && { totalXP: xp }),
        ...(level !== undefined && { level }),
        ...(streak !== undefined && { streak })
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user stats:', error);
    return NextResponse.json({ error: 'Failed to update user stats' }, { status: 500 });
  }
}