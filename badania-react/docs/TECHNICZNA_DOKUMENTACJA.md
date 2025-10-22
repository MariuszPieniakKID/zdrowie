# Dokumentacja techniczna – Badania (AI analiza wyników)

## 1. Przegląd systemu
- **Cel**: Aplikacja webowa do analizy wyników badań medycznych z plików PDF/obrazów, z ekstrakcją parametrów i wizualizacją.
- **Stos technologiczny**:
  - Frontend: React (`src/`)
  - Backend: Node.js/Express (`backend/api/index.js`) + wariant serverless (`api/*`)
  - Baza danych: PostgreSQL (Neon w prod, lokalnie `badania_local`)
  - AI: OpenAI (Chat Completions, model „gpt-4o”)
  - OCR: pdf-parse (tekst), GPT‑4 Vision (obrazy oraz PDF→obrazy), Tesseract.js (lokalnie), Google Cloud Vision (opcjonalny backup)
  - Hosting: Vercel (frontend i backend)

## 2. Struktura repozytorium (wysokopoziomowo)
- `src/` – aplikacja React: logowanie SMS, rejestracja, przesyłanie, analiza, wykresy
- `backend/` – serwer Express, główne API, integracje OCR/AI, PostgreSQL
- `api/` – funkcje serverless (Vercel) dla minimalnego API (login, register, analyze-file)
- `database_setup.sql` – schema bazy danych (users, documents, parameters, agent_memory)
- `add_file_content_column.sql` – migracja: kolumna `documents.file_content`
- `add_sms_columns.sql` – migracja: kolumny `users.code`, `users.code_expires`
- `scripts/db_reset.sh` – reset lokalnej bazy i odtworzenie schematu
- `vercel.json` (root) – routing frontend/build + mapowanie `/api`
- `backend/vercel.json` – routing backendu na Vercel

## 3. Środowiska i zmienne
- Wymagane (backend):
  - `DATABASE_URL` – PostgreSQL (Neon w prod / lokalny dev)
  - `OPENAI_API_KEY` – klucz OpenAI
- Opcjonalne (OCR backup):
  - `GCP_PROJECT_ID`, `GCP_SERVICE_ACCOUNT_EMAIL`, `GCP_PRIVATE_KEY`, `GCS_BUCKET_NAME`
- SMS (opcjonalnie, dla produkcyjnego wysyłania SMS):
  - `SMSAPI_TOKEN`, `SMSAPI_FROM`, `SMSAPI_TEST` (opcjonalnie), `SMSAPI_BASE_URL` (opcjonalnie)
- Porty lokalnie: frontend 3000, backend 3001

Lokalny plik przykładowy: `backend/env.example`.

## 4. Backend (Express) – główne elementy
Plik: `backend/api/index.js`

- Inicjalizacje: `dotenv`, `express`, `pg` (Pool), `multer`, `openai`, `pdf-parse`, `tesseract.js` (pomijany na Vercel), `@google-cloud/vision` i `@google-cloud/storage` (opcjonalnie), `cheerio`.
- CORS: `http://localhost:3000`, `https://zdrowie-pi.vercel.app`
- Katalog uploadów: `/tmp/uploads`
- Połączenie DB: `Pool({ connectionString: DATABASE_URL, ssl: production ? { rejectUnauthorized: false } : false })`

### 4.1. Endpoints (REST)
- `GET /` – healthcheck
- `POST /api/register` – rejestracja użytkownika (unikalne `email`, `phone`)
- `POST /api/login` – PROSTA ścieżka logowania po numerze telefonu (dla zgodności wstecznej)
- `GET /api/user/:id` – dane użytkownika
- `POST /api/upload` – upload pliku (PDF/obraz), zapis metadanych oraz base64 w DB (kolumna `file_content`), usunięcie temp pliku
- `GET /api/documents/:user_id?page=N` – lista dokumentów (paginacja: 3/strona)
- `DELETE /api/document/:id` – usuwanie dokumentu (wraz z parametrami)
- `GET /api/parameters/:user_id` – parametry zdrowotne użytkownika
- `POST /api/analyze-file` – analiza dokumentu z AI:
  - rekonstrukcja pliku z `documents.file_content` do `/tmp/uploads`
  - ekstrakcja tekstu (priorytet: GPT‑4 Vision dla obrazów / pdf‑parse / GCP OCR opcjonalnie)
  - analiza z OpenAI, zwrócenie tabeli HTML
  - sparsowanie tabeli i zapis do `parameters`
  - update `documents.analysis`
- `POST /api/summarize` – podsumowanie wybranych parametrów (ChatGPT) + zapis dialogu do `agent_memory`
- `DELETE /api/user-data/:id` – transakcyjne usunięcie danych użytkownika (parametry, dokumenty, pamięć)

### 4.2. Logowanie SMS
- `POST /api/migrate-sms-columns` – pomocnicza migracja (dodaje `users.code`, `users.code_expires` + indeks)
- `POST /api/send-sms-code` – generuje 4‑cyfrowy kod, zapisuje w `users.code` z TTL 5 min, wysyła przez SMSAPI lub zwraca `testCode` (fallback)
- `POST /api/verify-sms-code` – weryfikuje kod i zwraca obiekt użytkownika (czyszcząc kod po udanej weryfikacji)

Funkcja wysyłki: `sendSMSViaSMSAPI(phone, message)` – obsługa `SMSAPI_TOKEN`, formatowania PL (+48/48/9 cyfr), tryb testowy.

### 4.3. OCR/AI – ścieżka decyzyjna
- Obrazy: preferowane GPT‑4 Vision (bezpośrednio, ewentualnie optymalizowane przez `sharp` jeśli dostępny)
- PDF: najpierw `pdf-parse` (gdy jest tekst), jeśli tekst słaby – (opcjonalnie) Google Cloud Vision OCR, a finalnie próba GPT‑4 Vision (PDF→obraz) lub interpretacja „uszkodzonego” tekstu przez OpenAI
- Na Vercel ograniczenia: Tesseract i konwersje PDF→obraz bywają niedostępne; logika uwzględnia fallbacki i time‑out 50s

## 5. Frontend (React)
Plik główny: `src/App.js`

- Ekrany: Landing, Logowanie (SMS), Rejestracja, Główny, Pliki, Analiza, Wykresy, Edycja profilu
- UX: nowoczesne komponenty, walidacje, licznik „wyślij ponownie SMS”, przechowywanie `user` i `passwordAuth` w `localStorage`
- API base: `https://zdrowie-backend.vercel.app` (produkcyjne endpointy backendu)
- Przepływy:
  - Logowanie SMS: `send-sms-code` → `verify-sms-code` → set user + fetch danych
  - Upload: multipart do `/api/upload` z metadanymi (symptomy, choroby, leki)
  - Analiza: `/api/analyze-file` → prezentacja HTML i zapis parametrów
  - Wykresy: parametry pobierane z `/api/parameters/:user_id`, wykresy via chart.js
  - Podsumowanie: `/api/summarize`

## 6. Warstwa serverless (`api/*`)
- `api/_config.js` – konfiguracja wspólna (Pool + OpenAI + `sanitizePhone`)
- `api/login.js`, `api/register.js`, `api/analyze-file.js`, `api/index.js` – uproszczone endpointy do Vercel Functions

## 7. Baza danych (PostgreSQL)
Tabela `users`:
- `id`, `name`, `email` (UNIQUE), `phone` (UNIQUE)
- `code` (VARCHAR(4)), `code_expires` (TIMESTAMP) – dla SMS login
- `created_at`

Tabela `documents`:
- `id`, `user_id` (FK, CASCADE), `filename`, `filepath`
- `file_content` (TEXT, base64) – trwałe przechowywanie na Vercel
- `symptoms`, `chronic_diseases`, `medications`, `analysis`, `upload_date`

Tabela `parameters`:
- `id`, `user_id`, `document_id`, `parameter_name`, `parameter_value`, `parameter_comment`, `measurement_date`, `created_at`

Tabela `agent_memory`:
- `id`, `user_id`, `message`, `role` (ENUM: user/assistant/system), `timestamp`

Indeksy: na `documents(user_id)`, `documents(upload_date)`, `parameters(user_id)`, `parameters(document_id)`, `parameters(measurement_date)`, `agent_memory(user_id)`, `agent_memory(timestamp)`, `users(code)` częściowy.

## 8. Deploy na Vercel
- Frontend – root `vercel.json` (static build do `build/`, route `/api/(.*)` → `/api/$1`)
- Backend – `backend/vercel.json` (mapuje wszystko na `backend/api/index.js` jeśli projekt jest osobno hostowany)
- Zmienne środowiskowe dodawane w Vercel Dashboard (Production/Preview/Development)
- Auto‑deploy po `git push` na `main`

## 9. Skrypty i uruchamianie
- Root `package.json`:
  - `start` – dev frontend
  - `server` – dev backend (`cd backend && npm run dev`)
  - `dev` – równoległy start frontend + backend (`concurrently`)
  - `postinstall` – instalacja zależności backendu po instalacji w root
- Backend `package.json`:
  - `start` – `node api/index.js`
  - `dev` – `nodemon api/index.js`

Lokalny start:
1) `npm install` (zainstaluje też backend)
2) Skonfiguruj `backend/.env` (wg `backend/env.example`)
3) `./scripts/db_reset.sh`
4) `npm run dev`

## 10. Bezpieczeństwo i prywatność
- Walidacja wejścia na backendzie, sanityzacja numeru telefonu
- Przechowywanie plików w DB (base64) ogranicza ryzyko dostępu do FS na serverless
- Szyfrowane połączenia do DB w produkcji (`ssl: { rejectUnauthorized: false }`)
- Kody SMS z TTL 5 minut, czyszczenie po weryfikacji
- Endpoint usuwania danych użytkownika (transakcja) – RODO‑friendly

## 11. Monitoring i logowanie
- Obszerne logi backendu (OCR/AI ścieżki, SMS tryby, błędy)
- Dodatkowy endpoint `GET /api/check-gcp-config` do diagnostyki konfiguracji GCP
- Time‑out ochronny 50s podczas OCR/analizy na Vercel

## 12. Ograniczenia i znane kwestie
- Tesseract i PDF→obraz mogą nie działać na Vercel (brak binariów/WASM/limit czasu)
- Rekomendacja: dla skanów PDF przesyłać obrazy (JPG/PNG) lub korzystać z GPT‑4 Vision PDF→obraz w środowiskach wspierających `pdf-poppler`/`sharp`
- Endpointy serverless w `api/` są uproszczone; pełne funkcje znajdują się w `backend/api/index.js`

## 13. Testy i weryfikacja funkcji SMS
- Fallback bez skonfigurowanego SMSAPI: backend zwraca `testCode` w odpowiedzi `POST /api/send-sms-code`
- Po konfiguracji (`SMSAPI_TOKEN`, `SMSAPI_FROM`) – wysyłka realnych SMS (zob. `VERCEL_SMSAPI_CONFIG.md`, `SMSAPI_SETUP.md`)

## 14. Szybkie referencje endpointów
- Rejestracja: `POST /api/register`
- Logowanie (SMS – 2 etap): `POST /api/send-sms-code` → `POST /api/verify-sms-code`
- Pliki: `POST /api/upload`, `GET /api/documents/:user_id`, `DELETE /api/document/:id`
- Analiza: `POST /api/analyze-file`
- Parametry: `GET /api/parameters/:user_id`
- Podsumowanie: `POST /api/summarize`
- Usuwanie danych: `DELETE /api/user-data/:id`
- Diagnostyka GCP: `GET /api/check-gcp-config`

## 15. Migracje (manualnie)
- Kolumny SMS: uruchom `add_sms_columns.sql` w DB lub endpoint `POST /api/migrate-sms-columns`
- Kolumna `documents.file_content`: `add_file_content_column.sql` lub `POST /api/migrate-database`

## 16. Kontakt i troubleshooting
- Sprawdź `README.md`, `SETUP.md`, `QUICKSTART.md`, `SMS_SOLUTION_SUMMARY.md`, `VERCEL_SMSAPI_CONFIG.md`
- Typowe problemy: połączenie DB, brak klucza OpenAI, limity czasu OCR na Vercel, brak konfiguracji SMSAPI
