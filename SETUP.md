# Instrukcja konfiguracji aplikacji Badania

## 🚨 WAŻNE - Pierwsze uruchomienie

### 1. Skopiuj zmienne środowiskowe

```bash
cd backend
cp env.example .env
```

### 2. Skonfiguruj plik `.env`

Otwórz plik `backend/.env` i wypełnij następujące zmienne:

```env
# Database Configuration - Skopiuj z Neon.tech
DATABASE_URL=postgresql://username:password@ep-example.us-east-1.aws.neon.tech/database?sslmode=require

# OpenAI Configuration - Pobierz z https://platform.openai.com/
OPENAI_API_KEY=sk-proj-example123...

# Google Cloud Platform Configuration
GCP_PROJECT_ID=your-project-id
GCP_SERVICE_ACCOUNT_EMAIL=your-service@your-project.iam.gserviceaccount.com
GCP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----"
GCS_BUCKET_NAME=your-bucket-name

# Server Configuration
PORT=3001
NODE_ENV=development
```

### 3. Gdzie znaleźć dane?

#### Neon.tech (DATABASE_URL):
1. Zaloguj się na https://neon.tech/
2. Wybierz swój projekt
3. Idź do "Connection Details"
4. Skopiuj "Connection string"

#### OpenAI (OPENAI_API_KEY):
1. Zaloguj się na https://platform.openai.com/
2. Idź do "API Keys"
3. Stwórz nowy klucz API
4. Skopiuj klucz

#### Google Cloud Platform:
1. Zaloguj się na https://console.cloud.google.com/
2. Wybierz swój projekt
3. Idź do "IAM & Admin" → "Service Accounts"
4. Stwórz nowy Service Account lub używaj istniejący
5. Pobierz klucz JSON
6. Włącz Cloud Vision API i Cloud Storage API

### 4. Sprawdź czy działa

```bash
# Z głównego katalogu
npm run dev
```

Powinno uruchomić się:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## 🔧 Troubleshooting

### Backend nie uruchamia się
1. Sprawdź czy plik `.env` istnieje w katalogu `backend/`
2. Sprawdź czy wszystkie zmienne są wypełnione
3. Sprawdź logi w terminalu

### Frontend nie łączy się z backendem
1. Sprawdź czy backend działa na porcie 3001
2. Sprawdź konfigurację CORS w `backend/api/index.js`

### Problemy z bazą danych
1. Sprawdź czy DATABASE_URL jest poprawny
2. Sprawdź czy masz dostęp do bazy z Twojego IP
3. Sprawdź czy tabele istnieją w bazie

## 📋 SQL Schema (jeśli potrzebujesz stworzyć tabele)

```sql
-- Tabela użytkowników
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela dokumentów
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    symptoms TEXT,
    chronic_diseases TEXT,
    medications TEXT,
    analysis TEXT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela parametrów
CREATE TABLE parameters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    document_id INTEGER REFERENCES documents(id),
    parameter_name VARCHAR(255) NOT NULL,
    parameter_value VARCHAR(255) NOT NULL,
    parameter_comment TEXT,
    measurement_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela pamięci agenta
CREATE TABLE agent_memory (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    message TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
``` 