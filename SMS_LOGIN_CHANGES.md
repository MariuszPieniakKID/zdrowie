# Zmiany w systemie logowania - SMS Authentication

## 🔄 Zmieniony flow logowania

### Poprzedni system (zakomentowany):
1. Użytkownik podawał numer telefonu
2. System sprawdzał czy użytkownik istnieje w bazie
3. Natychmiastowe logowanie

### Nowy system (aktywny):
1. **Krok 1**: Użytkownik podaje numer telefonu
2. **Krok 2**: System wysyła kod SMS na podany numer (przez SMSAPI.pl)
3. **Krok 3**: Użytkownik wprowadza 4-cyfrowy kod SMS
4. **Krok 4**: System weryfikuje kod i loguje użytkownika

## 🆕 Nowe funkcjonalności

### Frontend (App.js):
- ✅ **Dwuetapowy interfejs logowania**
  - Ekran wprowadzania numeru telefonu
  - Ekran wprowadzania kodu SMS
- ✅ **Timer odliczania** (60s) do ponownego wysłania SMS
- ✅ **Walidacja kodu SMS** (tylko cyfry, 4 znaki)
- ✅ **Możliwość powrotu** do zmiany numeru telefonu
- ✅ **Funkcja "Wyślij ponownie"** po upływie timera
- ✅ **Nowe ikony** (FaMobileAlt, FaKey) dla lepszego UX

### Backend (wymagane nowe endpointy):
- ✅ **POST `/api/send-sms-code`** - wysłanie kodu SMS
- ✅ **POST `/api/verify-sms-code`** - weryfikacja kodu SMS

## 🎨 Zmiany w UI/UX

### Nowe stany aplikacji:
```javascript
const [smsCode, setSmsCode] = useState('');           // Kod SMS
const [awaitingSmsCode, setAwaitingSmsCode] = useState(false); // Czy czeka na kod
const [smsCodeId, setSmsCodeId] = useState(null);     // ID sesji kodu
const [resendTimer, setResendTimer] = useState(0);    // Timer do ponownego wysłania
```

### Zaktualizowane funkcje:
- `handleSendSmsCode()` - wysłanie kodu SMS
- `handleVerifySmsCode()` - weryfikacja kodu SMS  
- `handleBackToPhone()` - powrót do ekranu numeru
- `handleLogout()` - reset stanów SMS

## 🔒 Bezpieczeństwo

### Nowe zabezpieczenia:
- **Kod jednorazowy**: 4-cyfrowy kod ważny przez 5 minut
- **Rate limiting**: 1 kod na minutę na numer telefonu
- **Automatyczne usuwanie**: Używane kody są usuwane z bazy
- **Timeout**: 60s timer między wysłanymi kodami

### Walidacje:
- Numer telefonu: regex `^(\+48)?\d{9}$`
- Kod SMS: tylko cyfry, dokładnie 4 znaki
- Sprawdzenie istnienia użytkownika przed wysłaniem SMS

## 📱 Integracja z SMSAPI.pl

### Wymagane zmienne środowiskowe:
```env
SMSAPI_TOKEN=your_oauth_token_here    # Token OAuth2 z panelu SMSAPI
SMSAPI_FROM=YourApp                   # Nazwa nadawcy (max 11 znaków)
SMSAPI_TEST=true                      # Tryb testowy (opcjonalnie)
```

### Konfiguracja w SMSAPI:
1. Rejestracja konta na smsapi.pl
2. Doładowanie punktów (0.07-0.09 punktu za SMS)
3. Generowanie tokenu OAuth2 z uprawnieniami `sms` i `sms_authenticator`
4. Opcjonalnie: dodanie własnego pola nadawcy

## 🔧 Backend - wymagane zmiany

Backend musi obsługiwać nowe API calls:

### 1. Wysłanie kodu SMS
```javascript
POST /api/send-sms-code
Body: { "phone": "48123456789" }
Response: { "success": true, "codeId": "uuid", "message": "Kod został wysłany" }
```

### 2. Weryfikacja kodu SMS
```javascript
POST /api/verify-sms-code  
Body: { "phone": "48123456789", "code": "1234", "codeId": "uuid" }
Response: { "success": true, "user": {...} }
```

## 📊 Monitorowanie

### Logi do śledzenia:
- Liczba wysłanych kodów SMS
- Successful/failed verifications
- Rate limiting violations
- SMSAPI errors (101, 102, 103, 105)

### Metryki:
- Koszt SMS-ów
- Conversion rate (wysłany kod → successful login)
- Czas dostarczenia SMS-ów

## 🚀 Deployment

### Frontend:
- ✅ Zmiany już wypchnięte na Vercel
- ✅ Kompatybilność wsteczna zachowana (stary kod zakomentowany)

### Backend:
- ⏳ Wymaga implementacji nowych endpointów
- ⏳ Dodanie zmiennych środowiskowych w Vercel
- ⏳ Integracja z SMSAPI.pl

## 🔄 Rollback plan

Jeśli system SMS nie zadziała, można:
1. Odkomentować stary system logowania w `App.js`
2. Zakomentować nowy system SMS
3. Przywrócić stary endpoint `/api/login`

## 📋 TODO dla backendu

1. **Implementacja endpointów SMS**
   - [ ] POST `/api/send-sms-code`
   - [ ] POST `/api/verify-sms-code`

2. **Baza danych**
   - [ ] Tabela `sms_codes` (code, phone, expires_at, used)
   - [ ] Rate limiting tabela

3. **Integracja SMSAPI**
   - [ ] Axios calls do SMSAPI.pl
   - [ ] Error handling
   - [ ] Logging

4. **Zmienne środowiskowe**
   - [ ] Dodanie `SMSAPI_TOKEN` w Vercel
   - [ ] Dodanie `SMSAPI_FROM` w Vercel

5. **Testowanie**
   - [ ] Unit testy dla SMS endpoints
   - [ ] Integration testy z SMSAPI
   - [ ] E2E testy flow logowania 