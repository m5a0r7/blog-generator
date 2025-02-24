import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { blogId, content, type } = await request.json();

    const savedFeedback = await prisma.feedback.create({
      data: {
        content,
        type,
        blogId,
        timestamp: new Date(),
      }
    });

    return NextResponse.json({ success: true, feedback: savedFeedback });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
  }
} 