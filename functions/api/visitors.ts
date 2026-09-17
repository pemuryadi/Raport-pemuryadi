export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    if (!env.DB) {
      return new Response(JSON.stringify({ error: "Database tidak tersedia." }), { status: 500 });
    }

    // Auto-create page_stats table if not exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS page_stats (
        id TEXT PRIMARY KEY,
        stat_key TEXT UNIQUE NOT NULL,
        stat_value INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run().catch(() => {});

    // Check if it's a page hit counter ping
    const url = new URL(request.url);
    const isHitAction = url.searchParams.get('action') === 'hit';

    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {
      body = {};
    }

    if (isHitAction || body.action === 'hit') {
      await env.DB.prepare(`
        INSERT INTO page_stats (id, stat_key, stat_value) 
        VALUES ('1', 'total_pageviews', 1) 
        ON CONFLICT(stat_key) DO UPDATE SET 
          stat_value = page_stats.stat_value + 1,
          updated_at = CURRENT_TIMESTAMP
      `).run();

      return new Response(JSON.stringify({ success: true, hit: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { email, name } = body;
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), { status: 400 });
    }

    // Auto-create visitors table if not exists
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS visitors (
        email TEXT PRIMARY KEY,
        name TEXT,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        login_count INTEGER DEFAULT 1
      )
    `).run().catch(() => {});

    // Insert or update visitor
    const stmt = env.DB.prepare(`
      INSERT INTO visitors (email, name, last_login, login_count) 
      VALUES (?, ?, CURRENT_TIMESTAMP, 1) 
      ON CONFLICT(email) DO UPDATE SET 
        name = excluded.name, 
        last_login = CURRENT_TIMESTAMP, 
        login_count = visitors.login_count + 1
    `);
    
    await stmt.bind(email, name || '').run();

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
    if (!env.DB) {
      return new Response(JSON.stringify({ visitors: [], total_pageviews: 0 }), { status: 200 });
    }
    
    // Ensure tables exist
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS visitors (
        email TEXT PRIMARY KEY,
        name TEXT,
        last_login TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        login_count INTEGER DEFAULT 1
      )
    `).run().catch(() => {});

    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS page_stats (
        id TEXT PRIMARY KEY,
        stat_key TEXT UNIQUE NOT NULL,
        stat_value INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `).run().catch(() => {});

    const stmtVisitors = env.DB.prepare(`
      SELECT email, name, last_login, login_count 
      FROM visitors 
      ORDER BY last_login DESC
    `);
    const { results } = await stmtVisitors.all();

    let totalPageviews = 0;
    try {
      const stmtStats = await env.DB.prepare(`
        SELECT stat_value FROM page_stats WHERE stat_key = 'total_pageviews'
      `).first();
      if (stmtStats && typeof stmtStats.stat_value === 'number') {
        totalPageviews = stmtStats.stat_value;
      }
    } catch (e) {
      // ignore
    }

    return new Response(JSON.stringify({
      visitors: results || [],
      total_pageviews: totalPageviews,
      total_registered: (results || []).length
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
