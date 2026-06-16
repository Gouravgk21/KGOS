import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // requests per minute
const RATE_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(ip);
  if (!record || now > record.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (record.count >= RATE_LIMIT) return false;
  record.count++;
  return true;
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip =
    req.headers.get('x-forwarded-for') ||
    req.headers.get('x-real-ip') ||
    'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait before sending more messages.' },
      { status: 429 }
    );
  }

  // Validate API key
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes('your-openai')) {
    return NextResponse.json(
      { error: 'AI service not configured. Please add your OpenAI API key.' },
      { status: 503 }
    );
  }

  // Parse request
  let body: {
    message: string;
    agentId: string;
    agentName: string;
    context?: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { message, agentId, agentName, context, history = [] } = body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  // Sanitize input
  const sanitizedMessage = message.slice(0, 2000).replace(/[<>]/g, '');

  // Suppress unused variable warning — agentName is passed in body for logging purposes
  void agentName;

  // Build agent system prompts
  const AGENT_PROMPTS: Record<string, string> = {
    aria: `You are ARIA, Kumar Gourav's Chief Operating Officer AI. You specialize in:
- B2B sales strategy for Aqua Colloids (hydrocolloid supplier)
- Lead prioritization and CRM pipeline analysis
- Revenue forecasting and business intelligence
- Operational decision-making

Kumar Gourav is founder of Aqua Colloids, a food ingredients company supplying Kappa Carrageenan, Iota Carrageenan, CMC, Guar Gum to food manufacturers in India.

Be concise, strategic, and data-driven. Format key insights with bullet points.`,

    helix: `You are HELIX, Kumar Gourav's Food Science AI. You specialize in:
- Hydrocolloid science (Kappa/Iota Carrageenan, CMC, Xanthan, Guar, LBG, HPMC, Agar)
- Food formulation and texture design
- Gel strength optimization, rheology
- Cost-performance analysis for ingredients
- Regulatory compliance (FSSAI, EU food additives)

Be scientifically precise. Use technical terminology. Provide actionable formulation advice.`,

    nova: `You are NOVA, Kumar Gourav's Research AI. You specialize in:
- Scientific literature analysis and summarization
- Research gap identification
- Paper recommendations for hydrocolloid science
- PhD application strategy
- Research methodology guidance

Be academic yet clear. Cite key concepts. Help identify research opportunities.`,

    echo: `You are ECHO, Kumar Gourav's Exam Coach AI. You specialize in:
- GATE, UPSC, and competitive exam preparation
- Study planning and spaced repetition
- Mock test analysis and weak area identification
- Time management for exam preparation
- Subject-specific teaching (especially food technology, chemistry)

Be encouraging, structured, and pedagogically sound. Break complex topics into clear steps.`,

    atlas: `You are ATLAS, Kumar Gourav's Executive Intelligence AI. You synthesize across all domains:
- Strategic decision-making across business, research, career, health
- Life OS optimization — prioritization, energy management, goal alignment
- Cross-domain pattern recognition
- Weekly/monthly review facilitation
- 10-year vision alignment

Think at the highest level. Connect dots between domains. Be the thinking partner for the founder.`,
  };

  const systemPrompt = AGENT_PROMPTS[agentId] ?? AGENT_PROMPTS['atlas'];
  const contextualSystem = context
    ? `${systemPrompt}\n\nCurrent page context:\n${context.slice(0, 1000)}`
    : systemPrompt;

  // Prepare messages
  const messages = [
    { role: 'system' as const, content: contextualSystem },
    ...history
      .slice(-6)
      .map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    { role: 'user' as const, content: sanitizedMessage },
  ];

  try {
    // Call OpenAI with streaming
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        stream: true,
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      const err = await openAIResponse.text();
      console.error('[KGOS AI] OpenAI error:', err);
      return NextResponse.json(
        { error: 'AI service error. Please try again.' },
        { status: 502 }
      );
    }

    // Stream response back to client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = openAIResponse.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
              controller.close();
              break;
            }

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter((l) => l.startsWith('data: '));

            for (const line of lines) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
                controller.close();
                return;
              }
              try {
                const parsed = JSON.parse(data) as {
                  choices?: Array<{ delta?: { content?: string } }>;
                };
                const content = parsed.choices?.[0]?.delta?.content;
                if (content) {
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ content })}\n\n`
                    )
                  );
                }
              } catch {
                // Skip malformed chunks
              }
            }
          }
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error('[KGOS AI] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
