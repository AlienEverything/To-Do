import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/study-sessions - Get all study sessions for a user
export async function GET(request: NextRequest) {
  try {
    const userId = "user_1";
    
    const sessions = await db.studySession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(sessions);
  } catch (error) {
    console.error('Error fetching study sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch study sessions' }, { status: 500 });
  }
}

// POST /api/study-sessions - Create a new study session
export async function POST(request: NextRequest) {
  try {
    const userId = "user_1";
    const { subject, duration, notes, focusRating, difficulty } = await request.json();

    const xp = Math.floor(duration * 0.8); // 0.8 XP per minute of study

    const session = await db.studySession.create({
      data: {
        subject,
        duration,
        xp,
        notes,
        focusRating,
        difficulty,
        userId
      }
    });

    // Update user's total XP
    await db.user.update({
      where: { id: userId },
      data: {
        totalXP: {
          increment: xp
        }
      }
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Error creating study session:', error);
    return NextResponse.json({ error: 'Failed to create study session' }, { status: 500 });
  }
}