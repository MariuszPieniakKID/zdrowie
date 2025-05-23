require('dotenv').config();
const vision = require('@google-cloud/vision');
const { Storage } = require('@google-cloud/storage');
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');
const cheerio = require('cheerio');
const fetch = require('node-fetch'); // nowość

const app = express();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const visionClient = new vision.ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GCP_PROJECT_ID,
});
const gcsStorage = new Storage({
  credentials: {
    client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GCP_PROJECT_ID,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://zdrowie-pi.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'Backend działa!' });
});

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage: multerStorage });

const sanitizePhone = (phone) => phone.replace(/[-\s]/g, '');

async function uploadFileToGCS(localFilePath, bucketName, destFileName) {
  await gcsStorage.bucket(bucketName).upload(localFilePath, { destination: destFileName });
  return `gs://${bucketName}/${destFileName}`;
}
async function extractTextFromPDFWithOCR(gcsSourceUri, gcsDestinationUri) {
  const inputConfig = {
    mimeType: 'application/pdf',
    gcsSource: { uri: gcsSourceUri },
  };
  const outputConfig = {
    gcsDestination: { uri: gcsDestinationUri },
    batchSize: 1,
  };
  const features = [{ type: 'DOCUMENT_TEXT_DETECTION' }];
  const request = {
    requests: [{ inputConfig, features, outputConfig }],
  };
  const [operation] = await visionClient.asyncBatchAnnotateFiles(request);
  await operation.promise();
}
async function downloadOcrResultFromGCS(bucketName, prefix) {
  const [files] = await gcsStorage.bucket(bucketName).getFiles({ prefix });
  let fullText = '';
  for (const file of files) {
    if (file.name.endsWith('.json')) {
      const contents = await file.download();
      const json = JSON.parse(contents);
      if (json.responses && json.responses[0] && json.responses[0].fullTextAnnotation) {
        fullText += json.responses[0].fullTextAnnotation.text + '\n';
      }
    }
  }
  return fullText;
}

// ============ NOWOŚĆ: Funkcja pobierająca wiedzę z MedlinePlus =================
async function getMedlinePlusInfo(term) {
  const url = `https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&term=${encodeURIComponent(term)}&retmax=1`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    // Prosta ekstrakcja pierwszego tematu, lepszą możesz dodać sam!
    const match = text.match(/<title>([^<]+)<\/title>[\s\S]*?<fullsummary>([\s\S]+?)<\/fullsummary>/i);
    if (match) {
      return `${match[1]}: ${match[2]}`;
    } else {
      return '';
    }
  } catch {
    return '';
  }
}
// ==============================================================================

app.post('/api/register', async (req, res) => {
  const { name, email, phone } = req.body;
  const sanitizedPhone = sanitizePhone(phone);
  try {
    await pool.query(
      'INSERT INTO users (name, email, phone) VALUES ($1, $2, $3)',
      [name, email, sanitizedPhone]
    );
    res.status(201).json({ message: 'Rejestracja udana!' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/login', async (req, res) => {
  const { phone } = req.body;
  const sanitizedPhone = sanitizePhone(phone);
  try {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [sanitizedPhone]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Nie znaleziono użytkownika' });
    }
    res.json({ user: rows[0] });
  } catch (error) {
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

// --- ZAAWANSOWANA ANALIZA - AGENT Z PAMIĘCIĄ ---
// Uwaga: W tym przykładzie MedlinePlus podaje info o anemii – możesz dynamicznie dodać inne terminy!
app.post('/api/analyze-file', async (req, res) => {
  const { document_id, user_id } = req.body;
  try {
    const { rows: docs } = await pool.query(
      'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
      [document_id, user_id]
    );
    if (!docs.length) return res.status(404).json({ error: 'Nie znaleziono pliku' });

    const filePath = path.join(uploadDir, docs[0].filepath);

    const bucketName = process.env.GCS_BUCKET_NAME;
    const destFileName = `${Date.now()}-${docs[0].filename}`;
    const gcsSourceUri = await uploadFileToGCS(filePath, bucketName, destFileName);
    const ocrResultPrefix = `ocr-results/${Date.now()}-${docs[0].id}/`;
    const gcsDestinationUri = `gs://${bucketName}/${ocrResultPrefix}`;
    await extractTextFromPDFWithOCR(gcsSourceUri, gcsDestinationUri);
    const text = await downloadOcrResultFromGCS(bucketName, ocrResultPrefix);

    const { symptoms, chronic_diseases, medications } = docs[0];

    // --- PAMIĘĆ AGENTA: pobierz ostatnie 5 konwersacji usera
    const { rows: historyRows } = await pool.query(
      'SELECT message, role FROM agent_memory WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 5',
      [user_id]
    );
    const chatHistory = historyRows.reverse().map(h => ({
      role: h.role, content: h.message
    }));

    // MedlinePlus (jeśli na przykład wykryto "anemia" w tekście)
    let medicalInfo = '';
    if ((text || '').toLowerCase().includes('anemia')) {
      medicalInfo = await getMedlinePlusInfo('anemia');
    }

    // -- GŁÓWNY PROMPT --
    const prompt = `Biorąc pod uwagę moje symptomy: ${symptoms || 'brak'}, oraz choroby przewlekłe: ${chronic_diseases || 'brak'}, oraz leki jakie biorę: ${medications || 'brak'}, przeanalizuj poniższe wyniki badań laboratoryjnych.

Podaj wyniki badań w tabeli HTML (<table>) z następującymi kolumnami: Parametr, Wartość, Komentarz, Data badania (YYYY-MM-DD).

Oto tekst z badania (wyniki laboratoryjne):
${text}
${medicalInfo ? "\n\nDodatkowe informacje z MedlinePlus:\n" + medicalInfo : ""}
... Jeśli w tekście nie ma wyraźnych dat badań, użyj daty z nazwy pliku lub przyjmij dzisiejszą datę.
Jeśli w tekście nie ma wyraźnych wartości referencyjnych, dodaj standardowe zakresy referencyjne w komentarzu.
Jeśli jakieś wartości są poza zakresem referencyjnym, wyraźnie to zaznacz w komentarzu.`;

    const openAiMessages = [
      {
        role: "system",
        content: "Jesteś doświadczonym lekarzem, który analizuje wyniki badań laboratoryjnych. Przeprowadzasz dokładną analizę tych badań biorąc pod uwagę choroby, leki i objawy pacjenta. Zwracasz szczególną uwagę na nieprawidłowe wyniki. Zachowujesz profesjonalny i empatyczny ton. Potrafisz odczytać i zinterpretować nawet niewyraźne lub częściowo uszkodzone wyniki badań. Jeśli dane są niekompletne lub nieczytelne, zaznaczasz to w komentarzu."
      },
      ...chatHistory,
      { role: "user", content: prompt }
    ];

    let analysis;
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: openAiMessages,
        temperature: 0.2,
      });
      analysis = completion.choices[0].message.content;
    } catch (err) {
      console.error('[OPENAI] Błąd połączenia z ChatGPT:', err);
      throw err;
    }

    // Zapisz do historii (agent_memory)
    await pool.query(
      'INSERT INTO agent_memory (user_id, message, role) VALUES ($1, $2, $3)', [user_id, prompt, 'user']
    );
    await pool.query(
      'INSERT INTO agent_memory (user_id, message, role) VALUES ($1, $2, $3)', [user_id, analysis, 'assistant']
    );

    // Parsowanie HTML tabeli do parameters
    const $ = cheerio.load(analysis);
    const rows = $('tr');
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

    // Save analysis HTML
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

// --- Podsumowanie parametrów przez OpenAI z pamięcią! ---
app.post('/api/summarize', async (req, res) => {
  const { userId, parameters } = req.body;
  try {
    if (!parameters.length) {
      return res.status(400).json({ error: 'Brak parametrów do analizy' });
    }
    const paramsText = parameters.map(p =>
      `${p.parameter_name}: ${p.parameter_value} (${p.parameter_comment}) - data: ${p.measurement_date}`
    ).join('\n');

    // -- PAMIĘĆ (historia dialogów usera)
    const { rows: historyRows } = await pool.query(
      'SELECT message, role FROM agent_memory WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 5',
      [userId]
    );
    const chatHistory = historyRows.reverse().map(h => ({
      role: h.role, content: h.message
    }));

    const prompt = `Na podstawie tych parametrów zdrowotnych, przygotuj krótkie podsumowanie stanu zdrowia pacjenta, wskazując na potencjalne problemy i zalecenia. Użyj formatowania HTML dla lepszej czytelności.\n\n${paramsText}`;

    const openAiMessages = [
      { role: "system", content: "Jesteś doświadczonym lekarzem, który analizuje wyniki badań i udziela zrozumiałych porad zdrowotnych." },
      ...chatHistory,
      { role: "user", content: prompt }
    ];

    let summary;
    try {
      const completion = await openai.chat.completions.create({
               model: "gpt-4.1",
        messages: openAiMessages,
        temperature: 0.3,
      });
      summary = completion.choices[0].message.content;
    } catch (err) {
      console.error('[OPENAI] Błąd połączenia z ChatGPT:', err);
      throw err;
    }

    // Zapis do agent_memory
    await pool.query(
      'INSERT INTO agent_memory (user_id, message, role) VALUES ($1, $2, $3)', [userId, prompt, 'user']
    );
    await pool.query(
      'INSERT INTO agent_memory (user_id, message, role) VALUES ($1, $2, $3)', [userId, summary, 'assistant']
    );

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
    const { rows: documents } = await client.query(
      'SELECT filepath FROM documents WHERE user_id = $1',
      [userId]
    );
    await client.query('DELETE FROM parameters WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM documents WHERE user_id = $1', [userId]);
    await client.query('DELETE FROM agent_memory WHERE user_id = $1', [userId]);
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