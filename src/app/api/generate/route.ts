import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';
import { ChatCompletionMessageParam } from 'openai/resources/chat';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, content, feedback, blogId } = body;

    // First, verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: body.userId }
    });

    if (!user) {
      return new NextResponse(
        JSON.stringify({
          content: '',
          error: 'User not found'
        }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get previous conversation history if blogId exists
    let conversationHistory: ChatCompletionMessageParam[] = [];
    if (blogId) {
      const previousVersions = await prisma.version.findMany({
        where: { blogId },
        orderBy: { timestamp: 'asc' }
      });

      conversationHistory = previousVersions.map(version => ([
        { role: "user" as const, content: version.userPrompt || '' },
        { role: "assistant" as const, content: version.aiResponse || version.content }
      ])).flat();
    }

    // Create the prompt based on whether it's feedback or initial generation
    const prompt = feedback 
      ? `Improve this blog post based on the feedback: ${feedback}\n\nOriginal post: ${content}`
      : `Write a blog post about: ${topic}`;

    // Construct messages array with history
    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: "You are a professional blog post writer. Write a well-structured, engaging blog post about the given topic. When asked to improve, maintain the overall structure while incorporating the requested changes."
      },
      ...conversationHistory,
      {
        role: "user",
        content: prompt
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const generatedContent = completion.choices[0]?.message?.content || '';

    if (blogId && feedback) {
      // Create a new version when feedback is given
      await prisma.version.create({
        data: {
          blogId,
          content: generatedContent,
          feedback,
          userPrompt: prompt,
          aiResponse: generatedContent,
          timestamp: new Date(),
        }
      });
    } else if (!blogId) {
      // Create initial blog and version
      await prisma.blog.create({
        data: {
          topic,
          userId: user.id,
          versions: {
            create: {
              content: generatedContent,
              userPrompt: prompt,
              aiResponse: generatedContent,
              timestamp: new Date(),
            }
          }
        }
      });
    }

    return new NextResponse(
      JSON.stringify({
        content: generatedContent,
        error: null
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Generation error:', error);
    return new NextResponse(
      JSON.stringify({
        content: '',
        error: error instanceof Error ? error.message : 'Failed to generate content'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}