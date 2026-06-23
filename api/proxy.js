export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  try {
    const { shop, path, method, token, body } = req.body;
    const url = `https://${shop}/admin/api/2024-07/${path}`;
    const opts = {
      method: method || 'GET',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };
    if (body) opts.body = JSON.stringify(body);
    const response = await fetch(url, opts);
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }

    // Extract pagination link header
    const linkHeader = response.headers.get('link') || '';
    let nextPageInfo = null;
    const nextMatch = linkHeader.match(/<[^>]*page_info=([^>&]+)[^>]*>;\s*rel="next"/);
    if (nextMatch) nextPageInfo = nextMatch[1];

    if (!response.ok) {
      return res.status(200).json({ shopify_error: true, status: response.status, data });
    }
    res.status(200).json({ ...data, next_page_info: nextPageInfo });
  } catch (e) {
    res.status(200).json({ error: e.message });
  }
}
    res.status(200).json({ error: e.message });
  }
}
