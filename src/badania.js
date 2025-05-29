import React from 'react';
import { FaChartLine, FaEye, FaTrash, FaFileAlt, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import './components.css';

function PrzeslaneBadania({
  files,
  loadingAnalysis,
  handleAnalyze,
  handleShowAnalysis,
  handleDelete,
  formatDate,
  setFiles
}) {
  // Modal do podglądu analizy
  const renderAnalysisModal = (doc) => {
    if (!doc || !doc.showAnalysis) return null;
    
    return (
      <div className="modern-modal-overlay" onClick={() => handleShowAnalysis(null)}>
        <div className="modern-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modern-modal-header">
            <h3 className="modern-modal-title">
              <FaFileAlt style={{ marginRight: '0.5rem', color: 'var(--accent-blue)' }} />
              Analiza badań: {doc.filename}
            </h3>
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
                      <FaClock style={{ marginRight: '0.25rem', color: 'var(--text-muted)' }} />
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
                  {doc.analysis ? (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1rem',
                      background: 'rgba(16, 185, 129, 0.15)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: '12px',
                      color: '#6ee7b7',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FaCheckCircle />
                      Analiza AI dostępna - gotowa do przeglądu
                    </div>
                  ) : (
                    <div style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1rem',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      borderRadius: '12px',
                      color: '#fbbf24',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <FaExclamationTriangle />
                      Oczekuje na analizę AI
                    </div>
                  )}

                  {/* Additional file info */}
                  {(doc.symptoms || doc.chronic_diseases || doc.medications) && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <details style={{ 
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        padding: '1rem'
                      }}>
                        <summary style={{
                          cursor: 'pointer',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          marginBottom: '1rem',
                          padding: '0.5rem',
                          borderRadius: '8px',
                          background: 'var(--bg-glass)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <FaFileAlt style={{ color: 'var(--accent-purple)' }} />
                          Dodatkowe informacje medyczne
                        </summary>
                        <div style={{ padding: '1rem 0', color: 'var(--text-secondary)' }}>
                          {doc.symptoms && (
                            <div style={{ 
                              marginBottom: '1rem',
                              padding: '0.75rem',
                              background: 'var(--bg-glass)',
                              borderRadius: '8px',
                              borderLeft: '3px solid var(--accent-orange)'
                            }}>
                              <strong style={{ color: 'var(--text-primary)' }}>Symptomy:</strong>
                              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>{doc.symptoms}</p>
                            </div>
                          )}
                          {doc.chronic_diseases && (
                            <div style={{ 
                              marginBottom: '1rem',
                              padding: '0.75rem',
                              background: 'var(--bg-glass)',
                              borderRadius: '8px',
                              borderLeft: '3px solid var(--accent-red)'
                            }}>
                              <strong style={{ color: 'var(--text-primary)' }}>Choroby przewlekłe:</strong>
                              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>{doc.chronic_diseases}</p>
                            </div>
                          )}
                          {doc.medications && (
                            <div style={{ 
                              marginBottom: '0.5rem',
                              padding: '0.75rem',
                              background: 'var(--bg-glass)',
                              borderRadius: '8px',
                              borderLeft: '3px solid var(--accent-green)'
                            }}>
                              <strong style={{ color: 'var(--text-primary)' }}>Przyjmowane leki:</strong>
                              <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)' }}>{doc.medications}</p>
                            </div>
                          )}
                        </div>
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

            {/* Enhanced Statistics Card */}
            <div className="modern-card modern-card-small" style={{ marginTop: '2rem' }}>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                marginBottom: '1.5rem',
                fontSize: '1.25rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <FaChartLine style={{ color: 'var(--accent-blue)' }} />
                Statystyki badań
              </h3>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.5rem'
              }}>
                <div style={{ 
                  textAlign: 'center',
                  padding: '1.5rem',
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: '800',
                    background: 'var(--primary-gradient)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem'
                  }}>
                    {files.total}
                  </div>
                  <div style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    Wszystkich badań
                  </div>
                </div>
                
                <div style={{ 
                  textAlign: 'center',
                  padding: '1.5rem',
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: '800',
                    background: 'var(--success-gradient)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem'
                  }}>
                    {files.documents.filter(doc => doc.analysis).length}
                  </div>
                  <div style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    Przeanalizowanych
                  </div>
                </div>
                
                <div style={{ 
                  textAlign: 'center',
                  padding: '1.5rem',
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: '800',
                    background: 'var(--warning-gradient)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '0.5rem'
                  }}>
                    {files.documents.filter(doc => !doc.analysis).length}
                  </div>
                  <div style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
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
