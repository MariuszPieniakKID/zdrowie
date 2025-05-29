import React from 'react';
import { FaUser, FaEnvelope, FaPhone, FaSave, FaTimes, FaExclamationTriangle, FaShieldAlt, FaUserEdit } from 'react-icons/fa';
import './components.css';

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
    <div className="modern-container">
      {/* Animated background particles */}
      <div className="bg-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        {/* Modern Page Header */}
        <div className="modern-page-header">
          <h1 className="modern-page-title">Edycja profilu</h1>
          <p className="modern-page-subtitle">
            Zaktualizuj swoje dane osobowe i zarządzaj ustawieniami konta
          </p>
        </div>

        {/* Profile Edit Form */}
        <div className="modern-card">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            marginBottom: '2rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              background: 'var(--primary-gradient)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: 'white'
            }}>
              <FaUserEdit />
            </div>
            <div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Informacje osobiste
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Zaktualizuj swoje podstawowe dane kontaktowe
              </p>
            </div>
          </div>
          
          <form onSubmit={handleEdit} className="modern-form">
            <div className="modern-form-group">
              <label className="modern-label">
                <FaUser style={{ marginRight: '0.5rem', color: 'var(--accent-blue)' }} />
                Imię i nazwisko
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                placeholder="Jan Kowalski"
                className="modern-input"
                required
              />
            </div>
            
            <div className="modern-form-group">
              <label className="modern-label">
                <FaEnvelope style={{ marginRight: '0.5rem', color: 'var(--accent-green)' }} />
                Adres email
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                placeholder="jan@example.com"
                className="modern-input"
                required
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Używamy tego adresu do komunikacji o Twoich badaniach
              </small>
            </div>
            
            <div className="modern-form-group">
              <label className="modern-label">
                <FaPhone style={{ marginRight: '0.5rem', color: 'var(--accent-orange)' }} />
                Numer telefonu
              </label>
              <input
                type="text"
                value={editForm.phone}
                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                placeholder="123456789"
                className="modern-input"
                required
              />
              <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Numer telefonu służy do logowania w aplikacji
              </small>
            </div>
            
            {/* Action Buttons */}
            <div style={{ 
              display: 'flex', 
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <button 
                type="submit" 
                className="modern-btn"
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? (
                  <div className="modern-loading">
                    <div className="modern-spinner"></div>
                    Zapisywanie...
                  </div>
                ) : (
                  <>
                    <FaSave />
                    Zapisz zmiany
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setView('main')}
                className="modern-btn modern-btn-secondary"
                style={{ flex: 1 }}
              >
                <FaTimes />
                Anuluj
              </button>
            </div>
          </form>
        </div>

        {/* Privacy & Security Card */}
        <div className="modern-card modern-card-small" style={{ marginTop: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            <FaShieldAlt style={{ color: 'var(--accent-green)', fontSize: '1.5rem' }} />
            <div>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Prywatność i bezpieczeństwo
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Twoje dane są chronione najwyższymi standardami bezpieczeństwa
              </p>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <div style={{
              padding: '1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px'
            }}>
              <div style={{ color: 'var(--accent-green)', fontWeight: '600', fontSize: '0.875rem' }}>
                ✓ Szyfrowanie end-to-end
              </div>
            </div>
            
            <div style={{
              padding: '1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px'
            }}>
              <div style={{ color: 'var(--accent-green)', fontWeight: '600', fontSize: '0.875rem' }}>
                ✓ Zgodność z RODO
              </div>
            </div>
            
            <div style={{
              padding: '1rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px'
            }}>
              <div style={{ color: 'var(--accent-green)', fontWeight: '600', fontSize: '0.875rem' }}>
                ✓ Bezpieczny dostęp
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="modern-danger-zone">
          <div className="modern-danger-title">
            <FaExclamationTriangle />
            Strefa niebezpieczna
          </div>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.6' }}>
            Ta operacja usunie wszystkie Twoje dokumenty, analizy i parametry z naszych serwerów. 
            <strong> Operacja jest nieodwracalna</strong> i nie będzie możliwości odzyskania danych.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div>
              <h5 style={{ color: 'var(--accent-red)', marginBottom: '0.5rem' }}>
                Co zostanie usunięte:
              </h5>
              <ul style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.875rem',
                lineHeight: '1.5',
                paddingLeft: '1rem'
              }}>
                <li>Wszystkie przesłane dokumenty PDF</li>
                <li>Analizy AI i interpretacje</li>
                <li>Parametry zdrowotne i wykresy</li>
                <li>Historia badań</li>
              </ul>
            </div>
            
            <div>
              <h5 style={{ color: 'var(--accent-green)', marginBottom: '0.5rem' }}>
                Co zostanie zachowane:
              </h5>
              <ul style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.875rem',
                lineHeight: '1.5',
                paddingLeft: '1rem'
              }}>
                <li>Podstawowe dane konta</li>
                <li>Możliwość ponownego korzystania</li>
                <li>Ustawienia prywatności</li>
              </ul>
            </div>
          </div>
          
          <button 
            onClick={() => {
              if (window.confirm('Czy na pewno chcesz usunąć wszystkie swoje dane? Ta operacja jest nieodwracalna!')) {
                handleDeleteUserData();
              }
            }}
            className="modern-btn modern-btn-danger"
            disabled={loading}
          >
            {loading ? (
              <div className="modern-loading">
                <div className="modern-spinner"></div>
                Usuwanie...
              </div>
            ) : (
              <>
                <FaExclamationTriangle />
                Usuń wszystkie moje dane
              </>
            )}
          </button>
          
          <div className="modern-danger-description">
            <strong>Uwaga:</strong> Po usunięciu danych nie będzie możliwości ich odzyskania. 
            Zalecamy eksport ważnych analiz przed wykonaniem tej operacji.
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="modern-error">
            <FaExclamationTriangle style={{ marginRight: '0.5rem' }} />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default EdytujProfil;
