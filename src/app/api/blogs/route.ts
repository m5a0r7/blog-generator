import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const blogs = await prisma.blog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        versions: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });

    return NextResponse.json({ blogs });
  } catch {
    return NextResponse.json({ 
      blogs: [], 
      error: 'Failed to fetch blogs' 
    }, { status: 500 });
  }
} 

