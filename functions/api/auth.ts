export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { email, password } = body;

    const adminEmail = env.VITE_ADMIN_EMAIL || env.ADMIN_EMAIL;
    const adminPassword = env.VITE_ADMIN_PASSWORD || env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      return new Response(JSON.stringify({ error: "Admin credentials not configured in environment variables." }), { status: 500 });
    }

    if (email === adminEmail && password === adminPassword) {
      // Create a simple token or just return success (for this simple implementation)
      return new Response(JSON.stringify({ success: true, token: "admin_token_123" }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ error: "Email atau sandi salah." }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
