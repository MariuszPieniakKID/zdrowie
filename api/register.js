const { pool, sanitizePhone } = require('./_config');

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone } = req.body;
  
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Wszystkie pola są wymagane' });
  }
  
  const sanitizedPhone = sanitizePhone(phone);
  
  try {
    await pool.query(
      'INSERT INTO users (name, email, phone) VALUES ($1, $2, $3)',
      [name, email, sanitizedPhone]
    );
    res.status(201).json({ message: 'Rejestracja udana!' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: error.message });
  }
} 