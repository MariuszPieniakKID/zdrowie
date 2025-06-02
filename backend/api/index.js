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
const fetch = require('node-fetch');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');

const app = express();

// Sprawdzenie zmiennych środowiskowych
const requiredEnvVars = [
  'DATABASE_URL',
  'OPENAI_API_KEY'
];

// GCP jest teraz opcjonalne
const optionalEnvVars = [
  'GCP_PROJECT_ID',
  'GCP_SERVICE_ACCOUNT_EMAIL', 
  'GCP_PRIVATE_KEY',
  'GCS_BUCKET_NAME'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
const missingOptionalVars = optionalEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('🚨 BŁĄD: Brakujące wymagane zmienne środowiskowe:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\n📋 Sprawdź plik SETUP.md dla instrukcji konfiguracji.');
  console.error('💡 Skopiuj backend/env.example do backend/.env i wypełnij brakujące dane.\n');
  
  // W trybie development pozwalamy uruchomić serwer mimo braków
  if (process.env.NODE_ENV !== 'development') {
    process.exit(1);
  }
  console.log('⚠️  Uruchamiam w trybie development mimo braków w konfiguracji...\n');
}

if (missingOptionalVars.length > 0) {
  console.log('ℹ️  Opcjonalne zmienne środowiskowe (funkcje będą ograniczone):');
  missingOptionalVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
  console.log('💡 Google Cloud OCR niedostępny - używamy lokalnych metod OCR\n');
}

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

const visionClient = process.env.GCP_PROJECT_ID ? new vision.ImageAnnotatorClient({
  credentials: {
    client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GCP_PROJECT_ID,
}) : null;

const gcsStorage = process.env.GCP_PROJECT_ID ? new Storage({
  credentials: {
    client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  projectId: process.env.GCP_PROJECT_ID,
}) : null;

const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
}) : null;

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

// ============ FUNKCJA WYSYŁANIA SMS PRZEZ SMSAPI.PL =================
async function sendSMSViaSMSAPI(phone, message) {
  const token = process.env.SMSAPI_TOKEN;
  const from = process.env.SMSAPI_FROM || 'MedApp';
  const testMode = process.env.SMSAPI_TEST === 'true';
  const baseUrl = process.env.SMSAPI_BASE_URL || 'https://api.smsapi.pl';
  
  if (!token) {
    throw new Error('SMSAPI_TOKEN nie jest skonfigurowany');
  }
  
  // Przygotuj numer telefonu w formacie międzynarodowym
  let formattedPhone = phone;
  if (phone.startsWith('48') && phone.length === 11) {
    formattedPhone = phone; // już z kodem kraju
  } else if (phone.length === 9) {
    formattedPhone = '48' + phone; // dodaj kod Polski
  }
  
  const smsData = {
    to: formattedPhone,
    message: message,
    from: from,
    test: testMode,
    encoding: 'utf-8'
  };
  
  try {
    console.log(`📱 Wysyłam SMS na ${formattedPhone}: "${message}"`);
    console.log(`🔧 Tryb testowy: ${testMode ? 'TAK' : 'NIE'}`);
    
    const response = await fetch(`${baseUrl}/sms.do`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(smsData)
    });
    
    const result = await response.text();
    console.log(`📊 Odpowiedź SMSAPI: ${result}`);
    
    if (!response.ok) {
      throw new Error(`SMSAPI błąd ${response.status}: ${result}`);
    }
    
    // SMSAPI zwraca ID wiadomości po wysłaniu
    return {
      success: true,
      messageId: result.trim(),
      testMode: testMode
    };
    
  } catch (error) {
    console.error('❌ Błąd wysyłania SMS przez SMSAPI:', error);
    throw error;
  }
}

// ============ NOWE FUNKCJE OCR BEZ GOOGLE CLOUD =================

// 🚀 NOWOŚĆ: GPT-4 Vision - bezpośrednia analiza obrazów (bez PDF support na Vercel)
async function analyzeFileWithGPT4Vision(filePath, symptoms, chronic_diseases, medications) {
  try {
    console.log('🤖 Próbuję GPT-4 Vision...');
    
    if (!openai) {
      throw new Error('OpenAI API niedostępne');
    }

    let base64Images = [];
    
    // Sprawdź czy to PDF czy obraz
    const fileExtension = path.extname(filePath).toLowerCase();
    
    if (fileExtension === '.pdf') {
      // Na Vercel nie obsługujemy PDF-ów z GPT-4 Vision (brak pdf-poppler)
      throw new Error('PDF-to-image conversion nie jest dostępny na Vercel - użyj innych metod OCR');
      
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension)) {
      console.log('🖼️ Przetwarzam obraz...');
      
      // Bezpośrednio obraz - czytaj jako base64 bez konwersji
      const imageBuffer = fs.readFileSync(filePath);
      const base64 = imageBuffer.toString('base64');
      base64Images.push(base64);
    } else {
      throw new Error(`Nieobsługiwany format pliku: ${fileExtension}`);
    }

    if (base64Images.length === 0) {
      throw new Error('Nie udało się przygotować obrazów');
    }

    console.log(`🖼️ Przygotowano ${base64Images.length} obrazów dla GPT-4 Vision`);

    // Przygotuj wiadomości dla GPT-4 Vision
    const content = [
      {
        type: "text",
        text: `Jestem lekarzem analizującym wyniki badań medycznych. 

KONTEKST PACJENTA:
- Symptomy: ${symptoms || 'brak'}
- Choroby przewlekłe: ${chronic_diseases || 'brak'}  
- Leki: ${medications || 'brak'}

ZADANIE: Przeanalizuj dokument medyczny na obrazach i wyciągnij WSZYSTKIE parametry laboratoryjne/badań w formacie strukturyzowanym.

WYMAGANY FORMAT ODPOWIEDZI:
Podaj wyniki w tabeli HTML <table> z kolumnami:
- Parametr 
- Wartość
- Komentarz (uwagi, zakres referencyjny)
- Data badania (YYYY-MM-DD)

Jeśli nie ma wyraźnej daty, użyj dzisiejszej. Jeśli nie ma zakresów referencyjnych, dodaj standardowe.
Zaznacz wartości poza normą.

Przeanalizuj dokładnie każdy element na obrazach.`
      }
    ];

    // Dodaj wszystkie obrazy
    base64Images.forEach((base64, index) => {
      // Wykryj typ obrazu na podstawie pierwszych bajtów
      let mimeType = 'image/jpeg';
      if (base64.startsWith('/9j/')) mimeType = 'image/jpeg';
      else if (base64.startsWith('iVBORw0KGgo')) mimeType = 'image/png';
      else if (base64.startsWith('R0lGODlh')) mimeType = 'image/gif';
      
      content.push({
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${base64}`,
          detail: "high" // wysoka jakość analizy
        }
      });
    });

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // GPT-4 Vision
      messages: [
        {
          role: "user",
          content: content
        }
      ],
      max_tokens: 4000,
      temperature: 0.1
    });

    const analysis = response.choices[0].message.content;
    console.log('✅ GPT-4 Vision - sukces!');
    
    return { 
      success: true, 
      analysis: analysis,
      method: 'GPT-4 Vision (obrazy)',
      images_processed: base64Images.length
    };

  } catch (error) {
    console.log('❌ GPT-4 Vision failed:', error.message);
    return { success: false, error: error.message };
  }
}

// 1. Próba wyciągnięcia tekstu z PDF za pomocą pdf-parse
async function extractTextFromPDFLocal(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return data.text;
  } catch (error) {
    console.log('PDF-parse failed:', error.message);
    return null;
  }
}

// 2. OCR z Tesseract.js (dla zeskanowanych PDF-ów)
async function extractTextWithTesseract(filePath) {
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'pol', {
      logger: m => console.log(m)
    });
    return text;
  } catch (error) {
    console.log('Tesseract OCR failed:', error.message);
    return null;
  }
}

// 3. Funkcja automatycznego wyboru metody OCR
async function extractTextFromPDF(filePath, symptoms = '', chronic_diseases = '', medications = '') {
  console.log('🔍 Rozpoczynam ekstrakcję tekstu z PDF...');
  
  // 🚀 NOWOŚĆ: Najpierw próbuj GPT-4 Vision (jeśli dostępne)
  if (openai) {
    console.log('🤖 Próbuję GPT-4 Vision jako pierwszą opcję...');
    const visionResult = await analyzeFileWithGPT4Vision(filePath, symptoms, chronic_diseases, medications);
    
    if (visionResult.success) {
      console.log(`✅ GPT-4 Vision sukces - przetworzono ${visionResult.images_processed} obrazów`);
      return {
        text: visionResult.analysis,
        method: 'GPT-4 Vision',
        isDirectAnalysis: true // oznacza że to już gotowa analiza, nie surowy tekst
      };
    } else {
      console.log(`⚠️ GPT-4 Vision failed: ${visionResult.error}, próbuję inne metody...`);
    }
  } else {
    console.log('⚠️ OpenAI API niedostępne, pomijam GPT-4 Vision');
  }

  // Fallback: Stare metody OCR dla wyciągnięcia surowego tekstu
  console.log('📄 Próbuję pdf-parse...');
  let text = await extractTextFromPDFLocal(filePath);
  
  if (text && text.trim().length > 50) {
    console.log('✅ PDF-parse sukces - znaleziono tekst');
    return { text, method: 'pdf-parse', isDirectAnalysis: false };
  }
  
  console.log('⚠️ PDF-parse nie wykrył wystarczająco tekstu, próbuję Tesseract OCR...');
  
  // Jeśli pdf-parse nie zadziałał, użyj Tesseract
  text = await extractTextWithTesseract(filePath);
  
  if (text && text.trim().length > 20) {
    console.log('✅ Tesseract OCR sukces');
    return { text, method: 'Tesseract', isDirectAnalysis: false };
  }
  
  // Jeśli mamy Google Cloud, spróbuj jako ostatnia opcja (ale pewnie będzie błąd billing)
  if (visionClient && gcsStorage) {
    console.log('🌥️ Próbuję Google Cloud OCR jako ostatnią opcję...');
    try {
      const bucketName = process.env.GCS_BUCKET_NAME;
      const destFileName = `${Date.now()}-${path.basename(filePath)}`;
      const gcsSourceUri = await uploadFileToGCS(filePath, bucketName, destFileName);
      const ocrResultPrefix = `ocr-results/${Date.now()}/`;
      const gcsDestinationUri = `gs://${bucketName}/${ocrResultPrefix}`;
      await extractTextFromPDFWithOCR(gcsSourceUri, gcsDestinationUri);
      text = await downloadOcrResultFromGCS(bucketName, ocrResultPrefix);
      
      if (text && text.trim().length > 20) {
        console.log('✅ Google Cloud OCR sukces');
        return { text, method: 'Google Cloud OCR', isDirectAnalysis: false };
      }
    } catch (error) {
      console.log('❌ Google Cloud OCR failed:', error.message);
    }
  }
  
  console.log('❌ Wszystkie metody OCR zawiodły');
  throw new Error('Nie udało się wyciągnąć tekstu z PDF. Sprawdź czy plik zawiera czytelny tekst.');
}

// ============ STARE FUNKCJE GOOGLE CLOUD (zachowane dla kompatybilności) =================

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

// ============ MEDLINE PLUS =================
async function getMedlinePlusInfo(term) {
  const url = `https://wsearch.nlm.nih.gov/ws/query?db=healthTopics&term=${encodeURIComponent(term)}&retmax=1`;
  try {
    const res = await fetch(url);
    const text = await res.text();
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

app.post('/api/register', async (req, res) => {
  const { name, email, phone } = req.body;
  const sanitizedPhone = sanitizePhone(phone);
  
  try {
    // Sprawdź czy użytkownik już istnieje (email lub telefon)
    const { rows: existingUsers } = await pool.query(
      'SELECT email, phone FROM users WHERE email = $1 OR phone = $2',
      [email, sanitizedPhone]
    );
    
    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];
      if (existingUser.email === email) {
        return res.status(409).json({ error: 'Użytkownik z tym adresem email już istnieje' });
      }
      if (existingUser.phone === sanitizedPhone) {
        return res.status(409).json({ error: 'Użytkownik z tym numerem telefonu już istnieje' });
      }
    }
    
    // Jeśli użytkownik nie istnieje, dodaj go
    await pool.query(
      'INSERT INTO users (name, email, phone) VALUES ($1, $2, $3)',
      [name, email, sanitizedPhone]
    );
    res.status(201).json({ message: 'Rejestracja udana!' });
  } catch (error) {
    console.error('Błąd rejestracji:', error);
    
    // Dodatkowa obsługa błędów unique constraint na wypadek race condition
    if (error.code === '23505') {
      if (error.constraint === 'users_email_key') {
        return res.status(409).json({ error: 'Użytkownik z tym adresem email już istnieje' });
      }
      if (error.constraint === 'users_phone_key') {
        return res.status(409).json({ error: 'Użytkownik z tym numerem telefonu już istnieje' });
      }
      return res.status(409).json({ error: 'Użytkownik z tymi danymi już istnieje' });
    }
    
    res.status(500).json({ error: 'Błąd serwera podczas rejestracji' });
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
app.post('/api/analyze-file', async (req, res) => {
  const { document_id, user_id } = req.body;
  try {
    const { rows: docs } = await pool.query(
      'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
      [document_id, user_id]
    );
    if (!docs.length) return res.status(404).json({ error: 'Nie znaleziono pliku' });

    const filePath = path.join(uploadDir, docs[0].filepath);

    // NOWA LOGIKA: Użyj lokalnego OCR zamiast Google Cloud
    console.log(`🔍 Analizuję plik: ${docs[0].filename}`);
    let extractResult;
    
    try {
      extractResult = await extractTextFromPDF(filePath, docs[0].symptoms, docs[0].chronic_diseases, docs[0].medications);
      console.log(`✅ Wyciągnięto ${extractResult.text.length} znaków tekstu metodą: ${extractResult.method}`);
    } catch (ocrError) {
      console.error('❌ Błąd OCR:', ocrError.message);
      return res.status(500).json({ 
        error: 'Nie udało się wyciągnąć tekstu z pliku PDF. Sprawdź czy plik zawiera czytelny tekst.',
        details: ocrError.message 
      });
    }

    const { symptoms, chronic_diseases, medications } = docs[0];
    let analysis;

    // 🚀 Jeśli GPT-4 Vision już dokonał analizy, użyj jej bezpośrednio
    if (extractResult.isDirectAnalysis) {
      console.log('🤖 Używam gotowej analizy z GPT-4 Vision');
      analysis = extractResult.text;
      
      // Dodaj info o metodzie na końcu
      analysis += `\n\n<p><small><strong>Metoda analizy:</strong> ${extractResult.method}</small></p>`;
      
    } else {
      // Standardowa ścieżka: wyciągnięty tekst + analiza przez OpenAI
      console.log(`📝 Analizuję wyciągnięty tekst metodą: ${extractResult.method}`);
      
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
      if ((extractResult.text || '').toLowerCase().includes('anemia')) {
        medicalInfo = await getMedlinePlusInfo('anemia');
      }
     
      const { rows: previousParameters } = await pool.query(
        'SELECT parameter_name, parameter_value, measurement_date FROM parameters WHERE user_id = $1 ORDER BY measurement_date DESC LIMIT 10',
        [user_id]
      );

      let historyText = '';
      if (previousParameters.length > 0) {
        historyText = 'Moje poprzednie wyniki badań to:\n' + previousParameters.map(
          p => `${p.parameter_name}: ${p.parameter_value} (Data: ${p.measurement_date})`
        ).join('\n');
      }
      
      // -- GŁÓWNY PROMPT --
      const prompt = `
${historyText ? historyText + '\n\n' : ''}
Biorąc pod uwagę moje symptomy: ${symptoms || 'brak'}, oraz choroby przewlekłe: ${chronic_diseases || 'brak'}, oraz leki jakie biorę: ${medications || 'brak'}, przeanalizuj poniższe wyniki badań laboratoryjnych.

Podaj wyniki badań w tabeli HTML (<table>) z następującymi kolumnami: Parametr, Wartość, Komentarz, Data badania (YYYY-MM-DD).

Oto tekst z badania (wyniki laboratoryjne):
${extractResult.text}
${medicalInfo ? "\n\nDodatkowe informacje z MedlinePlus:\n" + medicalInfo : ""}
... Jeśli w tekście nie ma wyraźnych dat badań, użyj daty z nazwy pliku lub przyjmij dzisiejszą datę.
Jeśli w tekście nie ma wyraźnych wartości referencyjnych, dodaj standardowe zakresy referencyjne w komentarzu.
Jeśli jakieś wartości są poza zakresem referencyjnym, wyraźnie to zaznacz w komentarzu.
Jeśli istnieją istotne zmiany względem poprzednich badań, wskaż je.`;

      const openAiMessages = [
        {
          role: "system",
          content: "Jesteś doświadczonym lekarzem, który analizuje wyniki badań laboratoryjnych. Przeprowadzasz dokładną analizę tych badań biorąc pod uwagę choroby, leki i objawy pacjenta. Zwracasz szczególną uwagę na nieprawidłowe wyniki. Zachowujesz profesjonalny i empatyczny ton. Potrafisz odczytać i zinterpretować nawet niewyraźne lub częściowo uszkodzone wyniki badań. Jeśli dane są niekompletne lub nieczytelne, zaznaczasz to w komentarzu."
        },
        ...chatHistory,
        { role: "user", content: prompt }
      ];

      try {
        if (!openai) {
          throw new Error('OpenAI API niedostępne - brak klucza API');
        }
        
        const completion = await openai.chat.completions.create({
          model: "gpt-4o", // Używamy najnowszego modelu
          messages: openAiMessages,
          temperature: 0.2,
        });
        analysis = completion.choices[0].message.content;
        
        // Dodaj info o metodzie OCR na końcu
        analysis += `\n\n<p><small><strong>Metoda OCR:</strong> ${extractResult.method}</small></p>`;
        
      } catch (err) {
        console.error('[OPENAI] Błąd połączenia z ChatGPT:', err);
        return res.status(500).json({ 
          error: 'Błąd analizy AI', 
          details: err.message 
        });
      }

      // Zapisz do historii (agent_memory) tylko gdy nie było bezpośredniej analizy
      if (pool) {
        await pool.query(
          'INSERT INTO agent_memory (user_id, message, role) VALUES ($1, $2, $3)', 
          [user_id, prompt, 'user']
        );
        await pool.query(
          'INSERT INTO agent_memory (user_id, message, role) VALUES ($1, $2, $3)', 
          [user_id, analysis, 'assistant']
        );
      }
    }

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
            if (pool) {
              await pool.query(
                'INSERT INTO parameters (user_id, document_id, parameter_name, parameter_value, parameter_comment, measurement_date) VALUES ($1, $2, $3, $4, $5, $6)',
                [user_id, document_id, paramName, paramValue, paramComment, paramDate]
              );
            }
          } catch (err) {
            console.error('Błąd dodawania parametru:', err);
          }
        }
      }
    }

    // Save analysis HTML
    if (pool) {
      await pool.query(
        'UPDATE documents SET analysis = $1 WHERE id = $2',
        [analysis, document_id]
      );
    }

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
        model: "gpt-4o",
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

// --- NOWE ENDPOINTY SMS AUTHENTICATION ---

// TYMCZASOWY ENDPOINT DO MIGRACJI - usuń po użyciu
app.post('/api/migrate-sms-columns', async (req, res) => {
  try {
    console.log('🔄 Rozpoczynam migrację kolumn SMS...');
    
    // Dodaj kolumny code i code_expires jeśli nie istnieją
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS code VARCHAR(4)');
    await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS code_expires TIMESTAMP');
    
    // Dodaj indeks dla kodów SMS
    await pool.query('CREATE INDEX IF NOT EXISTS idx_users_code ON users(code) WHERE code IS NOT NULL');
    
    console.log('✅ Migracja zakończona pomyślnie');
    res.json({ message: 'Migracja kolumn SMS zakończona pomyślnie!' });
    
  } catch (error) {
    console.error('❌ Błąd migracji:', error);
    res.status(500).json({ error: 'Błąd migracji: ' + error.message });
  }
});

app.post('/api/send-sms-code', async (req, res) => {
  const { phone } = req.body;
  const sanitizedPhone = sanitizePhone(phone);
  
  try {
    // Sprawdź czy użytkownik istnieje
    const { rows: users } = await pool.query(
      'SELECT id FROM users WHERE phone = $1',
      [sanitizedPhone]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'Nie znaleziono użytkownika z tym numerem telefonu' });
    }
    
    // Wygeneruj 4-cyfrowy kod
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const codeExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 minut ważności
    
    // Zapisz kod w bazie
    await pool.query(
      'UPDATE users SET code = $1, code_expires = $2 WHERE phone = $3',
      [code, codeExpires, sanitizedPhone]
    );
    
    // Przygotuj wiadomość SMS
    const smsMessage = `Twój kod logowania: ${code}. Kod wygasa za 5 minut.`;
    
    try {
      // Wyślij SMS przez SMSAPI.pl
      const smsResult = await sendSMSViaSMSAPI(sanitizedPhone, smsMessage);
      
      console.log(`✅ SMS wysłany pomyślnie na ${sanitizedPhone}`);
      console.log(`📱 ID wiadomości: ${smsResult.messageId}`);
      
      // Jeśli SMS został wysłany pomyślnie
      res.json({ 
        message: smsResult.testMode 
          ? 'Kod SMS został wysłany (tryb testowy)'
          : 'Kod SMS został wysłany na Twój numer telefonu',
        codeId: smsResult.messageId,
        testMode: smsResult.testMode
      });
      
    } catch (smsError) {
      console.error('❌ Błąd wysyłania SMS:', smsError.message);
      
      // Sprawdź czy to błąd konfiguracji SMSAPI
      const isConfigError = smsError.message.includes('SMSAPI_TOKEN nie jest skonfigurowany') ||
                           smsError.message.includes('SMSAPI błąd') ||
                           smsError.message.includes('fetch');
      
      // Tryb fallback - pokaż kod w odpowiedzi jeśli SMSAPI nie jest skonfigurowany
      if (isConfigError) {
        console.log(`🔄 Fallback: SMSAPI nie skonfigurowany, pokazuję kod testowy`);
        console.log(`📱 Kod SMS dla ${sanitizedPhone}: ${code}`);
        
        res.json({ 
          message: 'SMSAPI nie jest skonfigurowany - użyj kodu testowego poniżej',
          codeId: `fallback_${Date.now()}`,
          testCode: code,
          warning: 'Skonfiguruj SMSAPI.pl aby otrzymywać prawdziwe SMS-y',
          smsError: smsError.message,
          configurationNeeded: true
        });
      } else {
        // Inne błędy SMS (np. błędy sieci, nieprawidłowy numer itp.)
        res.status(500).json({ 
          error: 'Nie udało się wysłać kodu SMS. Spróbuj ponownie później.',
          details: process.env.NODE_ENV === 'development' ? smsError.message : undefined,
          canRetry: true
        });
      }
    }
    
  } catch (error) {
    console.error('Błąd ogólny w send-sms-code:', error);
    res.status(500).json({ error: 'Błąd wysyłania kodu SMS' });
  }
});

app.post('/api/verify-sms-code', async (req, res) => {
  const { phone, code, codeId } = req.body;
  const sanitizedPhone = sanitizePhone(phone);
  
  try {
    // Sprawdź kod w bazie
    const { rows: users } = await pool.query(
      'SELECT * FROM users WHERE phone = $1 AND code = $2 AND code_expires > NOW()',
      [sanitizedPhone, code]
    );
    
    if (users.length === 0) {
      return res.status(400).json({ error: 'Nieprawidłowy lub wygasły kod SMS' });
    }
    
    const user = users[0];
    
    // Wyczyść kod po udanej weryfikacji
    await pool.query(
      'UPDATE users SET code = NULL, code_expires = NULL WHERE id = $1',
      [user.id]
    );
    
    // Zwróć dane użytkownika (bez kodu)
    const { code: _, code_expires: __, ...userWithoutCode } = user;
    res.json({ user: userWithoutCode });
    
  } catch (error) {
    console.error('Błąd weryfikacji kodu SMS:', error);
    res.status(500).json({ error: 'Błąd weryfikacji kodu SMS' });
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