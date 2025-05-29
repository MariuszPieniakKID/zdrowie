import React from 'react';
import { FaUpload, FaFilePdf, FaMicrophone, FaPrescriptionBottleAlt, FaHeartbeat, FaCloudUploadAlt, FaShieldAlt, FaCheckCircle, FaInfoCircle, FaFileImage } from 'react-icons/fa';
import './components.css';

/**
 * Komponent do wgrywania nowych plików PDF z wynikami badań.
 */
function WgrajPlik({
  handleFileUpload,
  selectedFile,
  setSelectedFile,
  symptoms,
  setSymptoms,
  chronicDiseases,
  setChronicDiseases,
  medications,
  setMedications,
  loading
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
          <h1 className="modern-page-title">Wgraj nowe badanie</h1>
          <p className="modern-page-subtitle">
            Prześlij swoje wyniki badań w formacie PDF. Nasza AI automatycznie przeanalizuje dokument 
            i dostarczy szczegółową interpretację wyników medycznych.
          </p>
        </div>

        {/* Upload Form */}
        <div className="modern-card">
          <form onSubmit={handleFileUpload} className="modern-form">
            {/* File Upload Area */}
            <div className="modern-form-group">
              <label className="modern-label">
                <FaFilePdf style={{ marginRight: '0.5rem', color: 'var(--accent-red)' }} />
                Plik PDF z wynikami badań
              </label>
              
              <label htmlFor="file-upload" className="modern-upload-area">
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                
                <FaCloudUploadAlt className="modern-upload-icon" />
                
                <div className="modern-upload-text">
                  {selectedFile ? (
                    <>
                      <strong style={{ color: 'var(--text-primary)' }}>{selectedFile.name}</strong>
                      <div className="modern-upload-subtext">
                        <FaCheckCircle style={{ marginRight: '0.25rem', color: 'var(--accent-green)' }} />
                        Rozmiar: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)' }}>
                      Kliknij, aby wybrać plik lub przeciągnij go tutaj
                    </span>
                  )}
                </div>
                
                {!selectedFile && (
                  <div className="modern-upload-subtext">
                    <FaInfoCircle style={{ marginRight: '0.25rem', color: 'var(--accent-blue)' }} />
                    Obsługujemy pliki PDF i obrazy (JPG, PNG) do 10 MB
                  </div>
                )}
              </label>
            </div>

            {/* Additional Information Section */}
            <div className="modern-card modern-card-small" style={{ 
              marginTop: '2rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)'
            }}>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                marginBottom: '1.5rem',
                fontSize: '1.25rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FaHeartbeat style={{ color: 'var(--accent-pink)' }} />
                Dodatkowe informacje medyczne
              </h3>
              
              <p style={{ 
                color: 'var(--text-secondary)', 
                marginBottom: '2rem',
                fontSize: '0.9rem',
                lineHeight: '1.6',
                padding: '1rem',
                background: 'var(--bg-glass)',
                borderRadius: '8px',
                border: '1px solid var(--border-light)'
              }}>
                <FaInfoCircle style={{ marginRight: '0.5rem', color: 'var(--accent-blue)' }} />
                Podaj dodatkowe informacje, które pomogą AI w dokładniejszej analizie Twoich wyników.
                Wszystkie pola są opcjonalne, ale każda informacja poprawia jakość analizy.
              </p>

              <div className="modern-form-group">
                <label className="modern-label">
                  <FaMicrophone style={{ marginRight: '0.5rem', color: 'var(--accent-orange)' }} />
                  Twoje symptomy
                </label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="modern-textarea"
                  placeholder="Opisz objawy, które odczuwasz... np. zmęczenie, bóle głowy, problemy trawienne, zawroty głowy"
                  rows="4"
                />
              </div>
              
              <div className="modern-form-group">
                <label className="modern-label">
                  <FaHeartbeat style={{ marginRight: '0.5rem', color: 'var(--accent-red)' }} />
                  Choroby przewlekłe
                </label>
                <textarea
                  value={chronicDiseases}
                  onChange={(e) => setChronicDiseases(e.target.value)}
                  className="modern-textarea"
                  placeholder="Wymień choroby przewlekłe... np. cukrzyca, nadciśnienie, choroby tarczycy, astma"
                  rows="3"
                />
              </div>
              
              <div className="modern-form-group">
                <label className="modern-label">
                  <FaPrescriptionBottleAlt style={{ marginRight: '0.5rem', color: 'var(--accent-green)' }} />
                  Przyjmowane leki i suplementy
                </label>
                <textarea
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  className="modern-textarea"
                  placeholder="Wymień leki i suplementy... np. metformina, euthyrox, witaminy, omega-3"
                  rows="3"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedFile || loading}
              className={`modern-btn ${(!selectedFile || loading) ? 'modern-btn-secondary' : ''}`}
              style={{ marginTop: '2rem' }}
            >
              {loading ? (
                <div className="modern-loading">
                  <div className="modern-spinner"></div>
                  Przesyłanie i analizowanie...
                </div>
              ) : (
                <>
                  <FaUpload />
                  Prześlij i analizuj plik
                </>
              )}
            </button>

            {!selectedFile && (
              <div style={{
                textAlign: 'center',
                marginTop: '1.5rem',
                padding: '1.5rem',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                color: '#93c5fd',
                fontSize: '0.875rem',
                lineHeight: '1.5'
              }}>
                <FaInfoCircle style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />
                <strong>Wskazówka:</strong> Przed przesłaniem upewnij się, że plik PDF lub obraz zawiera czytelne wyniki badań laboratoryjnych.
                Najlepiej działają dokumenty z tabelami parametrów i wartości.
              </div>
            )}
          </form>
        </div>

        {/* Enhanced Info Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '2rem',
          marginTop: '3rem'
        }}>
          <div className="modern-card modern-card-small">
            <h4 style={{ 
              color: 'var(--text-primary)', 
              marginBottom: '1.5rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaFileImage style={{ color: 'var(--accent-blue)' }} />
              Obsługiwane formaty
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '1rem',
                background: 'var(--bg-glass)',
                borderRadius: '8px',
                border: '1px solid var(--border-light)'
              }}>
                <ul style={{ 
                  color: 'var(--text-secondary)', 
                  lineHeight: '1.6',
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <FaCheckCircle style={{ color: 'var(--accent-green)', marginRight: '0.5rem' }} />
                    Pliki PDF do 10 MB
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <FaCheckCircle style={{ color: 'var(--accent-green)', marginRight: '0.5rem' }} />
                    Obrazy JPG, PNG
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <FaCheckCircle style={{ color: 'var(--accent-green)', marginRight: '0.5rem' }} />
                    Wyniki laboratoriów medycznych
                  </li>
                  <li>
                    <FaCheckCircle style={{ color: 'var(--accent-green)', marginRight: '0.5rem' }} />
                    Skany i zdjęcia wyników
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="modern-card modern-card-small">
            <h4 style={{ 
              color: 'var(--text-primary)', 
              marginBottom: '1.5rem',
              fontSize: '1.1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaShieldAlt style={{ color: 'var(--accent-green)' }} />
              Bezpieczeństwo i prywatność
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '1rem',
                background: 'var(--bg-glass)',
                borderRadius: '8px',
                border: '1px solid var(--border-light)'
              }}>
                <ul style={{ 
                  color: 'var(--text-secondary)', 
                  lineHeight: '1.6',
                  listStyle: 'none',
                  padding: 0,
                  margin: 0
                }}>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <FaCheckCircle style={{ color: 'var(--accent-green)', marginRight: '0.5rem' }} />
                    Szyfrowanie end-to-end
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <FaCheckCircle style={{ color: 'var(--accent-green)', marginRight: '0.5rem' }} />
                    Zgodność z RODO
                  </li>
                  <li style={{ marginBottom: '0.5rem' }}>
                    <FaCheckCircle style={{ color: 'var(--accent-green)', marginRight: '0.5rem' }} />
                    Bezpieczne przechowywanie
                  </li>
                  <li>
                    <FaCheckCircle style={{ color: 'var(--accent-green)', marginRight: '0.5rem' }} />
                    Możliwość usunięcia danych
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WgrajPlik;
