import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get userId from the URL params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400 });
    }

    // Fetch blogs for the userId
    const blogs = await prisma.blog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        versions: {
          orderBy: { timestamp: 'desc' }
        }
      }
    });

    return new Response(JSON.stringify({ blogs }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ 
      blogs: [], 
      error: 'Failed to fetch blogs' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
