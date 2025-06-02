# Konfiguracja SMSAPI.pl na Vercel - Instrukcja krok po kroku

## 🚨 **PROBLEM:** SMS-y nie są wysyłane
Backend generuje kody SMS ale nie wysyła ich na telefon, ponieważ **brakuje konfiguracji SMSAPI.pl na Vercel**.

## 🔧 **ROZWIĄZANIE:** Dodaj zmienne środowiskowe na Vercel

### **Krok 1: Przejdź do panelu Vercel**
1. Otwórz https://vercel.com/dashboard
2. Znajdź projekt **zdrowie-backend** (backend)
3. Kliknij na projekt

### **Krok 2: Przejdź do Settings → Environment Variables**
1. Kliknij zakładkę **"Settings"**
2. W menu bocznym wybierz **"Environment Variables"**

### **Krok 3: Dodaj zmienne SMSAPI**
Dodaj każdą zmienną osobno klikając **"Add New"**:

#### **🔑 SMSAPI_TOKEN** (WYMAGANE)
- **Name:** `SMSAPI_TOKEN`
- **Value:** Twój token OAuth2 z panelu SMSAPI.pl (np. `eyJ0eXAiOiJKV1QiLCJhbGc...`)
- **Environment:** `Production`, `Preview`, `Development` (zaznacz wszystkie)

#### **📱 SMSAPI_FROM** (WYMAGANE)
- **Name:** `SMSAPI_FROM`  
- **Value:** Nazwa nadawcy (max 11 znaków, np. `MedApp`, `ZdrowieApp`)
- **Environment:** `Production`, `Preview`, `Development`

#### **🧪 SMSAPI_TEST** (OPCJONALNE)
- **Name:** `SMSAPI_TEST`
- **Value:** `true` (dla testów) lub `false` (dla produkcji)
- **Environment:** `Development`, `Preview` (NIE dodawaj do Production jeśli chcesz prawdziwe SMS-y)

#### **🌐 SMSAPI_BASE_URL** (OPCJONALNE)
- **Name:** `SMSAPI_BASE_URL`
- **Value:** `https://api.smsapi.pl`
- **Environment:** `Production`, `Preview`, `Development`

### **Krok 4: Redeploy aplikacji**
Po dodaniu zmiennych:
1. Przejdź do zakładki **"Deployments"**
2. Znajdź najnowszy deployment
3. Kliknij **"..."** → **"Redeploy"**
4. Potwierdź redeploy

## 🧪 **Testowanie**

### **Test 1: Sprawdź konfigurację**
```bash
curl https://zdrowie-backend.vercel.app/api/send-sms-code \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"phone":"TWOJ_NUMER"}'
```

**Oczekiwana odpowiedź (tryb testowy):**
```json
{
  "message": "Kod SMS został wysłany (tryb testowy)",
  "codeId": "12345",
  "testMode": true
}
```

**Oczekiwana odpowiedź (tryb produkcyjny):**
```json
{
  "message": "Kod SMS został wysłany na Twój numer telefonu",
  "codeId": "67890",
  "testMode": false
}
```

### **Test 2: Sprawdź błędy**
Jeśli brakuje tokenów, otrzymasz:
```json
{
  "error": "Problem z wysyłaniem SMS - użyj kodu testowego",
  "testCode": "1234",
  "smsError": "SMSAPI_TOKEN nie jest skonfigurowany"
}
```

## 📋 **Checklist konfiguracji**

- [ ] Token SMSAPI.pl wygenerowany w panelu
- [ ] `SMSAPI_TOKEN` dodany na Vercel  
- [ ] `SMSAPI_FROM` dodany na Vercel (nazwa nadawcy)
- [ ] `SMSAPI_TEST=true` dla testów (opcjonalne)
- [ ] Redeploy aplikacji wykonany
- [ ] Test wysyłania SMS zrobiony

## 🎯 **Po konfiguracji**
1. **SMS-y będą wysyłane automatycznie** 📱
2. **Użytkownicy dostaną prawdziwe kody** ✅  
3. **System logowania SMS będzie w pełni funkcjonalny** 🚀

## ⚠️ **Ważne uwagi**
- **Tryb testowy** (`SMSAPI_TEST=true`) nie wysyła prawdziwych SMS-ów
- **Nazwa nadawcy** może wymagać weryfikacji w panelu SMSAPI
- **Koszty** - każdy SMS kosztuje około 0.07-0.09 punktu SMSAPI

Po wykonaniu tych kroków system SMS będzie działał poprawnie! 🎉 