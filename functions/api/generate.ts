export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { prompt } = body;

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

    const data = await aiResponse.json();
    
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
