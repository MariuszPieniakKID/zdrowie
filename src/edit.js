import React from 'react';
import { FaUser, FaEnvelope, FaPhone, FaSave, FaTimes, FaExclamationTriangle, FaShieldAlt, FaUserEdit, FaCertificate, FaLock, FaCheckCircle, FaTrashAlt, FaInfoCircle } from 'react-icons/fa';
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
  error
}) {
  return (
    <div className="modern-container">
      {/* Animated background particles */}
      <div className="bg-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        {/* Modern Page Header */}
        <div className="modern-page-header">
          <h1 className="modern-page-title">Edycja profilu</h1>
          <p className="modern-page-subtitle">
            Zaktualizuj swoje dane osobowe i zarządzaj ustawieniami konta medycznego
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
              width: '70px',
              height: '70px',
              background: 'var(--primary-gradient)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              color: 'white',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <FaUserEdit />
            </div>
            <div>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                marginBottom: '0.5rem',
                fontSize: '1.5rem',
                fontWeight: '700'
              }}>
                Informacje osobiste
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '1rem',
                margin: 0
              }}>
                Zaktualizuj swoje podstawowe dane kontaktowe używane w systemie medycznym
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
              <small style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.8rem', 
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <FaInfoCircle />
                Pełne imię i nazwisko dla dokumentacji medycznej
              </small>
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
              <small style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.8rem', 
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <FaInfoCircle />
                Używamy tego adresu do komunikacji o Twoich badaniach i analizach
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
              <small style={{ 
                color: 'var(--text-muted)', 
                fontSize: '0.8rem', 
                marginTop: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}>
                <FaInfoCircle />
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

        {/* Enhanced Privacy & Security Card */}
        <div className="modern-card modern-card-small" style={{ marginTop: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              background: 'var(--success-gradient)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              color: 'white'
            }}>
              <FaShieldAlt />
            </div>
            <div>
              <h4 style={{ 
                color: 'var(--text-primary)', 
                marginBottom: '0.5rem',
                fontSize: '1.25rem',
                fontWeight: '700'
              }}>
                Prywatność i bezpieczeństwo
              </h4>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: '0.9rem',
                margin: 0
              }}>
                Twoje dane medyczne są chronione najwyższymi standardami bezpieczeństwa
              </p>
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginTop: '1.5rem'
          }}>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <FaLock style={{ color: '#6ee7b7', fontSize: '1.25rem' }} />
              <div>
                <div style={{ color: '#6ee7b7', fontWeight: '600', fontSize: '0.875rem' }}>
                  Szyfrowanie end-to-end
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Pełne zabezpieczenie danych
                </div>
              </div>
            </div>
            
            <div style={{
              padding: '1.5rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <FaCertificate style={{ color: '#6ee7b7', fontSize: '1.25rem' }} />
              <div>
                <div style={{ color: '#6ee7b7', fontWeight: '600', fontSize: '0.875rem' }}>
                  Zgodność z RODO
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Europejskie standardy
                </div>
              </div>
            </div>
            
            <div style={{
              padding: '1.5rem',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <FaCheckCircle style={{ color: '#6ee7b7', fontSize: '1.25rem' }} />
              <div>
                <div style={{ color: '#6ee7b7', fontWeight: '600', fontSize: '0.875rem' }}>
                  Bezpieczny dostęp
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  Autoryzacja telefonem
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Danger Zone */}
        <div className="modern-danger-zone">
          <div className="modern-danger-title">
            <FaExclamationTriangle />
            Strefa niebezpieczna
          </div>
          
          <p style={{ 
            color: 'var(--text-light)', 
            marginBottom: '2rem', 
            lineHeight: '1.6',
            fontSize: '1rem'
          }}>
            Ta operacja usunie wszystkie Twoje dokumenty, analizy i parametry z naszych serwerów. 
            <strong style={{ color: 'var(--text-primary)' }}> Operacja jest nieodwracalna</strong> i nie będzie możliwości odzyskania danych.
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              padding: '1.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '12px'
            }}>
              <h5 style={{ 
                color: '#fca5a5', 
                marginBottom: '1rem',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FaTrashAlt />
                Co zostanie usunięte:
              </h5>
              <ul style={{ 
                color: 'var(--text-light)', 
                fontSize: '0.875rem',
                lineHeight: '1.6',
                paddingLeft: '1rem',
                margin: 0
              }}>
                <li style={{ marginBottom: '0.5rem' }}>Wszystkie przesłane dokumenty PDF i obrazy</li>
                <li style={{ marginBottom: '0.5rem' }}>Analizy AI i interpretacje medyczne</li>
                <li style={{ marginBottom: '0.5rem' }}>Parametry zdrowotne i wykresy</li>
                <li style={{ marginBottom: '0.5rem' }}>Historia badań i trendów</li>
                <li>Zapisane symptomy i informacje medyczne</li>
              </ul>
            </div>
            
            <div style={{
              padding: '1.5rem',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '12px'
            }}>
              <h5 style={{ 
                color: '#6ee7b7', 
                marginBottom: '1rem',
                fontSize: '1rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FaCheckCircle />
                Co zostanie zachowane:
              </h5>
              <ul style={{ 
                color: 'var(--text-light)', 
                fontSize: '0.875rem',
                lineHeight: '1.6',
                paddingLeft: '1rem',
                margin: 0
              }}>
                <li style={{ marginBottom: '0.5rem' }}>Podstawowe dane konta (imię, email, telefon)</li>
                <li style={{ marginBottom: '0.5rem' }}>Możliwość ponownego korzystania z aplikacji</li>
                <li style={{ marginBottom: '0.5rem' }}>Ustawienia prywatności i preferencje</li>
                <li style={{ marginBottom: '0.5rem' }}>Historia logowań (dla bezpieczeństwa)</li>
                <li>Dostęp do wszystkich funkcji aplikacji</li>
              </ul>
            </div>
          </div>
          
          <button 
            onClick={() => {
              if (window.confirm('Czy na pewno chcesz usunąć wszystkie swoje dane medyczne? Ta operacja jest nieodwracalna!')) {
                handleDeleteUserData();
              }
            }}
            className="modern-btn modern-btn-danger"
            disabled={loading}
            style={{ width: 'auto' }}
          >
            {loading ? (
              <div className="modern-loading">
                <div className="modern-spinner"></div>
                Usuwanie...
              </div>
            ) : (
              <>
                <FaTrashAlt />
                Usuń wszystkie moje dane medyczne
              </>
            )}
          </button>
          
          <div className="modern-danger-description">
            <strong>Uwaga:</strong> Po usunięciu danych medycznych nie będzie możliwości ich odzyskania. 
            Zalecamy utworzenie kopii zapasowej ważnych analiz przed wykonaniem tej operacji.
            Możesz również skontaktować się z naszym wsparciem technicznym.
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
