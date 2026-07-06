import { daftarWilayah } from '../../src/data/wilayah';

export async function onRequest(context: any) {
  const url = new URL(context.request.url);
  const slug = context.params.region;

  // Find the region in our compiled database
  const region = daftarWilayah.find(w => w.slug === slug);

  // Fetch the static index.html from static assets
  const assetUrl = new URL('/index.html', url.origin);
  const assetRequest = new Request(assetUrl.toString(), {
    headers: context.request.headers
  });
  
  const response = await context.env.ASSETS.fetch(assetRequest);
  if (!response.ok) {
    return response;
  }

  let html = await response.text();

  if (region) {
    const regionName = region.name;
    const parentProvince = region.province || '';
    const isProvince = region.type === 'provinsi';
    
    // Construct localized SEO strings
    const locationString = isProvince ? regionName : `${regionName}, ${parentProvince}`;
    
    const title = `Aplikasi Raport Kurikulum Merdeka - ${regionName} (Gratis) | Pemuryadi`;
    const description = `Kelola, hitung nilai, dan cetak raport Kurikulum Merdeka otomatis untuk sekolah (SD, SMP, SMA, SMK) di wilayah ${locationString}. Mudah, cepat, dan 100% gratis.`;
    const keywords = `raport kurikulum merdeka ${regionName}, aplikasi raport ${regionName}, raport digital ${regionName}, raport otomatis ${regionName}, kurikulum merdeka ${regionName}, pemuryadi`;
    const canonicalUrl = `${url.origin}/wilayah/${slug}`;

    // Replace <title>
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
    
    // Replace Meta Tags
    html = html.replace(/<meta[^>]*name="title"[^>]*content="[^"]*"[^>]*>/i, 
      `<meta name="title" content="${title}" />`);
      
    html = html.replace(/<meta[^>]*name="description"[^>]*content="[^"]*"[^>]*>/i, 
      `<meta name="description" content="${description}" />`);
      
    html = html.replace(/<meta[^>]*name="keywords"[^>]*content="[^"]*"[^>]*>/i, 
      `<meta name="keywords" content="${keywords}" />`);

    // Replace Open Graph Tags
    html = html.replace(/<meta[^>]*property="og:title"[^>]*content="[^"]*"[^>]*>/i, 
      `<meta property="og:title" content="${title}" />`);
      
    html = html.replace(/<meta[^>]*property="og:description"[^>]*content="[^"]*"[^>]*>/i, 
      `<meta property="og:description" content="${description}" />`);
      
    html = html.replace(/<meta[^>]*property="og:url"[^>]*content="[^"]*"[^>]*>/i, 
      `<meta property="og:url" content="${canonicalUrl}" />`);

    // Replace Twitter Tags
    html = html.replace(/<meta[^>]*property="twitter:title"[^>]*content="[^"]*"[^>]*>/i, 
      `<meta property="twitter:title" content="${title}" />`);
      
    html = html.replace(/<meta[^>]*property="twitter:description"[^>]*content="[^"]*"[^>]*>/i, 
      `<meta property="twitter:description" content="${description}" />`);
      
    html = html.replace(/<meta[^>]*property="twitter:url"[^>]*content="[^"]*"[^>]*>/i, 
      `<meta property="twitter:url" content="${canonicalUrl}" />`);
  }

  return new Response(html, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
      'cache-control': 'public, max-age=3600', // Cache on CDN for 1 hour
    },
  });
}
