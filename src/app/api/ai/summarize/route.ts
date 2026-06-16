import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes('your-openai')) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 503 });
  }

  let body: { text: string; type: 'paper' | 'meeting' | 'notes' | 'general' };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { text, type = 'general' } = body;
  if (!text || text.trim().length < 10) {
    return NextResponse.json({ error: 'Text too short to summarize' }, { status: 400 });
  }

  const prompts: Record<string, string> = {
    paper:
      'Summarize this research paper in 3-5 bullet points highlighting: key findings, methodology, relevance to food science/hydrocolloids, and actionable insights.',
    meeting:
      'Summarize these meeting notes. Extract: key decisions made, action items with owners, follow-up dates, and open questions.',
    notes:
      'Organize and summarize these notes. Highlight key insights, connections, and action items.',
    general: 'Provide a concise structured summary of this content.',
  };

  const systemPrompt = prompts[type] ?? prompts['general'];

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text.slice(0, 8000) },
        ],
        max_tokens: 600,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'AI service error' }, { status: 502 });
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const summary = data.choices?.[0]?.message?.content ?? '';

    return NextResponse.json({ summary });
  } catch {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
