import React from 'react';

/**
 * Komponent do edycji profilu użytkownika.
 */
function EdytujProfil({
  editForm,
  setEditForm,
  handleEdit,
  handleDeleteUserData,
  setView,
  loading,
  error,
  styles,
  responsiveStyles
}) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ 
        fontSize: '24px', 
        fontWeight: '600', 
        color: '#111827',
        marginBottom: '24px'
      }}>
        Edycja profilu
      </h2>
      
      <form onSubmit={handleEdit} style={styles.form}>
        <div>
          <label htmlFor="edit-name" style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#4b5563'
          }}>
            Imię i nazwisko
          </label>
          <input
            id="edit-name"
            type="text"
            value={editForm.name}
            onChange={(e) => setEditForm({...editForm, name: e.target.value})}
            placeholder="Jan Kowalski"
            style={styles.input}
            required
          />
        </div>
        
        <div>
          <label htmlFor="edit-email" style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#4b5563'
          }}>
            Email
          </label>
          <input
            id="edit-email"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({...editForm, email: e.target.value})}
            placeholder="jan@example.com"
            style={styles.input}
            required
          />
        </div>
        
        <div>
          <label htmlFor="edit-phone" style={{ 
            display: 'block', 
            marginBottom: '8px',
            fontSize: '14px',
            fontWeight: '500',
            color: '#4b5563'
          }}>
            Numer telefonu
          </label>
          <input
            id="edit-phone"
            type="text"
            value={editForm.phone}
            onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
            placeholder="np. 123456789"
            style={styles.input}
            required
          />
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            type="submit" 
            style={{
              ...styles.button,
              width: 'auto',
              flex: 1
            }}
            disabled={loading}
          >
            {loading ? 'Zapisywanie...' : 'Zapisz zmiany'}
          </button>
          
          <button
            type="button"
            onClick={() => setView('main')}
            style={{
              ...styles.button,
              ...styles.secondaryButton,
              width: 'auto',
              flex: 1
            }}
          >
            Anuluj
          </button>
        </div>
        
        {/* Dodany przycisk usuwania danych */}
        <div style={{ marginTop: '30px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <h3 style={{ color: '#ef4444', marginBottom: '15px' }}>Strefa niebezpieczna</h3>
          <button 
            onClick={handleDeleteUserData} 
            style={{
              ...responsiveStyles.button,
              backgroundColor: '#ef4444',
              '&:hover': { backgroundColor: '#dc2626' }
            }}
            disabled={loading}
          >
            {loading ? 'Usuwanie...' : 'Usuń wszystkie moje dane'}
          </button>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '10px' }}>
            Ta operacja usunie wszystkie Twoje dokumenty, analizy i parametry. Operacja jest nieodwracalna.
          </p>
        </div>
      </form>
      
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}

export default EdytujProfil;
