-- Migration: Dodanie kolumn dla logowania SMS do tabeli users
-- Uruchom to w konsoli Neon.tech lub psql

-- Dodaj kolumny dla kodów SMS
ALTER TABLE users ADD COLUMN IF NOT EXISTS code VARCHAR(4);
ALTER TABLE users ADD COLUMN IF NOT EXISTS code_expires TIMESTAMP;

-- Dodaj indeks dla kodów SMS (dla szybkiego wyszukiwania)
CREATE INDEX IF NOT EXISTS idx_users_code ON users(code) WHERE code IS NOT NULL;

-- Sprawdź strukturę tabeli
\d users;

SELECT 'Kolumny SMS zostały dodane pomyślnie!' as status; 