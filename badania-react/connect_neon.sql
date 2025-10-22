-- Instrukcje połączenia z bazą Neon.tech
-- 
-- KROK 1: Zaloguj się do https://neon.tech/
-- KROK 2: Przejdź do swojego projektu "badania" 
-- KROK 3: W sekcji "Connection string" skopiuj dane połączenia
-- KROK 4: Użyj psql lub pgAdmin do połączenia

-- Przykład connectionString (zastąp swoimi danymi):
-- postgresql://username:password@ep-example.us-east-1.aws.neon.tech/database?sslmode=require

-- SPRAWDŹ OBECNY STAN BAZY:
SELECT 'Użytkownicy:' as info;
SELECT id, name, email, phone FROM users;

SELECT 'Dokumenty:' as info;
SELECT id, user_id, filename, upload_date FROM documents;

SELECT 'Parametry:' as info; 
SELECT id, user_id, parameter_name, parameter_value, measurement_date FROM parameters;

-- PRZYWRÓĆ PRZYKŁADOWE DANE (jeśli potrzebne):
INSERT INTO users (name, email, phone) VALUES 
('Jan Kowalski', 'jan.kowalski@example.com', '123456789'),
('Anna Nowak', 'anna.nowak@example.com', '987654321')
ON CONFLICT (email) DO NOTHING;

-- SPRAWDŹ STRUKTURE TABEL:
\dt

-- SPRAWDŹ INDEKSY:
\di

-- SPRAWDŹ ROZMIAR BAZY:
SELECT pg_size_pretty(pg_database_size(current_database())) as database_size; 