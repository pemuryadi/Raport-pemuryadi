export async function onRequestGet(context: any) {
  try {
    const { env } = context;
    if (!env.DB) {
      return new Response(JSON.stringify({ error: "Database tidak tersedia." }), { status: 500 });
    }
    const { results } = await env.DB.prepare("SELECT content_key, content_value FROM site_content").all();
    
    const contentMap: Record<string, string> = {};
    results.forEach((row: any) => {
      contentMap[row.content_key] = row.content_value;
    });

    return new Response(JSON.stringify(contentMap), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}

export async function onRequestPost(context: any) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { key, value } = body;

    if (!env.DB) {
      return new Response(JSON.stringify({ error: "Database tidak tersedia." }), { status: 500 });
    }

    if (!key || value === undefined) {
      return new Response(JSON.stringify({ error: "Key dan Value diperlukan." }), { status: 400 });
    }

    const newId = crypto.randomUUID();

    await env.DB.prepare(
      "INSERT INTO site_content (id, content_key, content_value) VALUES (?, ?, ?) ON CONFLICT(content_key) DO UPDATE SET content_value = excluded.content_value, updated_at = CURRENT_TIMESTAMP"
    ).bind(newId, key, value).run();

    return new Response(JSON.stringify({ success: true, message: "Konten berhasil diperbarui" }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
