require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');
const pdf = require('pdf-parse');
const cheerio = require('cheerio');
const { createWorker } = require('tesseract.js');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();

// Inicjalizacja OpenAI
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
console.log('[OPENAI] Inicjalizacja klienta OpenAI. Klucz API obecny:', !!process.env.OPENAI_API_KEY);

// Pool do PostgreSQL (Neon)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Katalogi tymczasowe na pliki
const uploadDir = '/tmp/uploads';
const OUTPUT_DIR = '/tmp/converted';

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://zdrowie-pi.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Strona główna
app.get('/', (req, res) => {
  res.json({ status: 'Backend działa! na index' });
});

// Multer do uploadu PDF
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Pomocnicza funkcja do czyszczenia numerów telefonów
const sanitizePhone = (phone) => phone.replace(/[-\s]/g, '');

// OCR PDF z Tesseract
async function extractTextFromPDF(filePath) {
  try {
    console.log('===== UŻYWAM METODY TESSERACT Z TEST.JS =====');
    const outputPrefix = path.join(OUTPUT_DIR, 'page');
    await execPromise(`pdftoppm -png -r 300 "${filePath}" "${outputPrefix}"`);

    const worker = await createWorker();
    let text = '';

    const files = fs.readdirSync(OUTPUT_DIR);
    const pngFiles = files.filter(file => file.startsWith('page') && file.endsWith('.png'));

    for (const pngFile of pngFiles) {
      const imagePath = path.join(OUTPUT_DIR, pngFile);
      const { data } = await worker.recognize(imagePath);
      text += data.text + '\n';

      try {
        fs.unlinkSync(imagePath);
      } catch (e) {
        console.log(`Nie można usunąć pliku ${imagePath}:`, e);
      }
    }

    await worker.terminate();

    console.log('===== TEKST Z OCR (TESSERACT) =====');
    console.log(text);
    console.log('===== KONIEC TEKSTU Z OCR =====');

    return text;
  } catch (error) {
    console.error('Błąd konwersji PDF:', error);
    throw error;
  }
}

// --- Endpointy użytkowników ---
app.post('/api/register', async (req, res) => {
  const { name, email, phone } = req.body;
  const sanitizedPhone = sanitizePhone(phone);
  console.log('[REGISTER] Próba rejestracji:', { name, email, phone, sanitizedPhone });
  try {
    await pool.query(
      'INSERT INTO users (name, email, phone) VALUES ($1, $2, $3)',
      [name, email, sanitizedPhone]
    );
    console.log('[REGISTER] Rejestracja UDANA:', sanitizedPhone);
    res.status(201).json({ message: 'Rejestracja udana!' });
  } catch (error) {
    console.error('[REGISTER] Błąd rejestracji:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { phone } = req.body;
  const sanitizedPhone = sanitizePhone(phone);
  console.log('[LOGIN] Próba logowania:', { phone, sanitizedPhone });
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [sanitizedPhone]
    );
    if (rows.length === 0) {
      console.warn('[LOGIN] Nie znaleziono użytkownika:', sanitizedPhone);
      return res.status(404).json({ error: 'Nie znaleziono użytkownika' });
    }
    console.log('[LOGIN] Logowanie UDANE:', rows[0]);
    res.json({ user: rows[0] });
  } catch (error) {
    console.error('[LOGIN] Błąd logowania:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE id = $1',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nie znaleziono użytkownika' });
    }
    res.json({ user: rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Endpointy plików ---
app.post('/api/upload', upload.single('pdf'), async (req, res) => {
  const { user_id, symptoms, chronic_diseases, medications } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO documents (user_id, filename, filepath, symptoms, chronic_diseases, medications) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [user_id, req.file.originalname, req.file.filename, symptoms, chronic_diseases, medications]
    );
    res.json({ message: 'Plik przesłany', documentId: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/documents/:user_id', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const offset = (page - 1) * limit;
    const { rows: docs } = await pool.query(
      'SELECT * FROM documents WHERE user_id = $1 ORDER BY upload_date DESC LIMIT $2 OFFSET $3',
      [req.params.user_id, limit, offset]
    );
    const { rows: totalRows } = await pool.query(
      'SELECT COUNT(*) as count FROM documents WHERE user_id = $1',
      [req.params.user_id]
    );
    const total = parseInt(totalRows[0].count, 10);
    res.json({ documents: docs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/document/:id', async (req, res) => {
  try {
    const { rows: docs } = await pool.query('SELECT * FROM documents WHERE id = $1', [req.params.id]);
    if (docs.length === 0) {
      return res.status(404).json({ error: 'Nie znaleziono dokumentu' });
    }

    const filePath = path.join(uploadDir, docs[0].filepath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM parameters WHERE document_id = $1', [req.params.id]);
    await pool.query('DELETE FROM documents WHERE id = $1', [req.params.id]);

    res.json({ message: 'Dokument usunięty' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Endpointy parametrów ---
app.get('/api/parameters/:user_id', async (req, res) => {
  try {
    const { rows: params } = await pool.query(
      'SELECT * FROM parameters WHERE user_id = $1 ORDER BY measurement_date',
      [req.params.user_id]
    );
    res.json(params);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Analiza pliku przez OpenAI ---
app.post('/api/analyze-file', async (req, res) => {
  const { document_id, user_id } = req.body;
  try {
    const { rows: docs } = await pool.query(
      'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
      [document_id, user_id]
    );
    if (!docs.length) return res.status(404).json({ error: 'Nie znaleziono pliku' });

    const filePath = path.join(uploadDir, docs[0].filepath);

    // OCR
    console.log('Rozpoczynam ekstrakcję tekstu z PDF używając TESSERACT...');
    const text = await extractTextFromPDF(filePath);
    console.log('Ekstrakcja zakończona, długość tekstu:', text.length);

    const { symptoms, chronic_diseases, medications } = docs[0];

    // Prompt do ChatGPT
    const prompt = `Biorąc pod uwagę moje symptomy: ${symptoms || 'brak'}, oraz choroby przewlekłe: ${chronic_diseases || 'brak'}, oraz leki jakie biorę: ${medications || 'brak'}, przeanalizuj poniższe wyniki badań laboratoryjnych.

Podaj wyniki badań w tabeli HTML (<table>) z następującymi kolumnami: Parametr, Wartość, Komentarz, Data badania (YYYY-MM-DD).

Oto tekst z badania (wyniki laboratoryjne):
${text}
... Jeśli w tekście nie ma wyraźnych dat badań, użyj daty z nazwy pliku lub przyjmij dzisiejszą datę.
Jeśli w tekście nie ma wyraźnych wartości referencyjnych, dodaj standardowe zakresy referencyjne w komentarzu.
Jeśli jakieś wartości są poza zakresem referencyjnym, wyraźnie to zaznacz w komentarzu.`;

    console.log('[OPENAI] Próba połączenia z ChatGPT, model: gpt-4.1');
    console.log('[OPENAI] Prompt (surowe dane):', prompt);

    let analysis;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: "Jesteś doświadczonym lekarzem, który analizuje wyniki badań laboratoryjnych. Przeprowadzasz dokładną analizę tych badań biorąc pod uwagę choroby, leki i objawy pacjenta. Zwracasz szczególną uwagę na nieprawidłowe wyniki. Zachowujesz profesjonalny i empatyczny ton. Potrafisz odczytać i zinterpretować nawet niewyraźne lub częściowo uszkodzone wyniki badań. Jeśli dane są niekompletne lub nieczytelne, zaznaczasz to w komentarzu."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
      });
      analysis = completion.choices[0].message.content;
      console.log('[OPENAI] Odpowiedź ChatGPT:', analysis);
    } catch (err) {
      console.error('[OPENAI] Błąd połączenia z ChatGPT:', err);
      throw err;
    }

    // Parsowanie tabeli HTML
    const $ = cheerio.load(analysis);
    const rows = $('tr');

    // Pomijamy wiersz nagłówka
    for (let i = 1; i < rows.length; i++) {
      const cells = $(rows[i]).find('td');
      if (cells.length >= 4) {
        const paramName = $(cells[0]).text().trim();
        const paramValue = $(cells[1]).text().trim();
        const paramComment = $(cells[2]).text().trim();
        const paramDate = $(cells[3]).text().trim();

        if (paramName && paramName !== 'Podsumowanie' && paramValue && paramDate) {
          try {
            await pool.query(
              'INSERT INTO parameters (user_id, document_id, parameter_name, parameter_value, parameter_comment, measurement_date) VALUES ($1, $2, $3, $4, $5, $6)',
              [user_id, document_id, paramName, paramValue, paramComment, paramDate]
            );
          } catch (err) {
            console.error('Błąd dodawania parametru:', err);
          }
        }
      }
    }

    await pool.query(
      'UPDATE documents SET analysis = $1 WHERE id = $2',
      [analysis, document_id]
    );

    res.json({ analysis });
  } catch (error) {
    console.error('Błąd analizy:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Podsumowanie parametrów przez OpenAI ---
app.post('/api/summarize', async (req, res) => {
  const { userId, parameters } = req.body;

  try {
    if (!parameters.length) {
      return res.status(400).json({ error: 'Brak parametrów do analizy' });
    }

    const paramsText = parameters.map(p =>
      `${p.parameter_name}: ${p.parameter_value} (${p.parameter_comment}) - data: ${p.measurement_date}`
    ).join('\n');

    const prompt = `Na podstawie tych parametrów zdrowotnych, przygotuj krótkie podsumowanie stanu zdrowia pacjenta, wskazując na potencjalne problemy i zalecenia. Użyj formatowania HTML dla lepszej czytelności.\n\n${paramsText}`;

    console.log('[OPENAI] Prompt (surowe dane):', prompt);

    let summary;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "Jesteś doświadczonym lekarzem, który analizuje wyniki badań i udziela zrozumiałych porad zdrowotnych." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      });
      summary = completion.choices[0].message.content;
      console.log('[OPENAI] Odpowiedź ChatGPT:', summary);
    } catch (err) {
      console.error('[OPENAI] Błąd połączenia z ChatGPT:', err);
      throw err;
    }

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Usuwanie danych użytkownika (transakcja) ---
app.delete('/api/user-data/:id', async (req, res) => {
  const userId = req.params.id;
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Pobierz ścieżki do plików przed ich usunięciem z bazy
    const { rows: documents } = await client.query(
      'SELECT filepath FROM documents WHERE user_id = $1',
      [userId]
    );

    // Usuń parametry użytkownika
    await client.query('DELETE FROM parameters WHERE user_id = $1', [userId]);
    // Usuń dokumenty użytkownika z bazy danych
    await client.query('DELETE FROM documents WHERE user_id = $1', [userId]);

    // Usuń fizyczne pliki z serwera
    for (const doc of documents) {
      const filePath = path.join(uploadDir, doc.filepath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Dane użytkownika zostały pomyślnie usunięte' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// --- Middleware do logowania błędów ---
app.use((err, req, res, next) => {
  console.error('Błąd aplikacji:', err);
  res.status(500).json({ error: 'Wystąpił błąd serwera', details: err.message });
});

// --- Obsługa błędów nieobsłużonych ---
process.on('unhandledRejection', (reason, promise) => {
  console.error('Nieobsłużone odrzucenie obietnicy:', reason);
});
process.on('uncaughtException', (error) => {
  console.error('Nieobsłużony wyjątek:', error);
});

// --- Start serwera ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});

module.exports = app;
