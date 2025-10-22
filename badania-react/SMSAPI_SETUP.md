# Konfiguracja SMSAPI.pl dla logowania SMS

## Krok po kroku - konfiguracja SMSAPI.pl

### 1. Rejestracja w SMSAPI.pl
1. Przejdź na stronę [https://www.smsapi.pl/](https://www.smsapi.pl/)
2. Kliknij "Rejestracja" i załóż nowe konto
3. Potwierdź email i zaloguj się do panelu

### 2. Dodanie punktów na konto
1. W panelu SMSAPI przejdź do sekcji "Doładowania"
2. Dodaj punkty na konto (minimum 10 punktów do testów)
3. Każdy SMS kosztuje około 0.07-0.09 punktu

### 3. Generowanie tokenu OAuth2 API
1. W panelu przejdź do sekcji **"Tokeny API"**
2. Kliknij **"Utwórz nowy token"**
3. Wybierz uprawnienia:
   - ✅ `sms` - do wysyłania SMS-ów
   - ✅ `sms_authenticator` - do kodów jednorazowych
4. Skopiuj wygenerowany token (np. `eyJ0eXAiOiJKV1QiLCJhbGc...`)

### 4. Konfiguracja zmiennych środowiskowych w backend

W backendzie aplikacji (https://zdrowie-backend.vercel.app) musisz dodać następujące zmienne środowiskowe:

#### W pliku `.env` (lokalnie) lub w Vercel Dashboard:
```env
SMSAPI_TOKEN=your_oauth_token_here
SMSAPI_FROM=YourApp
```

#### Opcjonalnie dla testów (środowisko testowe):
```env
SMSAPI_TEST=true
SMSAPI_BASE_URL=https://api.smsapi.pl
```

### 5. Konfiguracja pola nadawcy (opcjonalnie)
1. W panelu SMSAPI przejdź do **"Pola nadawcy"**
2. Dodaj nowe pole nadawcy (np. "MedApp", "Zdrowie")
3. Pole nadawcy może mieć maksymalnie 11 znaków
4. Pole zostanie zweryfikowane przez SMSAPI (może potrwać do 24h)

### 6. Implementacja w backendzie

Backend musi obsługiwać następujące endpointy:

#### POST `/api/send-sms-code`
```javascript
// Payload
{
  "phone": "48123456789"
}

// Response (success)
{
  "success": true,
  "codeId": "unique_code_identifier",
  "message": "Kod SMS został wysłany"
}

// Response (error)
{
  "success": false,
  "error": "Użytkownik nie istnieje"
}
```

#### POST `/api/verify-sms-code`
```javascript
// Payload
{
  "phone": "48123456789",
  "code": "1234",
  "codeId": "unique_code_identifier"
}

// Response (success)
{
  "success": true,
  "user": {
    "id": 1,
    "name": "Jan Kowalski",
    "email": "jan@example.com",
    "phone": "48123456789"
  }
}

// Response (error)
{
  "success": false,
  "error": "Nieprawidłowy kod SMS"
}
```

### 7. Implementacja w backendzie - przykład kodu

```javascript
const axios = require('axios');

// Wysłanie kodu SMS
async function sendSmsCode(phone) {
  // Generuj 4-cyfrowy kod
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  
  // Zapisz kod w bazie z czasem wygaśnięcia (5 minut)
  const codeId = await saveCodeToDatabase(phone, code);
  
  // Wyślij SMS przez SMSAPI
  try {
    const response = await axios.post('https://api.smsapi.pl/sms.do', {
      to: phone,
      message: `Twój kod logowania: ${code}. Kod wygasa za 5 minut.`,
      from: process.env.SMSAPI_FROM || 'MedApp'
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.SMSAPI_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, codeId };
  } catch (error) {
    console.error('Błąd wysyłania SMS:', error);
    throw new Error('Błąd wysyłania kodu SMS');
  }
}

// Weryfikacja kodu SMS
async function verifySmsCode(phone, inputCode, codeId) {
  // Pobierz kod z bazy
  const storedCode = await getCodeFromDatabase(codeId, phone);
  
  if (!storedCode || storedCode.expired) {
    throw new Error('Kod wygasł lub nie istnieje');
  }
  
  if (storedCode.code !== inputCode) {
    throw new Error('Nieprawidłowy kod SMS');
  }
  
  // Usuń wykorzystany kod
  await deleteCodeFromDatabase(codeId);
  
  // Zwróć dane użytkownika
  return await getUserByPhone(phone);
}
```

### 8. Testowanie

1. **Lokalnie**: Ustaw `SMSAPI_TEST=true` aby nie wysyłać prawdziwych SMS-ów podczas developmentu
2. **Produkcja**: Upewnij się, że token jest poprawny i ma odpowiednie uprawnienia
3. **Monitoring**: Sprawdzaj logi w panelu SMSAPI aby monitorować wysłane wiadomości

### 9. Limity i koszty

- **Limit API**: 100 zapytań na sekundę per IP
- **Koszt SMS**: ~0.07-0.09 punktu za SMS
- **Ważność tokenu**: Tokeny OAuth2 nie wygasają automatycznie
- **Czas dostarczenia**: SMS-y dostarczane są zwykle w ciągu 1-30 sekund

### 10. Bezpieczeństwo

- **Kod SMS**: 4-cyfrowy, ważny przez 5 minut
- **Rate limiting**: Maksymalnie 1 kod na minutę na numer telefonu
- **Token API**: Przechowuj bezpiecznie w zmiennych środowiskowych
- **HTTPS**: Zawsze używaj połączeń szyfrowanych

### 11. Obsługa błędów

Możliwe błędy z SMSAPI:
- `ERROR:101` - Nieprawidłowy token autoryzacji
- `ERROR:102` - Nieprawidłowy numer telefonu
- `ERROR:103` - Brak punktów na koncie
- `ERROR:105` - IP zablokowane w filtrze

### 12. Konfiguracja Vercel Dashboard

1. Przejdź do [Vercel Dashboard](https://vercel.com/dashboard)
2. Wybierz projekt backendu
3. Przejdź do **Settings → Environment Variables**
4. Dodaj zmienne:
   - `SMSAPI_TOKEN` = `twoj_token_oauth`
   - `SMSAPI_FROM` = `nazwa_nadawcy`

Po dodaniu zmiennych, zrób redeploy projektu. 