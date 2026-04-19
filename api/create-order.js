// api/create-order.js — Cẩm Nang Tài Chính Thực Chiến
// CommonJS – fetch thuần, không npm packages

const PRICE = 149000;

function generateOrderCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 4; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return 'CNTC' + s;
}

async function kvSet(key, value, ex) {
  await fetch(process.env.KV_REST_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(['SET', key, value, 'EX', ex]),
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone } = req.body || {};
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Thiếu thông tin: name, email, phone' });
  }

  const orderCode = generateOrderCode();
  const orderData = {
    orderCode, name, email, phone,
    amount: PRICE,
    status: 'pending',
    createdAt: Date.now(),
  };

  await kvSet(`order:${orderCode}`, JSON.stringify(orderData), 7200);
  console.log('[CreateOrder] Tạo đơn:', orderCode, '|', name, '|', email);

  return res.status(200).json({
    success: true,
    orderCode,
    amount: PRICE,
    bankCode: 'ACB',
    bankAccount: process.env.ACB_ACCOUNT || '20176968',
    accountName: process.env.ACCOUNT_NAME || 'HANADOLA MEDIA AND TECHNOLOGY',
    description: `CNTC ${orderCode}`,
  });
};
