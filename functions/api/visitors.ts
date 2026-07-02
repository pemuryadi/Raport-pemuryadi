export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { email, name } = body;

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
    }

    // Insert or update visitor
    const stmt = env.DB.prepare(`
      INSERT INTO visitors (email, name, last_login, login_count) 
      VALUES (?, ?, CURRENT_TIMESTAMP, 1) 
      ON CONFLICT(email) DO UPDATE SET 
        name = excluded.name, 
        last_login = CURRENT_TIMESTAMP, 
        login_count = visitors.login_count + 1
    `);
    
    await stmt.bind(email, name).run();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestGet(context: any) {
  try {
    const { env } = context;
    
    const stmt = env.DB.prepare(`
      SELECT email, name, last_login, login_count 
      FROM visitors 
      ORDER BY last_login DESC
    `);
    const { results } = await stmt.all();

    return new Response(JSON.stringify(results), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
