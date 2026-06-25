module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');
  const { shop, token, collection_id, product_ids } = req.body;
  const results = { added: 0, failed: 0 };
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  for (let i = 0; i < product_ids.length; i++) {
    let success = false;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const response = await fetch(`https://${shop}/admin/api/2024-07/collects.json`, {
          method: 'POST',
          headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
          body: JSON.stringify({ collect: { product_id: product_ids[i], collection_id } })
        });
        if (response.status === 429) { await sleep(2000); continue; }
        results.added++;
        success = true;
        break;
      } catch(e) { await sleep(1000); }
    }
    if (!success) results.failed++;
    await sleep(550);
  }
  res.status(200).json(results);
}
