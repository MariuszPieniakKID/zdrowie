# Naprawa błędu rejestracji - "duplicate key value violates unique constraint"

## 🐛 **Problem:**
Podczas rejestracji z numerem telefonu `604516233` aplikacja zwracała błąd:
```
duplicate key value violates unique constraint "users_phone_key"
```

## 🔍 **Przyczyna:**
1. **Brak sprawdzania duplikatów** - endpoint `/api/register` nie sprawdzał czy użytkownik już istnieje przed próbą dodania do bazy
2. **Nieczytelny komunikat błędu** - użytkownik widział surowy błąd PostgreSQL zamiast przyjaznej wiadomości
3. **Brakujące endpointy SMS** - frontend próbował korzystać z endpointów SMS które nie istniały w backendzie

## ✅ **Rozwiązanie:**

### 1. **Poprawiona obsługa rejestracji** (`backend/api/index.js`)
```javascript
app.post('/api/register', async (req, res) => {
  // Sprawdź czy użytkownik już istnieje PRZED dodaniem
  const { rows: existingUsers } = await pool.query(
    'SELECT email, phone FROM users WHERE email = $1 OR phone = $2',
    [email, sanitizedPhone]
  );
  
  if (existingUsers.length > 0) {
    // Przyjazne komunikaty błędów
    if (existingUser.email === email) {
      return res.status(409).json({ error: 'Użytkownik z tym adresem email już istnieje' });
    }
    if (existingUser.phone === sanitizedPhone) {
      return res.status(409).json({ error: 'Użytkownik z tym numerem telefonu już istnieje' });
    }
  }
  
  // Dodatkowa obsługa race conditions
  if (error.code === '23505') {
    return res.status(409).json({ error: 'Użytkownik z tymi danymi już istnieje' });
  }
});
```

### 2. **Dodane endpointy SMS** 
- ✅ `POST /api/send-sms-code` - wysyłanie kodu SMS
- ✅ `POST /api/verify-sms-code` - weryfikacja kodu SMS  
- ✅ `POST /api/migrate-sms-columns` - migracja bazy danych

### 3. **Migracja bazy danych**
Dodano kolumny dla kodów SMS:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS code VARCHAR(4);
ALTER TABLE users ADD COLUMN IF NOT EXISTS code_expires TIMESTAMP;
CREATE INDEX IF NOT EXISTS idx_users_code ON users(code) WHERE code IS NOT NULL;
```

## 🧪 **Testy:**

### ✅ **Test 1: Rejestracja istniejącego numeru**
```bash
curl -X POST https://zdrowie-backend.vercel.app/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","phone":"604516233"}'

# Wynik: {"error":"Użytkownik z tym numerem telefonu już istnieje"}
```

### ✅ **Test 2: Logowanie SMS**
```bash
curl -X POST https://zdrowie-backend.vercel.app/api/send-sms-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"604516233"}'

# Wynik: {"message":"Kod SMS został wysłany","codeId":"temp_..."}
```

## 🚀 **Status deploymentu:**
- ✅ Backend wdrożony na Vercel
- ✅ Migracja bazy danych wykonana
- ✅ Frontend zaktualizowany
- ✅ Wszystkie endpointy działają

## 💡 **Korzyści:**
1. **Przyjazne komunikaty błędów** - użytkownik wie co robić
2. **Pełny system SMS** - dwuetapowe logowanie działa
3. **Bezpieczna rejestracja** - sprawdzanie duplikatów przed dodaniem
4. **Obsługa race conditions** - dodatkowa warstwa bezpieczeństwa

Teraz użytkownik próbujący zarejestrować się z numerem `604516233` zobaczy czytelny komunikat zamiast surowego błędu bazy danych! 🎉 