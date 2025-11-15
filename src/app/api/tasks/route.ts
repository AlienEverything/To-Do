import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/tasks - Get all tasks for a user
export async function GET(request: NextRequest) {
  try {
    // For now, we'll use a hardcoded user ID. In a real app, this would come from authentication
    const userId = "user_1";
    
    const tasks = await db.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: NextRequest) {
  try {
    const userId = "user_1";
    const { title, description, priority, xp, dueDate, category, subject } = await request.json();

    const task = await db.task.create({
      data: {
        title,
        description,
        priority: priority || 'MEDIUM',
        xp: xp || 10,
        dueDate: dueDate ? new Date(dueDate) : null,
        category: category || 'general',
        subject,
        userId
      }
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}