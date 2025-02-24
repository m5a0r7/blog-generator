import { NextResponse } from 'next/server';
import OpenAI from 'openai/index.mjs';

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export async function POST(request: Request) {
  try {
    const { content, feedbackType, improvementSuggestion } = await request.json();

    // Only proceed with content improvement if feedback is negative and has improvement suggestion
    if (feedbackType === 'negative' && improvementSuggestion) {
      const completion = await openai.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You are a professional blog post editor. Improve the content based on user feedback while maintaining the original topic and structure."
          },
          {
            role: "user",
            content: `Original blog post: ${content}\n\nUser feedback: ${improvementSuggestion}\n\nPlease improve this blog post based on the feedback.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      const improvedContent = completion.choices[0].message.content;
      return NextResponse.json({ improvedContent });
    }

    return NextResponse.json({ message: 'Feedback received' });
  } catch (error) {
    console.error('Error processing feedback:', error);
    return NextResponse.json(
      { error: 'Error processing feedback' },
      { status: 500 }
    );
  }
} 