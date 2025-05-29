# 🚀 Szybki start - Development lokalny

## Wymagania
- Node.js 18+
- PostgreSQL (zainstalowany lokalnie)

## Krok po kroku

### 1. Sklonuj i zainstaluj
```bash
git clone <repo-url>
cd badania
npm install
```

### 2. Skonfiguruj bazę danych
```bash
# Utwórz bazę i tabele
./scripts/db_reset.sh
```

### 3. Skonfiguruj backend
```bash
cd backend
cp env.example .env
```

**Edytuj `backend/.env`** - zmień tylko `your_username` na swoją nazwę użytkownika:
```env
DATABASE_URL=postgresql://your_username@localhost:5432/badania_local?sslmode=disable
```

### 4. Uruchom aplikację
```bash
cd ..
npm run dev
```

## ✅ Gotowe!

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## 👥 Testowi użytkownicy

Możesz się zalogować jako:
- **Telefon**: `123456789` (Jan Kowalski)
- **Telefon**: `987654321` (Anna Nowak)

## 🔧 Przydatne komendy

```bash
# Tylko frontend
npm start

# Tylko backend  
npm run server

# Reset bazy danych
./scripts/db_reset.sh

# Sprawdź bazę danych
psql -d badania_local -c "SELECT * FROM users;"
```

## ⚠️ Uwagi

- **OpenAI API** jest wymagany dla analizy AI - dodaj swój klucz w `backend/.env`
- **Google Cloud** jest opcjonalny - używany tylko jako backup OCR
- **Aplikacja automatycznie wybierze najlepszą metodę OCR:**
  - 📄 pdf-parse (szybkie dla tekstowych PDF-ów)
  - 🔍 tesseract.js (lokalny OCR dla zeskanowanych PDF-ów)  
  - 🌥️ Google Cloud OCR (backup jeśli skonfigurowany)

## 🔧 Test OCR

Możesz przetestować różne typy PDF-ów:

1. **Tekstowy PDF** - zostanie przetworzony przez pdf-parse (szybko)
2. **Zeskanowany PDF** - zostanie przetworzony przez tesseract.js (wolniej)
3. **Problematyczny PDF** - spróbuje Google Cloud OCR jeśli skonfigurowany

Sprawdź logi backendu aby zobaczyć którą metodę OCR wybrano! 