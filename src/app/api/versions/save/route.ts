import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { blogId, content, feedback, userPrompt, aiResponse } = body;

    // Create new version
    const newVersion = await prisma.version.create({
      data: {
        blogId,
        content,
        feedback,
        improvementPrompt: userPrompt,
        aiResponse,
        timestamp: new Date(),
      }
    });

    // Fetch updated blog with all versions
    const updatedBlog = await prisma.blog.findUnique({
      where: { id: blogId },
      include: {
        versions: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      version: newVersion,
      blog: updatedBlog
    });
  } catch (error) {
    console.error('Error saving version:', error);
    return NextResponse.json(
      { error: 'Failed to save version' },
      { status: 500 }
    );
  }
} 