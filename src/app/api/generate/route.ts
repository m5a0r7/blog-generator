import { NextResponse } from 'next/server';
import OpenAI from 'openai/index.mjs';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { topic, userId, feedback, blogId } = body;

    const prompt = feedback 
      ? `Improve this blog post based on the feedback: ${feedback}`
      : `Write a blog post about: ${topic}`;

    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a professional blog post writer. Write a well-structured, engaging blog post about the given topic."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const generatedContent = completion.choices[0]?.message?.content || '';

    if (userId && generatedContent) {
      if (blogId && feedback) {
        // Creating a new version based on feedback
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
      } else {
        // Creating a new blog with initial version
        await prisma.blog.create({
          data: {
            userId,
            topic,
            versions: {
              create: {
                content: generatedContent,
                userPrompt: `Initial request: ${topic}`,
                aiResponse: generatedContent,
                timestamp: new Date(),
              }
            }
          }
        });
      }
    }

    return new NextResponse(
      JSON.stringify({
        content: generatedContent,
        error: null
      }),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
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
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}