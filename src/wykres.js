import React from 'react';
import { Line } from 'react-chartjs-2';
import { FaChartLine, FaCheckSquare, FaSquare, FaBrain, FaCalendarAlt, FaChartBar, FaTable, FaInfoCircle } from 'react-icons/fa';
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
          <h1 className="modern-page-title">Podsumowanie badań</h1>
          <p className="modern-page-subtitle">
            Analizuj trendy zdrowotne, porównuj parametry w czasie i otrzymaj inteligentne wnioski AI o Twoim stanie zdrowia
          </p>
        </div>

        {/* Parameter Selection */}
        {uniqueParams.length > 0 ? (
          <>
            <div className="modern-card" style={{ marginBottom: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '2rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-color)'
              }}>
                <div>
                  <h3 style={{ 
                    color: 'var(--text-primary)', 
                    marginBottom: '0.5rem',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FaChartLine style={{ color: 'var(--accent-blue)' }} />
                    Wybierz parametry do analizy
                  </h3>
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '1rem',
                    margin: 0
                  }}>
                    Wybierz które parametry chcesz analizować i porównywać w czasie
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={handleSelectAll}
                    className="modern-btn modern-btn-secondary modern-btn-small"
                  >
                    <FaCheckSquare />
                    Zaznacz wszystkie
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="modern-btn modern-btn-secondary modern-btn-small"
                  >
                    <FaSquare />
                    Odznacz wszystkie
                  </button>
                </div>
              </div>
              
              {/* Enhanced Parameter Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem'
              }}>
                {uniqueParams.map(param => (
                  <label
                    key={param}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem',
                      background: selectedParams.includes(param) 
                        ? 'rgba(59, 130, 246, 0.15)' 
                        : 'var(--bg-card)',
                      border: selectedParams.includes(param) 
                        ? '1px solid var(--accent-blue)' 
                        : '1px solid var(--border-color)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      gap: '0.75rem'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedParams.includes(param)}
                      onChange={() => handleParamToggle(param)}
                      style={{ 
                        width: '18px', 
                        height: '18px',
                        accentColor: 'var(--accent-blue)',
                        cursor: 'pointer'
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ 
                        color: 'var(--text-primary)', 
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        marginBottom: '0.25rem'
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
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: selectedParams.includes(param) 
                        ? 'var(--accent-green)' 
                        : 'var(--text-muted)'
                    }} />
                  </label>
                ))}
              </div>

              {/* Generate Analysis Button */}
              {selectedParams.length > 0 && (
                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <button
                    onClick={handleSummarize}
                    disabled={isAnalyzing}
                    className="modern-btn"
                    style={{ fontSize: '1rem', padding: '1rem 2rem' }}
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
                  
                  <p style={{ 
                    color: 'var(--text-muted)', 
                    fontSize: '0.875rem',
                    marginTop: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}>
                    <FaInfoCircle />
                    Wybrano {selectedParams.length} z {uniqueParams.length} parametrów
                  </p>
                </div>
              )}
            </div>

            {/* Chart Display */}
            {selectedParams.length > 0 && chartData.datasets.length > 0 && (
              <div className="modern-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  marginBottom: '2rem',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FaChartBar style={{ color: 'var(--accent-green)' }} />
                  Wykres trendów parametrów
                </h3>
                
                <div style={{ 
                  height: '500px',
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  padding: '2rem',
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

            {/* Enhanced Data Table */}
            {selectedParams.length > 0 && (
              <div className="modern-card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  marginBottom: '2rem',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <FaTable style={{ color: 'var(--accent-purple)' }} />
                  Tabela wyników
                </h3>
                
                <div style={{ 
                  overflowX: 'auto',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    background: 'var(--bg-card)'
                  }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-glass)' }}>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'left',
                          color: 'var(--text-primary)',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          borderBottom: '1px solid var(--border-color)'
                        }}>
                          <FaCalendarAlt style={{ marginRight: '0.5rem', color: 'var(--accent-blue)' }} />
                          Data
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'left',
                          color: 'var(--text-primary)',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          borderBottom: '1px solid var(--border-color)'
                        }}>
                          Parametr
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'left',
                          color: 'var(--text-primary)',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          borderBottom: '1px solid var(--border-color)'
                        }}>
                          Wartość
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'left',
                          color: 'var(--text-primary)',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          borderBottom: '1px solid var(--border-color)'
                        }}>
                          Komentarz
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {parameters
                        .filter(param => selectedParams.includes(param.parameter_name))
                        .sort((a, b) => new Date(b.measurement_date) - new Date(a.measurement_date))
                        .map((param, index) => (
                          <tr key={index} style={{
                            borderBottom: '1px solid var(--border-color)',
                            transition: 'background-color 0.2s ease'
                          }}>
                            <td style={{ 
                              padding: '1rem', 
                              color: 'var(--text-secondary)',
                              fontSize: '0.875rem'
                            }}>
                              {new Date(param.measurement_date).toLocaleDateString('pl-PL')}
                            </td>
                            <td style={{ 
                              padding: '1rem', 
                              color: 'var(--text-primary)',
                              fontWeight: '500',
                              fontSize: '0.875rem'
                            }}>
                              {param.parameter_name}
                            </td>
                            <td style={{ 
                              padding: '1rem', 
                              color: 'var(--text-primary)',
                              fontWeight: '600',
                              fontSize: '0.875rem'
                            }}>
                              {param.parameter_value}
                            </td>
                            <td style={{ 
                              padding: '1rem', 
                              color: 'var(--text-secondary)',
                              fontSize: '0.875rem',
                              lineHeight: '1.4'
                            }}>
                              {param.parameter_comment || 'Brak dodatkowych informacji'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
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
                  marginBottom: '2rem',
                  paddingBottom: '1rem',
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
                    color: 'white',
                    boxShadow: 'var(--shadow-lg)'
                  }}>
                    <FaBrain />
                  </div>
                  <div>
                    <h3 style={{ 
                      color: 'var(--text-primary)', 
                      marginBottom: '0.5rem',
                      fontSize: '1.5rem',
                      fontWeight: '700'
                    }}>
                      Analiza AI Twoich wyników
                    </h3>
                    <p style={{ 
                      color: 'var(--text-secondary)', 
                      fontSize: '1rem',
                      margin: 0
                    }}>
                      Inteligentna interpretacja Twoich parametrów zdrowotnych w kontekście trendów czasowych
                    </p>
                  </div>
                </div>
                
                <div 
                  className="modern-analysis-content"
                  dangerouslySetInnerHTML={{ __html: summary }}
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: '12px',
                    padding: '2rem',
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
