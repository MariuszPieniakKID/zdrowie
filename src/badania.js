import React from 'react';
import { FaChartLine, FaEye, FaTrash } from 'react-icons/fa';

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
  const shorterButtonStyle = {
    maxWidth: '30%',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    padding: '4px 8px',
    fontSize: '0.85em'
  };

  // Funkcja do renderowania analizy z podziałem na sekcje
  const renderAnalysis = (analysis) => {
    if (!analysis) return null;
    
    // Znajdź tabelę HTML w tekście analizy
    const tableRegex = /<table[\s\S]*?<\/table>/i;
    const tableMatch = analysis.match(tableRegex);
    
    if (!tableMatch) {
      // Jeśli nie ma tabeli, wyświetl całą analizę w sekcji interpretacji
      return (
        <div style={styles.analysisContainer}>
          <section style={styles.analysisSection}>
            <h3 style={styles.sectionHeader}>Analiza oraz interpretacja</h3>
            <div 
              style={styles.analysisContent}
              dangerouslySetInnerHTML={{ __html: analysis }}
            />
          </section>
        </div>
      );
    }
    
    // Wyodrębnij tabelę i tekst interpretacji
    const tableHtml = tableMatch[0];
    let interpretationHtml = analysis.replace(tableHtml, '').trim();
    
    // Usuń nagłówek "Podsumowanie i interpretacja:" jeśli istnieje
    interpretationHtml = interpretationHtml.replace(/^\*\*Podsumowanie i interpretacja:\*\*/i, '');
    interpretationHtml = interpretationHtml.replace(/^Podsumowanie i interpretacja:/i, '');
    
    // Usuń "Oto analiza Twoich wyników laboratoryjnych w formie tabeli HTML:" jeśli istnieje
    interpretationHtml = interpretationHtml.replace(/Oto analiza Twoich wyników laboratoryjnych w formie tabeli HTML:/i, '');
    
    return (
      <div style={styles.analysisContainer}>
        <section style={styles.analysisSection}>
          <h3 style={styles.sectionHeader}>Analiza oraz interpretacja</h3>
          <div 
            style={styles.analysisContent}
            dangerouslySetInnerHTML={{ __html: interpretationHtml }}
          />
        </section>
        
        <section style={styles.analysisSection}>
          <h3 style={styles.sectionHeader}>Tabela wyników</h3>
          <div 
            style={styles.tableContainer}
            dangerouslySetInnerHTML={{ __html: tableHtml }}
          />
        </section>
      </div>
    );
  };

  // Modal do podglądu analizy
  const renderAnalysisModal = (doc) => {
    if (!doc || !doc.showAnalysis) return null;
    
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <div style={styles.modalHeader}>
            <h3>Analiza badań: {doc.filename}</h3>
            <button 
              style={styles.closeButton}
              onClick={() => handleShowAnalysis(null)}
            >
              &times;
            </button>
          </div>
          {renderAnalysis(doc.analysis)}
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2>Przesłane badania</h2>
      {files.documents.length === 0 ? (
        <p>Brak plików</p>
      ) : (
        <div>
          {files.documents.map(doc => (
            <div key={doc.id} style={styles.fileItem}>
              <div style={styles.fileHeader}>
                <div style={styles.fileName}>{doc.filename}</div>
                <div style={styles.fileDate}>{formatDate(doc.upload_date)}</div>
              </div>
              <div style={styles.fileActions}>
                {doc.analysis ? (
                  <button
                    style={{ ...styles.button, ...styles.smallButton, ...shorterButtonStyle }}
                    onClick={() => handleShowAnalysis(doc)}
                  >
                    <FaEye /> Pokaż analizę
                  </button>
                ) : (
                  <button
                    style={{ ...styles.button, ...styles.smallButton, ...shorterButtonStyle }}
                    onClick={() => handleAnalyze(doc)}
                    disabled={loadingAnalysis === doc.id}
                  >
                    {loadingAnalysis === doc.id ? (
                      <>Analizuję...</>
                    ) : (
                      <><FaChartLine /> Analizuj</>
                    )}
                  </button>
                )}
                <button
                  style={{ ...styles.button, ...styles.smallButton, ...styles.secondaryButton, ...shorterButtonStyle }}
                  onClick={() => handleDelete(doc.id)}
                >
                  <FaTrash /> Usuń
                </button>
              </div>
              {doc.showAnalysis && renderAnalysisModal(doc)}
            </div>
          ))}
          {files.totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                style={{ ...styles.pageButton }}
                onClick={() => setFiles(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={files.page === 1}
              >
                Poprzednia
              </button>
              <span>{files.page} z {files.totalPages}</span>
              <button
                style={{ ...styles.pageButton }}
                onClick={() => setFiles(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={files.page === files.totalPages}
              >
                Następna
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default PrzeslaneBadania;
