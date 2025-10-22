#!/bin/bash

# Skrypt do resetowania lokalnej bazy danych

echo "🗄️  Resetowanie lokalnej bazy danych..."

# Zatrzymaj backend jeśli działa
echo "⏹️  Zatrzymywanie backendu..."
pkill -f "node.*api/index.js" 2>/dev/null || true

# Usuń bazę jeśli istnieje
echo "🗑️  Usuwanie starej bazy..."
dropdb badania_local 2>/dev/null || true

# Utwórz nową bazę
echo "🆕 Tworzenie nowej bazy..."
createdb badania_local

# Uruchom skrypt SQL
echo "📋 Tworzenie tabel..."
psql -d badania_local -f database_setup.sql

echo "✅ Baza danych została zresetowana!"
echo "💡 Możesz teraz uruchomić backend: npm run server" 