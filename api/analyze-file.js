const { pool, openai } = require('./_config');
const path = require('path');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const Tesseract = require('tesseract.js');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

// Próbuj załadować pdf-poppler i sharp tylko jeśli są dostępne (lokalnie)
let pdf, sharp;
try {
  pdf = require('pdf-poppler');
  sharp = require('sharp');
  console.log('✅ pdf-poppler i sharp dostępne - konwersja PDF do obrazów włączona');
} catch (error) {
  console.log('⚠️ pdf-poppler lub sharp niedostępne - konwersja PDF do obrazów wyłączona');
}

// GPT-4 Vision function z obsługą konwersji PDF → obraz
async function analyzeFileWithGPT4Vision(filePath, symptoms, chronic_diseases, medications) {
  try {
    console.log('🤖 Próbuję GPT-4 Vision...');
    
    if (!openai) {
      throw new Error('OpenAI API niedostępne');
    }

    let base64Images = [];
    const fileExtension = path.extname(filePath).toLowerCase();
    
    if (fileExtension === '.pdf') {
      // Próbuj konwertować PDF na obrazy (tylko jeśli pdf-poppler jest dostępne)
      if (!pdf || !sharp) {
        throw new Error('PDF-to-image conversion niedostępny na tym środowisku - użyj innych metod OCR');
      }
      
      console.log('📄 Konwertuję PDF na obrazy...');
      
      const outputDir = path.join(path.dirname(filePath), 'temp_images');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const options = {
        format: 'jpeg',
        out_dir: outputDir,
        out_prefix: 'page',
        page: null // wszystkie strony
      };
      
      const pdfData = await pdf.convert(filePath, options);
      console.log(`📄 Skonwertowano ${pdfData.length} stron PDF`);
      
      // Czytaj każdą stronę jako base64
      for (let i = 1; i <= pdfData.length; i++) {
        const imagePath = path.join(outputDir, `page-${i}.jpg`);
        if (fs.existsSync(imagePath)) {
          // Zmniejsz rozmiar obrazu dla OpenAI
          const optimizedBuffer = await sharp(imagePath)
            .resize(1500, null, { withoutEnlargement: true, fit: 'inside' })
            .jpeg({ quality: 85 })
            .toBuffer();
          
          const base64 = optimizedBuffer.toString('base64');
          base64Images.push(base64);
        }
      }
      
      // Sprzątanie
      fs.rmSync(outputDir, { recursive: true, force: true });
      
    } else if (['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(fileExtension)) {
      console.log('🖼️ Przetwarzam obraz...');
      
      // Bezpośrednio obraz
      let imageBuffer;
      if (sharp) {
        // Optymalizacja obrazu jeśli sharp dostępne
        imageBuffer = await sharp(filePath)
          .resize(1500, null, { withoutEnlargement: true, fit: 'inside' })
          .jpeg({ quality: 85 })
          .toBuffer();
      } else {
        // Bez optymalizacji
        imageBuffer = fs.readFileSync(filePath);
      }
      
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
      method: pdf && sharp ? 'GPT-4 Vision (PDF→obraz)' : 'GPT-4 Vision (obraz)',
      images_processed: base64Images.length
    };

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

// Funkcja do sprawdzenia jakości wyciągniętego tekstu
function isTextReadable(text) {
  if (!text || text.trim().length < 50) return false;
  
  // Sprawdź stosunek alfanumerycznych znaków do wszystkich
  const alphanumericChars = text.match(/[a-zA-Z0-9]/g) || [];
  const totalChars = text.replace(/\s/g, '').length;
  
  if (totalChars === 0) return false;
  
  const alphanumericRatio = alphanumericChars.length / totalChars;
  
  // Jeśli mniej niż 30% znaków to alfanumeryczne, prawdopodobnie to śmieci
  if (alphanumericRatio < 0.3) return false;
  
  // Sprawdź czy tekst zawiera znane słowa medyczne lub cyfry
  const medicalKeywords = ['badanie', 'wynik', 'norma', 'mg', 'dl', 'mmol', 'laboratoria', 'krew', 'mocz', 'ciśnienie'];
  const hasKeywords = medicalKeywords.some(keyword => 
    text.toLowerCase().includes(keyword)
  );
  
  // Sprawdź czy jest dużo cyfr (typowe dla wyników badań)
  const numberMatches = text.match(/\d+/g) || [];
  const hasNumbers = numberMatches.length > 3;
  
  return hasKeywords || hasNumbers || alphanumericRatio > 0.6;
}

async function extractTextFromPDF(filePath, symptoms = '', chronic_diseases = '', medications = '') {
  console.log('🔍 Rozpoczynam ekstrakcję tekstu z PDF...');
  
  const fileExtension = path.extname(filePath).toLowerCase();
  
  // Najpierw sprawdź czy to PDF czy obraz
  if (fileExtension !== '.pdf') {
    // Dla obrazów: bezpośrednio GPT-4 Vision
    if (openai) {
      console.log('🖼️ Obraz - próbuję GPT-4 Vision...');
      const visionResult = await analyzeFileWithGPT4Vision(filePath, symptoms, chronic_diseases, medications);
      
      if (visionResult.success) {
        console.log(`✅ GPT-4 Vision sukces dla obrazu`);
        return {
          text: visionResult.analysis,
          method: 'GPT-4 Vision (obraz)',
          isDirectAnalysis: true
        };
      }
    }
    
    // Fallback dla obrazów: Tesseract
    console.log('⚠️ GPT-4 Vision failed dla obrazu, próbuję Tesseract...');
    const text = await extractTextWithTesseract(filePath);
    if (text && text.trim().length > 20) {
      console.log('✅ Tesseract OCR sukces');
      return { text, method: 'Tesseract', isDirectAnalysis: false };
    }
    
    throw new Error('Nie udało się wyciągnąć tekstu z obrazu.');
  }
  
  // Dla PDF-ów: najpierw sprawdź pdf-parse
  console.log('📄 PDF - próbuję pdf-parse...');
  let text = await extractTextFromPDFLocal(filePath);
  
  if (text && isTextReadable(text)) {
    console.log('✅ PDF-parse sukces - znaleziono czytelny tekst');
    return { text, method: 'pdf-parse', isDirectAnalysis: false };
  } else if (text) {
    console.log(`⚠️ PDF-parse wyciągnął tekst (${text.length} znaków), ale wydaje się nieczytelny`);
    console.log('📝 Przykład tekstu:', text.substring(0, 200));
  }
  
  // PDF jest nieczytelny - próbuj konwersję PDF → obraz → GPT-4 Vision
  if (openai) {
    console.log('🤖 PDF nieczytelny - próbuję konwersję PDF→obraz→GPT-4 Vision...');
    const visionResult = await analyzeFileWithGPT4Vision(filePath, symptoms, chronic_diseases, medications);
    
    if (visionResult.success) {
      console.log(`✅ GPT-4 Vision sukces - przetworzono ${visionResult.images_processed} stron PDF`);
      return {
        text: visionResult.analysis,
        method: visionResult.method,
        isDirectAnalysis: true
      };
    } else {
      console.log(`⚠️ GPT-4 Vision PDF→obraz failed: ${visionResult.error}`);
    }
  }
  
  // Ostatnia szansa: Tesseract (ale nie zadziała z PDF)
  console.log('⚠️ Ostatnia próba - Tesseract OCR...');
  
  // Informacja o ograniczeniach
  if (!pdf || !sharp) {
    console.log('❌ Konwersja PDF→obraz niedostępna na tym środowisku');
    throw new Error('Plik PDF jest zeskanowanym dokumentem i wymaga OCR. Na tym środowisku nie można konwertować PDF na obrazy. Spróbuj przesłać plik jako obraz (JPG/PNG) lub użyj PDF z tekstem cyfrowym.');
  }
  
  // Tesseract nie radzi sobie z PDF bezpośrednio
  console.log('❌ Tesseract nie może czytać PDF-ów bezpośrednio');
  throw new Error('Nie udało się wyciągnąć tekstu z PDF. Wszystkie metody OCR zawiodły.');
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