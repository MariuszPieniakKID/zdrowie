export default function handler(req, res) {
  res.status(200).json({ 
    status: 'Backend działa!',
    message: 'API Zdrowie - Vercel deployment'
  });
} 