import React from 'react';
import { Line } from 'react-chartjs-2';
import { pl } from 'date-fns/locale';
import { FaChartLine, FaTable, FaCheckSquare, FaSquare, FaBrain } from 'react-icons/fa';
import { Chart as ChartJS, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import './components.css';

ChartJS.register(...registerables);

/**
 * Komponent wyświetlający wykres i tabelę wyników wraz z analizą.
 */
function WykresWynikow({
  parameters,
  selectedParams,
  chartData,
  styles,
  handleParamToggle,
  handleSummarize,
  summary,
  isAnalyzing,
  handleSelectAll,
  handleDeselectAll
}) {
  // Funkcja generująca analizę na podstawie wartości parametrów
  // DOSTOSUJ ZAKRESY (ranges) DO SWOICH DANYCH
  const generateAnalysis = (paramName, value, units) => {
    const ranges = {
      'Hemoglobina': { min: 12, max: 16 },
      'Leukocyty': { min: 4, max: 10 },
      'Erytrocyty': { min: 4.2, max: 5.4 },
      'Glukoza': { min: 70, max: 99 },
      'Cholesterol': { min: 0, max: 200 },
      // Dodaj więcej parametrów i ich prawidłowe zakresy według potrzeb
    };

    const defaultRange = { min: 0, max: 100 }; // Domyślny zakres, jeśli parametr nie jest zdefiniowany w `ranges`
    const range = ranges[paramName] || defaultRange;
    const numValue = parseFloat(value);

    if (isNaN(numValue)) return ''; // Jeśli wartość nie jest liczbą, nie generuj analizy

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

    // Jeśli oryginalna analiza jest pusta lub jej brakuje, wygeneruj ją
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

    const analysisText = String(analysisInput).toLowerCase(); // Konwersja do małych liter

    // Priorytet 1: Czerwone tło dla wyników nieprawidłowych
    // Czerwony, strzałka w górę
    if (
      analysisText.includes('podwyższone') || // Obejmuje "nieznacznie podwyższone"
      analysisText.includes('powyżej norm')   // Obejmuje "powyżej normy", "powyżej norm." itp.
    ) {
      return { bg: 'rgba(239, 68, 68, 0.1)', arrow: '↑', color: 'var(--accent-red)' };
    }

    // Czerwony, strzałka w dół
    if (
      analysisText.includes('poniżej progu alarmowego') ||
      analysisText.includes('poniżej norm') // Obejmuje "poniżej normy", "poniżej norm." itp.
    ) {
      return { bg: 'rgba(239, 68, 68, 0.1)', arrow: '↓', color: 'var(--accent-red)' };
    }

    // Priorytet 2: Zielone tło dla wyników prawidłowych
    if (
      analysisText.includes('wartość pożądana') ||
      analysisText.includes('w normie') ||
      analysisText.includes('prawidłow') // Obejmuje "prawidłowy", "prawidłowa"
    ) {
      return { bg: 'rgba(16, 185, 129, 0.1)', arrow: null, color: 'var(--accent-green)' };
    }

    // Domyślnie, jeśli żaden warunek nie pasuje
    return { bg: 'transparent', arrow: null, color: 'var(--text-secondary)' };
  };

  const uniqueParams = [...new Set(parameters.map(p => p.parameter_name))];

  return (
    <div className="modern-container">
      {/* Animated background particles */}
      <div className="bg-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem' }}>
        {/* Modern Page Header */}
        <div className="modern-page-header">
          <h1 className="modern-page-title">Podsumowanie badań</h1>
          <p className="modern-page-subtitle">
            Analizuj swoje wyniki w czasie, porównuj parametry i śledź trendy zdrowotne
          </p>
        </div>

        {/* Parameters Selection Card */}
        <div className="modern-card">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '2rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FaBrain style={{ color: 'var(--accent-blue)', fontSize: '1.5rem' }} />
              <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>
                Wybierz parametry do analizy
              </h3>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                className="modern-btn modern-btn-secondary modern-btn-small"
                onClick={handleSelectAll}
              >
                <FaCheckSquare />
                Zaznacz wszystko
              </button>
              <button
                className="modern-btn modern-btn-secondary modern-btn-small"
                onClick={handleDeselectAll}
              >
                <FaSquare />
                Odznacz wszystko
              </button>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '1rem'
          }}>
            {uniqueParams.map(param => (
              <label 
                key={param} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '1rem',
                  background: selectedParams.includes(param) 
                    ? 'rgba(59, 130, 246, 0.1)' 
                    : 'var(--bg-glass)',
                  border: selectedParams.includes(param)
                    ? '1px solid var(--accent-blue)'
                    : '1px solid var(--border-color)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedParams.includes(param)}
                  onChange={() => handleParamToggle(param)}
                  style={{ 
                    width: '18px', 
                    height: '18px',
                    accentColor: 'var(--accent-blue)'
                  }}
                />
                <span style={{ 
                  color: selectedParams.includes(param) 
                    ? 'var(--text-primary)' 
                    : 'var(--text-secondary)',
                  fontWeight: selectedParams.includes(param) ? '600' : '500'
                }}>
                  {param}
                </span>
              </label>
            ))}
          </div>
        </div>

        {selectedParams.length > 0 && (
          <>
            {/* Results Table Card */}
            <div className="modern-card" style={{ marginTop: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '2rem'
              }}>
                <FaTable style={{ color: 'var(--accent-purple)', fontSize: '1.5rem' }} />
                <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>
                  Tabela wyników
                </h3>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  minWidth: '600px',
                  background: 'var(--bg-glass)',
                  borderRadius: '12px',
                  overflow: 'hidden'
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
                        fontSize: '0.9rem',
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
                            fontSize: '0.9rem',
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
                          fontSize: '0.9rem',
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
                                fontSize: '0.9rem'
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

            {/* Chart Card */}
            <div className="modern-card" style={{ marginTop: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                marginBottom: '2rem'
              }}>
                <FaChartLine style={{ color: 'var(--accent-green)', fontSize: '1.5rem' }} />
                <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>
                  Wykres trendów
                </h3>
              </div>
              
              {chartData?.datasets?.length > 0 ? (
                <div style={{ 
                  height: '500px',
                  background: 'var(--bg-glass)',
                  borderRadius: '12px',
                  padding: '1rem'
                }}>
                  <Line
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          labels: {
                            color: 'var(--text-primary)',
                            font: {
                              family: 'Inter'
                            }
                          }
                        }
                      },
                      scales: {
                        x: {
                          type: 'time',
                          time: {
                            unit: 'month',
                            tooltipFormat: 'dd.MM.yyyy'
                          },
                          adapters: {
                            date: {
                              locale: pl
                            }
                          },
                          ticks: {
                            color: 'var(--text-secondary)'
                          },
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          }
                        },
                        y: {
                          beginAtZero: true,
                          ticks: {
                            color: 'var(--text-secondary)'
                          },
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <div className="modern-empty-state">
                  <FaChartLine className="modern-empty-icon" />
                  <h3 className="modern-empty-title">Brak danych do wyświetlenia</h3>
                  <p className="modern-empty-description">
                    Wybierz parametry powyżej aby zobaczyć wykres trendów
                  </p>
                </div>
              )}
              
              {!summary && (
                <button
                  className="modern-btn"
                  onClick={handleSummarize}
                  disabled={!parameters.length || isAnalyzing || selectedParams.length === 0}
                  style={{ marginTop: '2rem', width: '100%' }}
                >
                  {isAnalyzing ? (
                    <div className="modern-loading">
                      <div className="modern-spinner"></div>
                      Analizuję parametry...
                    </div>
                  ) : (
                    <>
                      <FaBrain />
                      Wygeneruj szczegółową analizę AI
                    </>
                  )}
                </button>
              )}
            </div>

            {/* AI Analysis Results */}
            {summary && (
              <div className="modern-card" style={{ marginTop: '2rem' }}>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginBottom: '2rem',
                  paddingBottom: '1rem',
                  borderBottom: '1px solid var(--border-color)'
                }}>
                  <FaBrain style={{ color: 'var(--accent-pink)', fontSize: '1.5rem' }} />
                  <h3 style={{ color: 'var(--text-primary)', margin: 0 }}>
                    Analiza AI Twoich wyników
                  </h3>
                </div>
                
                <div 
                  className="modern-analysis-content"
                  dangerouslySetInnerHTML={{ __html: summary }}
                  style={{
                    background: 'var(--bg-glass)',
                    borderRadius: '12px',
                    padding: '2rem'
                  }}
                />
              </div>
            )}
          </>
        )}

        {/* Empty state when no parameters */}
        {uniqueParams.length === 0 && (
          <div className="modern-card">
            <div className="modern-empty-state">
              <FaChartLine className="modern-empty-icon" />
              <h3 className="modern-empty-title">Brak parametrów do analizy</h3>
              <p className="modern-empty-description">
                Aby wyświetlić wykresy i analizy, najpierw prześlij i przeanalizuj swoje wyniki badań.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default WykresWynikow;
