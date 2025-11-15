import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/scheduled-tasks - Get all scheduled tasks for a user
export async function GET(request: NextRequest) {
  try {
    const userId = "user_1";
    
    const tasks = await db.scheduledTask.findMany({
      where: { userId },
      orderBy: { date: 'asc' }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching scheduled tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch scheduled tasks' }, { status: 500 });
  }
}

// POST /api/scheduled-tasks - Create a new scheduled task
export async function POST(request: NextRequest) {
  try {
    const userId = "user_1";
    const { title, date, startTime, endTime, priority, category, subject, recurring, recurringType, reminder, reminderTime, notes, color } = await request.json();

    const task = await db.scheduledTask.create({
      data: {
        title,
        date: new Date(date),
        startTime,
        endTime,
        priority: priority || 'MEDIUM',
        category: category || 'general',
        subject,
        recurring: recurring || false,
        recurringType: recurringType || 'daily',
        reminder: reminder || false,
        reminderTime: reminderTime || '15',
        notes,
        color: color || '#3b82f6',
        userId
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating scheduled task:', error);
    return NextResponse.json({ error: 'Failed to create scheduled task' }, { status: 500 });
  }
}