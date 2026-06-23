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
        'Content-Type': 'application/json'
      }
    };
    if (body) opts.body = JSON.stringify(body);
    const response = await fetch(url, opts);
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch(e) { data = { raw: text }; }
    if (!response.ok) {
      return res.status(200).json({ shopify_error: true, status: response.status, data });
    }
    res.status(200).json(data);
  } catch (e) {
    res.status(200).json({ error: e.message, stack: e.stack });
  }
}
