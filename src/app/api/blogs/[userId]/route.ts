import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get userId from URL
    const userId = request.url.split('/').pop();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 });
    }

    // Add debug log
    console.log('Fetching blogs for userId:', userId);

    const blogs = await prisma.blog.findMany({
      where: { userId },
      include: {
        versions: {
          orderBy: { timestamp: 'desc' }
        },
        feedback: {
          orderBy: { timestamp: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Add debug log
    console.log('Found blogs with versions:', blogs.map(blog => ({
      id: blog.id,
      versionsCount: blog.versions.length,
      versions: blog.versions
    })));

    return new Response(JSON.stringify({ blogs }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return new Response(JSON.stringify({ 
      blogs: [], 
      error: 'Failed to fetch blogs' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
