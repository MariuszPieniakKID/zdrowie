import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { FaChartLine, FaCheckSquare, FaSquare, FaBrain, FaCalendarAlt, FaChartBar, FaTable, FaInfoCircle, FaCaretDown, FaCaretRight } from 'react-icons/fa';
import './components.css';

/**
 * Komponent wyświetlający wykresy parametrów zdrowotnych i analizę AI.
 */
function WykresWynikow({
  parameters,
  selectedParams,
  chartData,
  handleParamToggle,
  handleSummarize,
  summary,
  isAnalyzing,
  handleSelectAll,
  handleDeselectAll
}) {
  // Unikalne parametry
  const uniqueParams = [...new Set(parameters.map(p => p.parameter_name))];
  const [isParametersCollapsed, setIsParametersCollapsed] = useState(uniqueParams.length > 8);

  // Funkcja generująca analizę na podstawie wartości parametrów
  const generateAnalysis = (paramName, value, units) => {
    const ranges = {
      'Hemoglobina': { min: 12, max: 16 },
      'Leukocyty': { min: 4, max: 10 },
      'Erytrocyty': { min: 4.2, max: 5.4 },
      'Glukoza': { min: 70, max: 99 },
      'Cholesterol': { min: 0, max: 200 },
    };

    const defaultRange = { min: 0, max: 100 };
    const range = ranges[paramName] || defaultRange;
    const numValue = parseFloat(value);

    if (isNaN(numValue)) return '';

    if (numValue > range.max) {
      return `Prawidłowy zakres: ${range.min}–${range.max} ${units || ''}. Wynik powyżej normy.`;
    } else if (numValue < range.min) {
      return `Prawidłowy zakres: ${range.min}–${range.max} ${units || ''}. Wynik poniżej normy.`;
    } else {
      return `Prawidłowy zakres: ${range.min}–${range.max} ${units || ''}. Wynik w normie.`;
    }
  };

  // Grupowanie danych dla tabeli z wykorzystaniem pola "analysis"
  const groupedData = parameters.reduce((acc, param) => {
    if (!selectedParams.includes(param.parameter_name)) return acc;
    const key = param.parameter_name;
    const date = new Date(param.measurement_date).toLocaleDateString('pl-PL');
    if (!acc[key]) {
      acc[key] = {
        values: {},
        units: param.units,
        analysis: {}
      };
    }
    acc[key].values[date] = param.parameter_value;

    if (!param.analysis || String(param.analysis).trim() === '') {
      acc[key].analysis[date] = generateAnalysis(
        param.parameter_name,
        param.parameter_value,
        param.units
      );
    } else {
      acc[key].analysis[date] = param.analysis;
    }
    return acc;
  }, {});

  // Unikalne daty posortowane chronologicznie
  const uniqueDates = [...new Set(parameters.map(p =>
    new Date(p.measurement_date).toLocaleDateString('pl-PL')
  ))].sort((a, b) => new Date(a.split('.').reverse().join('-')) - new Date(b.split('.').reverse().join('-')));

  // Funkcja określająca styl i strzałkę na podstawie analizy
  const getCellProps = (analysisInput) => {
    if (!analysisInput || String(analysisInput).trim() === '') {
      return { bg: 'transparent', arrow: null };
    }

    const analysisText = String(analysisInput).toLowerCase();

    if (
      analysisText.includes('podwyższone') ||
      analysisText.includes('powyżej norm')
    ) {
      return { bg: 'rgba(239, 68, 68, 0.1)', arrow: '↑', color: 'var(--accent-red)' };
    }

    if (
      analysisText.includes('obniżone') ||
      analysisText.includes('poniżej norm')
    ) {
      return { bg: 'rgba(59, 130, 246, 0.1)', arrow: '↓', color: 'var(--accent-blue)' };
    }

    if (analysisText.includes('w normie') || analysisText.includes('prawidłowy')) {
      return { bg: 'rgba(16, 185, 129, 0.1)', arrow: null, color: 'var(--accent-green)' };
    }

    return { bg: 'transparent', arrow: null };
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
        <div className="modern-page-header" style={{ marginBottom: '1.5rem' }}>
          <h1 className="modern-page-title">Podsumowanie badań</h1>
          <p className="modern-page-subtitle">
            Analizuj trendy zdrowotne, porównuj parametry w czasie i otrzymaj inteligentne wnioski AI o Twoim stanie zdrowia
          </p>
        </div>

        {/* Parameter Selection */}
        {uniqueParams.length > 0 ? (
          <>
            <div className="modern-card" style={{ marginBottom: '1.5rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '1rem',
                cursor: 'pointer'
              }}
              onClick={() => setIsParametersCollapsed(!isParametersCollapsed)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 style={{ 
                    color: 'var(--text-primary)', 
                    margin: 0,
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {isParametersCollapsed ? <FaCaretRight /> : <FaCaretDown />}
                    <FaChartLine style={{ color: 'var(--accent-blue)' }} />
                    Wybierz parametry do analizy ({selectedParams.length}/{uniqueParams.length})
                  </h3>
                </div>
                
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSelectAll(); }}
                    className="modern-btn modern-btn-secondary modern-btn-small"
                  >
                    <FaCheckSquare />
                    Wszystkie
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeselectAll(); }}
                    className="modern-btn modern-btn-secondary modern-btn-small"
                  >
                    <FaSquare />
                    Wyczyść
                  </button>
                </div>
              </div>
              
              {!isParametersCollapsed && (
                <>
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.9rem',
                    margin: '0 0 1rem 0'
                  }}>
                    Wybierz które parametry chcesz analizować i porównywać w czasie
                  </p>
                  
                  {/* Enhanced Parameter Grid */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '0.75rem'
                  }}>
                    {uniqueParams.map(param => (
                      <label
                        key={param}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.75rem',
                          background: selectedParams.includes(param) 
                            ? 'rgba(59, 130, 246, 0.15)' 
                            : 'var(--bg-card)',
                          border: selectedParams.includes(param) 
                            ? '1px solid var(--accent-blue)' 
                            : '1px solid var(--border-color)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          gap: '0.5rem',
                          fontSize: '0.875rem'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedParams.includes(param)}
                          onChange={() => handleParamToggle(param)}
                          style={{ 
                            width: '16px', 
                            height: '16px',
                            accentColor: 'var(--accent-blue)',
                            cursor: 'pointer'
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            color: 'var(--text-primary)', 
                            fontWeight: '500'
                          }}>
                            {param}
                          </div>
                          <div style={{ 
                            color: 'var(--text-muted)', 
                            fontSize: '0.75rem'
                          }}>
                            {parameters.filter(p => p.parameter_name === param).length} pomiarów
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </>
              )}

              {/* Generate Analysis Button */}
              {selectedParams.length > 0 && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <button
                    onClick={handleSummarize}
                    disabled={isAnalyzing}
                    className="modern-btn"
                    style={{ fontSize: '0.9rem', padding: '0.75rem 1.5rem' }}
                  >
                    {isAnalyzing ? (
                      <div className="modern-loading">
                        <div className="modern-spinner"></div>
                        Generuję analizę AI...
                      </div>
                    ) : (
                      <>
                        <FaBrain />
                        Wygeneruj analizę AI wybranych parametrów
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Enhanced Comparison Table - Original Structure */}
            {selectedParams.length > 0 && (
              <div className="modern-card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  marginBottom: '1rem',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FaTable style={{ color: 'var(--accent-purple)' }} />
                  Porównanie parametrów w czasie
                </h3>
                
                <div style={{ 
                  overflowX: 'auto',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    minWidth: '600px',
                    background: 'var(--bg-glass)'
                  }}>
                    <thead>
                      <tr style={{ background: 'rgba(103, 126, 234, 0.1)' }}>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'left',
                          position: 'sticky',
                          left: 0,
                          background: 'rgba(103, 126, 234, 0.1)',
                          zIndex: 1,
                          border: '1px solid var(--border-color)',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          color: 'var(--text-primary)'
                        }}>
                          Parametr
                        </th>
                        {uniqueDates.map(date => (
                          <th
                            key={date}
                            style={{
                              padding: '1rem',
                              textAlign: 'center',
                              minWidth: '140px',
                              border: '1px solid var(--border-color)',
                              fontSize: '0.875rem',
                              fontWeight: '600',
                              color: 'var(--text-primary)'
                            }}
                          >
                            {date}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(groupedData).map(([param, { values, units, analysis }]) => (
                        <tr key={param} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{
                            padding: '1rem',
                            position: 'sticky',
                            left: 0,
                            background: 'var(--bg-glass)',
                            fontWeight: '600',
                            border: '1px solid var(--border-color)',
                            fontSize: '0.875rem',
                            color: 'var(--text-primary)'
                          }}>
                            {param} {units && <span style={{ color: 'var(--text-muted)' }}>({units})</span>}
                          </td>
                          {uniqueDates.map(date => {
                            const { bg, arrow, color } = getCellProps(analysis[date]);
                            return (
                              <td
                                key={date}
                                style={{
                                  padding: '1rem',
                                  textAlign: 'center',
                                  backgroundColor: bg,
                                  color: color || 'var(--text-primary)',
                                  fontWeight: '600',
                                  border: '1px solid var(--border-color)',
                                  fontSize: '0.875rem'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                  {values[date] || '-'}
                                  {arrow && <span style={{ fontSize: '1.2rem' }}>{arrow}</span>}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Chart Display */}
            {selectedParams.length > 0 && chartData.datasets.length > 0 && (
              <div className="modern-card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  marginBottom: '1rem',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FaChartBar style={{ color: 'var(--accent-green)' }} />
                  Wykres trendów parametrów
                </h3>
                
                <div style={{ 
                  height: '400px',
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  padding: '1rem',
                  border: '1px solid var(--border-color)'
                }}>
                  <Line 
                    data={chartData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: {
                        intersect: false,
                        mode: 'index'
                      },
                      plugins: {
                        legend: {
                          labels: {
                            color: '#e4e4e7',
                            font: {
                              family: 'Inter',
                              size: 12,
                              weight: '500'
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                          }
                        },
                        tooltip: {
                          backgroundColor: 'rgba(0, 0, 0, 0.9)',
                          titleColor: '#ffffff',
                          bodyColor: '#e4e4e7',
                          borderColor: 'var(--border-color)',
                          borderWidth: 1,
                          cornerRadius: 8,
                          titleFont: {
                            family: 'Inter',
                            size: 13,
                            weight: '600'
                          },
                          bodyFont: {
                            family: 'Inter',
                            size: 12
                          }
                        }
                      },
                      scales: {
                        x: {
                          type: 'time',
                          time: {
                            unit: 'day',
                            displayFormats: {
                              day: 'dd.MM.yyyy'
                            }
                          },
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            drawBorder: false
                          },
                          ticks: {
                            color: '#a1a1aa',
                            font: {
                              family: 'Inter',
                              size: 11
                            },
                            maxTicksLimit: 8
                          }
                        },
                        y: {
                          beginAtZero: false,
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                            drawBorder: false
                          },
                          ticks: {
                            color: '#a1a1aa',
                            font: {
                              family: 'Inter',
                              size: 11
                            }
                          }
                        }
                      },
                      elements: {
                        point: {
                          radius: 4,
                          hoverRadius: 6,
                          borderWidth: 2,
                          hitRadius: 8
                        },
                        line: {
                          borderWidth: 3,
                          tension: 0.2
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            )}

            {/* Enhanced AI Analysis Results */}
            {summary && (
              <div className="modern-card">
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem',
                  marginBottom: '1rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    background: 'var(--primary-gradient)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem',
                    color: 'white',
                    boxShadow: 'var(--shadow-lg)'
                  }}>
                    <FaBrain />
                  </div>
                  <div>
                    <h3 style={{ 
                      color: 'var(--text-primary)', 
                      marginBottom: '0.25rem',
                      fontSize: '1.25rem',
                      fontWeight: '700'
                    }}>
                      Analiza AI Twoich wyników
                    </h3>
                    <p style={{ 
                      color: 'var(--text-secondary)', 
                      fontSize: '0.875rem',
                      margin: 0
                    }}>
                      Inteligentna interpretacja parametrów zdrowotnych w kontekście trendów czasowych
                    </p>
                  </div>
                </div>
                
                <div 
                  className="modern-analysis-content"
                  dangerouslySetInnerHTML={{ __html: summary }}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    border: '1px solid var(--border-color)',
                    lineHeight: '1.6'
                  }}
                />
              </div>
            )}
          </>
        ) : (
          // Enhanced Empty State
          <div className="modern-card">
            <div className="modern-empty-state">
              <FaChartLine className="modern-empty-icon" />
              <h3 className="modern-empty-title">Brak danych do analizy</h3>
              <p className="modern-empty-description">
                Aby zobaczyć wykresy i analizy, musisz najpierw przesłać wyniki badań i przeanalizować je za pomocą AI. 
                Przejdź do sekcji "Wgraj nowy plik" i prześlij swoje pierwsze badanie.
              </p>
              
              <div style={{
                marginTop: '2rem',
                padding: '1.5rem',
                background: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '12px',
                color: '#93c5fd',
                fontSize: '0.875rem',
                lineHeight: '1.6'
              }}>
                <FaInfoCircle style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'block', margin: '0 auto 1rem' }} />
                <strong>Jak zacząć:</strong>
                <ol style={{ textAlign: 'left', marginTop: '1rem', paddingLeft: '1.5rem' }}>
                  <li style={{ marginBottom: '0.5rem' }}>Przejdź do sekcji "Wgraj nowy plik"</li>
                  <li style={{ marginBottom: '0.5rem' }}>Prześlij PDF z wynikami badań</li>
                  <li style={{ marginBottom: '0.5rem' }}>Przeanalizuj plik za pomocą AI</li>
                  <li>Wróć tutaj, aby zobaczyć wykresy i trendy</li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WykresWynikow;
