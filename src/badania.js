import React from 'react';
import { FaChartLine, FaEye, FaTrash, FaFileAlt } from 'react-icons/fa';
import './components.css';

function PrzeslaneBadania({
  files,
  loadingAnalysis,
  handleAnalyze,
  handleShowAnalysis,
  handleDelete,
  formatDate,
  styles,
  setFiles
}) {
  // Modal do podglądu analizy
  const renderAnalysisModal = (doc) => {
    if (!doc || !doc.showAnalysis) return null;
    
    return (
      <div className="modern-modal-overlay" onClick={() => handleShowAnalysis(null)}>
        <div className="modern-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modern-modal-header">
            <h3 className="modern-modal-title">Analiza badań: {doc.filename}</h3>
            <button 
              className="modern-modal-close"
              onClick={() => handleShowAnalysis(null)}
            >
              ×
            </button>
          </div>
          <div className="modern-modal-body">
            <div className="modern-analysis-content" dangerouslySetInnerHTML={{ __html: doc.analysis }} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="modern-container">
      {/* Animated background particles */}
      <div className="bg-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Modern Page Header */}
        <div className="modern-page-header">
          <h1 className="modern-page-title">Przesłane badania</h1>
          <p className="modern-page-subtitle">
            Przeglądaj swoje przesłane wyniki badań, analizuj je za pomocą AI i śledź zmiany w czasie
          </p>
        </div>

        {/* Content */}
        {files.documents.length === 0 ? (
          <div className="modern-card">
            <div className="modern-empty-state">
              <FaFileAlt className="modern-empty-icon" />
              <h3 className="modern-empty-title">Brak przesłanych badań</h3>
              <p className="modern-empty-description">
                Rozpocznij od przesłania swojego pierwszego pliku PDF z wynikami badań. 
                Nasza sztuczna inteligencja automatycznie przeanalizuje wyniki i dostarczy szczegółową interpretację.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Files Grid */}
            <div style={{ display: 'grid', gap: '1.5rem' }}>
              {files.documents.map(doc => (
                <div key={doc.id} className="modern-file-item">
                  <div className="modern-file-header">
                    <div className="modern-file-name">
                      <FaFileAlt style={{ marginRight: '0.5rem', color: 'var(--accent-blue)' }} />
                      {doc.filename}
                    </div>
                    <div className="modern-file-date">
                      {formatDate(doc.upload_date)}
                    </div>
                  </div>
                  
                  {/* File Actions */}
                  <div className="modern-file-actions">
                    {doc.analysis ? (
                      <button
                        className="modern-btn modern-btn-success modern-btn-small"
                        onClick={() => handleShowAnalysis(doc)}
                      >
                        <FaEye />
                        Pokaż analizę
                      </button>
                    ) : (
                      <button
                        className="modern-btn modern-btn-small"
                        onClick={() => handleAnalyze(doc)}
                        disabled={loadingAnalysis === doc.id}
                      >
                        {loadingAnalysis === doc.id ? (
                          <div className="modern-loading">
                            <div className="modern-spinner"></div>
                            Analizuję...
                          </div>
                        ) : (
                          <>
                            <FaChartLine />
                            Analizuj z AI
                          </>
                        )}
                      </button>
                    )}
                    
                    <button
                      className="modern-btn modern-btn-danger modern-btn-small"
                      onClick={() => {
                        if (window.confirm(`Czy na pewno chcesz usunąć plik "${doc.filename}"?`)) {
                          handleDelete(doc.id);
                        }
                      }}
                    >
                      <FaTrash />
                      Usuń
                    </button>
                  </div>

                  {/* Analysis Status Indicator */}
                  {doc.analysis && (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '8px',
                      color: 'var(--accent-green)',
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FaChartLine />
                      Analiza AI dostępna
                    </div>
                  )}

                  {/* Additional file info */}
                  {(doc.symptoms || doc.chronic_diseases || doc.medications) && (
                    <div style={{ marginTop: '1rem' }}>
                      <details style={{ 
                        background: 'var(--bg-glass)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '1rem'
                      }}>
                        <summary style={{
                          cursor: 'pointer',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          marginBottom: '0.5rem'
                        }}>
                          Dodatkowe informacje
                        </summary>
                        {doc.symptoms && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Symptomy:</strong> {doc.symptoms}
                          </div>
                        )}
                        {doc.chronic_diseases && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong>Choroby przewlekłe:</strong> {doc.chronic_diseases}
                          </div>
                        )}
                        {doc.medications && (
                          <div>
                            <strong>Leki:</strong> {doc.medications}
                          </div>
                        )}
                      </details>
                    </div>
                  )}

                  {doc.showAnalysis && renderAnalysisModal(doc)}
                </div>
              ))}
            </div>

            {/* Modern Pagination */}
            {files.totalPages > 1 && (
              <div className="modern-pagination">
                <button
                  className="modern-btn modern-btn-secondary modern-btn-small"
                  onClick={() => setFiles(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={files.page === 1}
                >
                  ← Poprzednia
                </button>
                
                <div className="modern-pagination-info">
                  Strona {files.page} z {files.totalPages}
                </div>
                
                <button
                  className="modern-btn modern-btn-secondary modern-btn-small"
                  onClick={() => setFiles(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={files.page === files.totalPages}
                >
                  Następna →
                </button>
              </div>
            )}

            {/* Statistics Card */}
            <div className="modern-card modern-card-small" style={{ marginTop: '2rem' }}>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FaChartLine style={{ color: 'var(--accent-blue)' }} />
                Statystyki
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: '800',
                    background: 'var(--primary-gradient)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {files.total}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Wszystkich badań
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: '800',
                    background: 'var(--success-gradient)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {files.documents.filter(doc => doc.analysis).length}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Przeanalizowanych
                  </div>
                </div>
                
                <div style={{ textAlign: 'center' }}>
                  <div style={{ 
                    fontSize: '2rem', 
                    fontWeight: '800',
                    background: 'var(--warning-gradient)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {files.documents.filter(doc => !doc.analysis).length}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    Oczekuje analizy
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PrzeslaneBadania;
