const axios = require('axios');

const BASE_URL = 'https://zdrowie-backend.vercel.app/api';

async function restoreDatabase() {
  try {
    console.log('🔄 Przywracanie danych testowych do bazy...');
    
    // Sprawdź czy backend działa
    const healthCheck = await axios.get(BASE_URL.replace('/api', ''));
    console.log('✅ Backend działa:', healthCheck.data);
    
    // Zarejestruj przykładowych użytkowników (jeśli nie istnieją)
    console.log('\n📝 Rejestruję przykładowych użytkowników...');
    
    const users = [
      { name: 'Dr Jan Kowalski', email: 'jan.kowalski@example.com', phone: '500100200' },
      { name: 'Dr Anna Nowak', email: 'anna.nowak@example.com', phone: '500100201' }
    ];
    
    for (const user of users) {
      try {
        const response = await axios.post(`${BASE_URL}/register`, user);
        console.log(`✅ Zarejestrowano: ${user.name}`);
      } catch (error) {
        if (error.response?.data?.error?.includes('już istnieje')) {
          console.log(`ℹ️  Użytkownik już istnieje: ${user.name}`);
        } else {
          console.log(`❌ Błąd rejestracji ${user.name}:`, error.response?.data || error.message);
        }
      }
    }
    
    console.log('\n✅ Przywracanie zakończone!');
    console.log('\n💡 Aby dodać więcej danych:');
    console.log('1. Zaloguj się do aplikacji');
    console.log('2. Wgraj przykładowe pliki PDF z wynikami badań');
    console.log('3. System automatycznie wyciągnie parametry zdrowotne');
    
  } catch (error) {
    console.error('❌ Błąd przywracania bazy:', error.message);
  }
}

restoreDatabase(); 