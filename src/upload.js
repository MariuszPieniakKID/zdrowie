import React from 'react';
import { FaUpload, FaFilePdf, FaMicrophone, FaPrescriptionBottleAlt, FaHeartbeat, FaCloudUploadAlt } from 'react-icons/fa';
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
  loading,
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
          <h1 className="modern-page-title">Wgraj nowy plik</h1>
          <p className="modern-page-subtitle">
            Prześlij swoje wyniki badań w formacie PDF. Nasza AI automatycznie przeanalizuje dokument 
            i dostarczy szczegółową interpretację wyników.
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
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  style={{ display: 'none' }}
                />
                
                <FaCloudUploadAlt className="modern-upload-icon" />
                
                <div className="modern-upload-text">
                  {selectedFile ? (
                    <>
                      <strong>{selectedFile.name}</strong>
                      <div className="modern-upload-subtext">
                        Rozmiar: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </>
                  ) : (
                    'Kliknij, aby wybrać plik PDF lub przeciągnij go tutaj'
                  )}
                </div>
                
                {!selectedFile && (
                  <div className="modern-upload-subtext">
                    Obsługujemy pliki PDF do 10 MB
                  </div>
                )}
              </label>
            </div>

            {/* Additional Information Section */}
            <div className="modern-card modern-card-small" style={{ marginTop: '2rem' }}>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                marginBottom: '1.5rem',
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
                lineHeight: '1.6'
              }}>
                Podaj dodatkowe informacje, które pomogą AI w dokładniejszej analizie Twoich wyników.
                Wszystkie pola są opcjonalne.
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
                  placeholder="Opisz objawy, które odczuwasz... np. zmęczenie, bóle głowy, problemy trawienne"
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
                  placeholder="Wymień choroby przewlekłe... np. cukrzyca, nadciśnienie, choroby tarczycy"
                  rows="3"
                />
              </div>
              
              <div className="modern-form-group">
                <label className="modern-label">
                  <FaPrescriptionBottleAlt style={{ marginRight: '0.5rem', color: 'var(--accent-green)' }} />
                  Przyjmowane leki
                </label>
                <textarea
                  value={medications}
                  onChange={(e) => setMedications(e.target.value)}
                  className="modern-textarea"
                  placeholder="Wymień leki, które obecnie przyjmujesz... np. metformina, euthyrox, witaminy"
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
                marginTop: '1rem',
                padding: '1rem',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                color: 'var(--accent-blue)',
                fontSize: '0.875rem'
              }}>
                💡 <strong>Wskazówka:</strong> Przed przesłaniem upewnij się, że plik PDF zawiera czytelne wyniki badań laboratoryjnych
              </div>
            )}
          </form>
        </div>

        {/* Info Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1.5rem',
          marginTop: '3rem'
        }}>
          <div className="modern-card modern-card-small">
            <h4 style={{ 
              color: 'var(--text-primary)', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaFilePdf style={{ color: 'var(--accent-red)' }} />
              Obsługiwane formaty
            </h4>
            <ul style={{ 
              color: 'var(--text-secondary)', 
              lineHeight: '1.6',
              listStyle: 'none',
              padding: 0
            }}>
              <li>✓ Pliki PDF do 10 MB</li>
              <li>✓ Wyniki laboratoriów medycznych</li>
              <li>✓ Dokumenty z tekstem i tabelami</li>
              <li>✓ Skany wyników badań</li>
            </ul>
          </div>

          <div className="modern-card modern-card-small">
            <h4 style={{ 
              color: 'var(--text-primary)', 
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <FaHeartbeat style={{ color: 'var(--accent-pink)' }} />
              Bezpieczeństwo danych
            </h4>
            <ul style={{ 
              color: 'var(--text-secondary)', 
              lineHeight: '1.6',
              listStyle: 'none',
              padding: 0
            }}>
              <li>✓ Szyfrowanie end-to-end</li>
              <li>✓ Zgodność z RODO</li>
              <li>✓ Bezpieczne przechowywanie</li>
              <li>✓ Możliwość usunięcia danych</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WgrajPlik;
