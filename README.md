# Badania - Medical Reports Analysis App

Aplikacja do analizy wyników badań medycznych z wykorzystaniem AI.

## 🏗️ Architektura

- **Frontend**: React.js
- **Backend**: Node.js/Express.js 
- **Baza danych**: PostgreSQL (Neon.tech dla produkcji, lokalna dla developmentu)
- **AI**: OpenAI GPT-4
- **Cloud**: Google Cloud Platform (Vision API, Storage)
- **Hosting**: Vercel

## 🚀 Szybki start

### Wymagania

- Node.js 18+ 
- npm lub yarn
- PostgreSQL (lokalnie zainstalowany)
- Konto na Neon.tech (PostgreSQL) - tylko dla produkcji
- Klucz API OpenAI - opcjonalnie
- Konfiguracja Google Cloud Platform - opcjonalnie

### Instalacja (development lokalny)

1. **Sklonuj repozytorium**
```bash
git clone <your-repo-url>
cd badania
```

2. **Zainstaluj zależności**
```bash
npm install
```

3. **Skonfiguruj lokalną bazę danych PostgreSQL**
```bash
# Utwórz bazę danych i tabele
createdb badania_local
psql -d badania_local -f database_setup.sql

# Lub użyj skryptu
./scripts/db_reset.sh
```

4. **Skonfiguruj zmienne środowiskowe**
```bash
cd backend
cp env.example .env
```

Edytuj plik `.env` w katalogu `backend/`. **Dla lokalnego developmentu wystarczy:**
```env
# Lokalna baza danych (wymagane)
DATABASE_URL=postgresql://your_username@localhost:5432/badania_local?sslmode=disable

# Opcjonalne (możesz dodać później)
OPENAI_API_KEY=your_openai_api_key
GCP_PROJECT_ID=your_gcp_project_id
GCP_SERVICE_ACCOUNT_EMAIL=your_service_account@project.iam.gserviceaccount.com
GCP_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_key\n-----END PRIVATE KEY-----"
GCS_BUCKET_NAME=your_bucket_name

# Konfiguracja serwera
PORT=3001
NODE_ENV=development
```

5. **Uruchom aplikację lokalnie**
```bash
npm run dev
```

To uruchomi:
- Frontend na `http://localhost:3000`
- Backend na `http://localhost:3001`

### Alternatywnie - uruchom części osobno

**Tylko frontend:**
```bash
npm start
```

**Tylko backend:**
```bash
npm run server
```

## 🗄️ Zarządzanie lokalną bazą danych

### Resetowanie bazy danych
```bash
./scripts/db_reset.sh
```

### Ręczne operacje
```bash
# Połącz się z bazą
psql -d badania_local

# Sprawdź tabele
\dt

# Sprawdź użytkowników
SELECT * FROM users;

# Sprawdź parametry
SELECT * FROM parameters;
```

### Przykładowi użytkownicy (automatycznie dodani)
- **Jan Kowalski**: telefon `123456789`
- **Anna Nowak**: telefon `987654321`

## 🔄 Workflow developmentu

### 1. Rozwój lokalny
```bash
# Pobierz najnowsze zmiany
git pull origin main

# Zainstaluj zależności (jeśli były zmiany)
npm install

# Uruchom dev environment
npm run dev

# Wprowadź zmiany...
# Testuj lokalnie...
```

### 2. Wdrażanie na produkcję
```bash
# Zatwierdź zmiany
git add .
git commit -m "Opis zmian"
git push origin main
```

**Vercel automatycznie wykryje zmiany i wdroży aplikację!**

## 📁 Struktura projektu

```
badania/
├── src/                    # Frontend React
├── public/                 # Pliki statyczne frontend
├── backend/               
│   ├── api/
│   │   └── index.js       # Główny plik backendu
│   ├── package.json       # Zależności backendu  
│   ├── vercel.json        # Konfiguracja Vercel
│   └── env.example        # Przykład zmiennych środowiskowych
├── scripts/
│   └── db_reset.sh        # Skrypt resetowania bazy
├── database_setup.sql     # Schema bazy danych
├── package.json           # Zależności frontend + skrypty
└── README.md
```

## 🔧 Dostępne skrypty

```bash
npm start          # Uruchom tylko frontend (dev)
npm run build      # Zbuduj frontend do produkcji
npm run server     # Uruchom tylko backend (dev)
npm run dev        # Uruchom frontend + backend (dev)
npm install        # Zainstaluj zależności (frontend + backend)

# Zarządzanie bazą danych
./scripts/db_reset.sh  # Resetuj lokalną bazę danych
```

## 🚀 Vercel Deployment

Aplikacja jest automatycznie wdrażana na Vercel po każdym push do głównej gałęzi.

### Konfiguracja Vercel:

1. **Frontend**: Automatycznie wykrywany jako React app
2. **Backend**: Konfiguracja w `backend/vercel.json`
3. **Zmienne środowiskowe**: Skonfigurowane w panelu Vercel

### Zmienne środowiskowe w Vercel:

Dodaj w panelu Vercel (Settings → Environment Variables):
- `DATABASE_URL` (Neon.tech connection string)
- `OPENAI_API_KEY`  
- `GCP_PROJECT_ID`
- `GCP_SERVICE_ACCOUNT_EMAIL`
- `GCP_PRIVATE_KEY`
- `GCS_BUCKET_NAME`

## 🛠️ Funkcjonalności

- ✅ Rejestracja i logowanie użytkowników
- ✅ Upload i analiza plików PDF z wynikami badań
- ✅ **🚀 GPT-4 Vision** - bezpośrednia analiza obrazów i PDF-ów bez OCR!
- ✅ **Inteligentny OCR** - automatyczny wybór najlepszej metody:
  - 🤖 **GPT-4 Vision** - bezpośrednia analiza obrazów (najlepsza jakość)
  - 📄 **pdf-parse** - szybkie dla tekstowych PDF-ów  
  - 🔍 **tesseract.js** - lokalny OCR dla zeskanowanych PDF-ów
  - 🌥️ **Google Cloud OCR** - backup (opcjonalny)
- ✅ Analiza AI z pamięcią kontekstu (GPT-4)
- ✅ Przechowywanie parametrów zdrowotnych
- ✅ Wizualizacja danych (wykresy)
- ✅ Integracja z MedlinePlus
- ✅ Responsywny design
- ✅ Lokalna baza danych dla developmentu

## 🔒 Bezpieczeństwo

- Sanityzacja danych wejściowych
- Bezpieczne przechowywanie plików
- Szyfrowane połączenie z bazą danych (produkcja)
- Walidacja po stronie serwera

## 🐛 Troubleshooting

### Problem z połączeniem do lokalnej bazy danych
```bash
# Sprawdź czy PostgreSQL działa
brew services list | grep postgresql

# Uruchom PostgreSQL jeśli nie działa
brew services start postgresql@14

# Sprawdź czy baza istnieje
psql -l | grep badania_local

# Utwórz bazę jeśli nie istnieje
./scripts/db_reset.sh
```

### Backend nie uruchamia się
1. Sprawdź czy plik `.env` istnieje w katalogu `backend/`
2. Sprawdź czy `DATABASE_URL` jest poprawny
3. Sprawdź logi w terminalu

### Frontend nie łączy się z backendem
1. Sprawdź czy backend działa na porcie 3001
2. Sprawdź konfigurację CORS w `backend/api/index.js`

### Problem z analizą PDF-ów
**Aplikacja automatycznie wybierze najlepszą metodę OCR:**

1. **GPT-4 Vision** - najlepsza jakość, analizuje bezpośrednio obrazy/PDF-y
2. **pdf-parse** - dla PDF-ów z tekstem (najszybsza)
3. **tesseract.js** - lokalny OCR dla zeskanowanych PDF-ów
4. **Google Cloud OCR** - backup jeśli skonfigurowany

**Jeśli GPT-4 Vision działa:**
- Będzie używany jako pierwsza opcja
- Obsługuje wielostronicowe PDF-y 
- Najlepsza jakość rozpoznawania polskich znaków
- Nie potrzebuje Google Cloud

**Jeśli wszystkie metody zawiodą:**
- Sprawdź czy PDF zawiera czytelny tekst
- Sprawdź jakość skanu (dla tesseract.js)
- Sprawdź logi backendu aby zobaczyć którą metodę wybrano

### Problem z Google Cloud billing
Jeśli widzisz błąd `"billing account for the owning project is disabled"`:
- **Rozwiązanie**: GPT-4 Vision zastąpi Google Cloud OCR
- Google Cloud OCR jest teraz opcjonalny (backup)
- Aplikacja będzie działać bez Google Cloud

### Problem z OpenAI/Google Cloud
- **OpenAI** jest wymagany do analizy AI i GPT-4 Vision
- **Google Cloud** jest opcjonalny - używany tylko jako backup OCR
- Aplikacja będzie działać z GPT-4 Vision + lokalnym OCR bez Google Cloud

## 📞 Support

W przypadku problemów:
1. Sprawdź logi w konsoli przeglądarki
2. Sprawdź logi backendu w terminalu
3. Sprawdź czy wszystkie wymagane zmienne środowiskowe są ustawione
4. Sprawdź czy lokalna baza danych działa
