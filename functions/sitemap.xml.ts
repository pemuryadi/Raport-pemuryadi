import { daftarWilayah } from '../src/data/wilayah';

export async function onRequestGet(context: any) {
  const url = new URL(context.request.url);
  // Fallback to raportsks.my.id if request URL isn't absolute or looks like localhost
  const host = url.hostname === 'localhost' || url.hostname === '127.0.0.1' 
    ? 'https://raportsks.my.id' 
    : url.origin;

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  // 1. Homepage
  xml += `  <url>\n    <loc>${host}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // 2. Regional pages
  daftarWilayah.forEach((region) => {
    xml += `  <url>\n    <loc>${host}/wilayah/${region.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  });

  xml += '</urlset>\n';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400', // Cache for 1 day
    },
  });
}
