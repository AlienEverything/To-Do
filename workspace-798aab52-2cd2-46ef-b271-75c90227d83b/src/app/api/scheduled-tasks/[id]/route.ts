import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT /api/scheduled-tasks/[id] - Update a scheduled task
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { title, date, startTime, endTime, priority, category, subject, recurring, recurringType, reminder, reminderTime, notes, color, completed } = await request.json();

    const task = await db.scheduledTask.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(date && { date: new Date(date) }),
        ...(startTime && { startTime }),
        ...(endTime && { endTime }),
        ...(priority && { priority }),
        ...(category && { category }),
        ...(subject !== undefined && { subject }),
        ...(recurring !== undefined && { recurring }),
        ...(recurringType && { recurringType }),
        ...(reminder !== undefined && { reminder }),
        ...(reminderTime && { reminderTime }),
        ...(notes !== undefined && { notes }),
        ...(color && { color }),
        ...(completed !== undefined && { completed })
      }
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating scheduled task:', error);
    return NextResponse.json({ error: 'Failed to update scheduled task' }, { status: 500 });
  }
}

// DELETE /api/scheduled-tasks/[id] - Delete a scheduled task
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    await db.scheduledTask.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Scheduled task deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheduled task:', error);
    return NextResponse.json({ error: 'Failed to delete scheduled task' }, { status: 500 });
  }
}