const { pool, openai } = require('./_config');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

// GPT-4 Vision function (simplified for Vercel - images only)
async function analyzeFileWithGPT4Vision(filePath, symptoms, chronic_diseases, medications) {
  try {
    console.log('🤖 Próbuję GPT-4 Vision...');
    
    if (!openai) {
      throw new Error('OpenAI API niedostępne');
    }

    const fileExtension = path.extname(filePath).toLowerCase();
    
    if (fileExtension === '.pdf') {
      // Na Vercel nie obsługujemy PDF-ów z GPT-4 Vision
      throw new Error('PDF-to-image conversion nie jest dostępny na Vercel - użyj innych metod OCR');
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension)) {
      const imageBuffer = fs.readFileSync(filePath);
      const base64 = imageBuffer.toString('base64');
      
      let mimeType = 'image/jpeg';
      if (base64.startsWith('/9j/')) mimeType = 'image/jpeg';
      else if (base64.startsWith('iVBORw0KGgo')) mimeType = 'image/png';
      else if (base64.startsWith('R0lGODlh')) mimeType = 'image/gif';

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{
          role: "user",
          content: [
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
Zaznacz wartości poza normą.`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
                detail: "high"
              }
            }
          ]
        }],
        max_tokens: 4000,
        temperature: 0.1
      });

      return { 
        success: true, 
        analysis: response.choices[0].message.content,
        method: 'GPT-4 Vision (obrazy)',
        images_processed: 1
      };
    } else {
      throw new Error(`Nieobsługiwany format pliku: ${fileExtension}`);
    }
  } catch (error) {
    console.log('❌ GPT-4 Vision failed:', error.message);
    return { success: false, error: error.message };
  }
}

// OCR functions
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

async function extractTextWithTesseract(filePath) {
  try {
    const { data: { text } } = await Tesseract.recognize(filePath, 'pol');
    return text;
  } catch (error) {
    console.log('Tesseract OCR failed:', error.message);
    return null;
  }
}

async function extractTextFromPDF(filePath, symptoms = '', chronic_diseases = '', medications = '') {
  console.log('🔍 Rozpoczynam ekstrakcję tekstu z PDF...');
  
  // Najpierw próbuj GPT-4 Vision (jeśli dostępne)
  if (openai) {
    console.log('🤖 Próbuję GPT-4 Vision jako pierwszą opcję...');
    const visionResult = await analyzeFileWithGPT4Vision(filePath, symptoms, chronic_diseases, medications);
    
    if (visionResult.success) {
      console.log(`✅ GPT-4 Vision sukces - przetworzono ${visionResult.images_processed} obrazów`);
      return {
        text: visionResult.analysis,
        method: 'GPT-4 Vision',
        isDirectAnalysis: true
      };
    } else {
      console.log(`⚠️ GPT-4 Vision failed: ${visionResult.error}, próbuję inne metody...`);
    }
  }

  // Fallback: pdf-parse
  console.log('📄 Próbuję pdf-parse...');
  let text = await extractTextFromPDFLocal(filePath);
  
  if (text && text.trim().length > 50) {
    console.log('✅ PDF-parse sukces - znaleziono tekst');
    return { text, method: 'pdf-parse', isDirectAnalysis: false };
  }
  
  // Fallback: Tesseract
  console.log('⚠️ PDF-parse nie wykrył tekstu, próbuję Tesseract OCR...');
  text = await extractTextWithTesseract(filePath);
  
  if (text && text.trim().length > 20) {
    console.log('✅ Tesseract OCR sukces');
    return { text, method: 'Tesseract', isDirectAnalysis: false };
  }
  
  console.log('❌ Wszystkie metody OCR zawiodły');
  throw new Error('Nie udało się wyciągnąć tekstu z PDF. Sprawdź czy plik zawiera czytelny tekst.');
}

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

  const { document_id, user_id } = req.body;
  
  try {
    const { rows: docs } = await pool.query(
      'SELECT * FROM documents WHERE id = $1 AND user_id = $2',
      [document_id, user_id]
    );
    
    if (!docs.length) {
      return res.status(404).json({ error: 'Nie znaleziono pliku' });
    }

    // Szukaj pliku w różnych lokalizacjach
    const uploadDir = '/tmp/uploads';
    let filePath = path.join(uploadDir, docs[0].filepath);
    
    // Sprawdź czy plik istnieje w /tmp/uploads
    if (!fs.existsSync(filePath)) {
      // Spróbuj backend/tmp (dla development)
      const backendTmpPath = path.join(process.cwd(), 'backend/tmp', docs[0].filename);
      if (fs.existsSync(backendTmpPath)) {
        filePath = backendTmpPath;
      } else {
        return res.status(404).json({ 
          error: 'Plik nie został znaleziony',
          details: `Sprawdzono lokalizacje: ${filePath}, ${backendTmpPath}`
        });
      }
    }

    console.log(`🔍 Analizuję plik: ${docs[0].filename} w lokalizacji: ${filePath}`);
    
    let extractResult;
    try {
      extractResult = await extractTextFromPDF(filePath, docs[0].symptoms, docs[0].chronic_diseases, docs[0].medications);
      console.log(`✅ Wyciągnięto ${extractResult.text.length} znaków tekstu metodą: ${extractResult.method}`);
    } catch (ocrError) {
      console.error('❌ Błąd OCR:', ocrError.message);
      return res.status(500).json({ 
        error: 'Nie udało się wyciągnąć tekstu z pliku PDF.',
        details: ocrError.message 
      });
    }

    const { symptoms, chronic_diseases, medications } = docs[0];
    let analysis;

    // Jeśli GPT-4 Vision już dokonał analizy, użyj jej bezpośrednio
    if (extractResult.isDirectAnalysis) {
      console.log('🤖 Używam gotowej analizy z GPT-4 Vision');
      analysis = extractResult.text;
      analysis += `\n\n<p><small><strong>Metoda analizy:</strong> ${extractResult.method}</small></p>`;
    } else {
      // Standardowa analiza przez OpenAI
      console.log(`📝 Analizuję wyciągnięty tekst metodą: ${extractResult.method}`);
      
      const prompt = `
Biorąc pod uwagę moje symptomy: ${symptoms || 'brak'}, oraz choroby przewlekłe: ${chronic_diseases || 'brak'}, oraz leki jakie biorę: ${medications || 'brak'}, przeanalizuj poniższe wyniki badań laboratoryjnych.

Podaj wyniki badań w tabeli HTML (<table>) z następującymi kolumnami: Parametr, Wartość, Komentarz, Data badania (YYYY-MM-DD).

Oto tekst z badania (wyniki laboratoryjne):
${extractResult.text}

Jeśli w tekście nie ma wyraźnych dat badań, użyj dzisiejszej daty.
Jeśli w tekście nie ma wyraźnych wartości referencyjnych, dodaj standardowe zakresy.
Jeśli jakieś wartości są poza zakresem referencyjnym, wyraźnie to zaznacz.`;

      try {
        if (!openai) {
          throw new Error('OpenAI API niedostępne - brak klucza API');
        }
        
        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: "Jesteś doświadczonym lekarzem, który analizuje wyniki badań laboratoryjnych. Zwracasz szczególną uwagę na nieprawidłowe wyniki."
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
        });
        analysis = completion.choices[0].message.content;
        analysis += `\n\n<p><small><strong>Metoda OCR:</strong> ${extractResult.method}</small></p>`;
        
      } catch (err) {
        console.error('[OPENAI] Błąd połączenia z ChatGPT:', err);
        return res.status(500).json({ 
          error: 'Błąd analizy AI', 
          details: err.message 
        });
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

    // Zapisz analizę
    if (pool) {
      await pool.query(
        'UPDATE documents SET analysis = $1 WHERE id = $2',
        [analysis, document_id]
      );
    }

    res.json({ analysis });
  } catch (error) {
    console.error('Błąd analizy:', error);
    res.status(500).json({ 
      error: 'Błąd podczas analizy pliku',
      details: error.message 
    });
  }
} 