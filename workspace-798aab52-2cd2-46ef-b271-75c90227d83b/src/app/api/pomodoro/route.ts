import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/pomodoro - Get all pomodoro sessions for a user
export async function GET(request: NextRequest) {
  try {
    const userId = "user_1";
    
    const sessions = await db.pomodoroSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching pomodoro sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch pomodoro sessions' }, { status: 500 });
  }
}

// POST /api/pomodoro - Create a new pomodoro session
export async function POST(request: NextRequest) {
  try {
    const userId = "user_1";
    const { duration, isBreak, sessionType } = await request.json();

    // Only award XP for work sessions, not breaks
    const xp = isBreak ? 0 : Math.floor(duration * 1); // 1 XP per minute of focused work

    const session = await db.pomodoroSession.create({
      data: {
        duration,
        isBreak: isBreak || false,
        sessionType: sessionType || (isBreak ? 'short_break' : 'work'),
        xp,
        completed: true,
        completedAt: new Date(),
        userId
      }
    });

    // Update user's total XP if it's a work session
    if (!isBreak && xp > 0) {
      await db.user.update({
        where: { id: userId },
        data: {
          totalXP: {
            increment: xp
          }
        }
      });
    }

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating pomodoro session:', error);
    return NextResponse.json({ error: 'Failed to create pomodoro session' }, { status: 500 });
  }
}