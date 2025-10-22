const { Pool } = require('pg');
const { OpenAI } = require('openai');

// Sprawdzenie zmiennych środowiskowych
const requiredEnvVars = [
  'DATABASE_URL',
  'OPENAI_API_KEY'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('🚨 BŁĄD: Brakujące wymagane zmienne środowiskowe:', missingVars);
}

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}) : null;

const sanitizePhone = (phone) => phone.replace(/[-\s]/g, '');

module.exports = {
  openai,
  pool,
  sanitizePhone
}; 