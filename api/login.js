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

  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({ error: 'Numer telefonu jest wymagany' });
  }
  
  const sanitizedPhone = sanitizePhone(phone);
  
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [sanitizedPhone]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nie znaleziono użytkownika' });
    }
    
    res.status(200).json({ user: rows[0] });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
} 