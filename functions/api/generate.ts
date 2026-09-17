// In-memory rate limiting map for edge worker instance
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;

    // 1. IP & Rate Limiting (15 requests per minute per IP)
    const clientIp = request.headers.get('cf-connecting-ip') || 
                     request.headers.get('x-forwarded-for') || 
                     'unknown-ip';
    
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 15;

    const currentLimit = rateLimitMap.get(clientIp);
    if (currentLimit && now < currentLimit.resetTime) {
      if (currentLimit.count >= maxRequests) {
        return new Response(JSON.stringify({ 
          error: "Terlalu banyak permintaan (Rate limit tercapai). Silakan tunggu 1 menit sebelum mencoba lagi." 
        }), {
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            'Retry-After': '60'
          }
        });
      }
      currentLimit.count++;
    } else {
      rateLimitMap.set(clientIp, { count: 1, resetTime: now + windowMs });
    }

    // Clean up old rate limit entries if map grows too large
    if (rateLimitMap.size > 1000) {
      for (const [key, val] of rateLimitMap.entries()) {
        if (now > val.resetTime) rateLimitMap.delete(key);
      }
    }

    // 2. Anti-Bot User-Agent Check
    const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
    const blockedBots = ['gptbot', 'claudebot', 'bytespider', 'ccbot', 'scrapy', 'python-requests', 'aiohttp', 'curl'];
    if (blockedBots.some(bot => userAgent.includes(bot))) {
      return new Response(JSON.stringify({ error: "Access denied for automated scraper bot." }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.length > 2000) {
      return new Response(JSON.stringify({ error: "Prompt tidak valid atau melebihi batas karakter." }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const apiKey = env.POLLINATIONS_API_KEY || env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API Key (Pollinations) belum diatur di backend." }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const aiResponse = await fetch(`https://gen.pollinations.ai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "openai",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    const data: any = await aiResponse.json();
    
    // Fallback error handling if API failed
    if (!aiResponse.ok) {
      return new Response(JSON.stringify({ error: data.error?.message || "Gagal menghubungi Pollinations AI" }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Map OpenAI response format to Gemini format to maintain frontend compatibility
    const generatedText = data.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({
      candidates: [{
        content: {
          parts: [{ text: generatedText }]
        }
      }]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
