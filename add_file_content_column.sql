-- Dodanie kolumny file_content do tabeli documents
-- Ta kolumna będzie przechowywać zawartość pliku jako base64 string

ALTER TABLE documents 
ADD COLUMN file_content TEXT;

-- Dodanie komentarza do kolumny
COMMENT ON COLUMN documents.file_content IS 'Zawartość pliku zakodowana w base64 - dla trwałego przechowywania na Vercel';

-- Sprawdzenie struktury tabeli
\d documents; 