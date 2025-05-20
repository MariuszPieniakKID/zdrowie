import React, { useRef } from 'react';
import { Line } from 'react-chartjs-2';
import { pl } from 'date-fns/locale';
import { FaHourglass } from 'react-icons/fa';
import { Chart as ChartJS, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';

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
      return { bg: '#f8d7da', arrow: '↑' };
    }

    // Czerwony, strzałka w dół
    if (
      analysisText.includes('poniżej progu alarmowego') ||
      analysisText.includes('poniżej norm') // Obejmuje "poniżej normy", "poniżej norm." itp.
    ) {
      return { bg: '#f8d7da', arrow: '↓' };
    }

    // Priorytet 2: Zielone tło dla wyników prawidłowych
    if (
      analysisText.includes('wartość pożądana') ||
      analysisText.includes('w normie') ||
      analysisText.includes('prawidłow') // Obejmuje "prawidłowy", "prawidłowa"
    ) {
      return { bg: '#d4edda', arrow: null };
    }

    // Domyślnie, jeśli żaden warunek nie pasuje
    return { bg: 'transparent', arrow: null };
  };

  return (
    <>
      {/* Sekcja wyboru parametrów */}
      <div style={{
        ...styles.chartContainer,
        marginBottom: 20,
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4>Wybierz parametry do wyświetlenia:</h4>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              style={{ ...styles.button, padding: '6px 12px' }}
              onClick={handleSelectAll}
            >
              Zaznacz wszystko
            </button>
            <button
              style={{ ...styles.button, padding: '6px 12px', backgroundColor: '#dc3545' }}
              onClick={handleDeselectAll}
            >
              Odznacz wszystko
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
          {[...new Set(parameters.map(p => p.parameter_name))].map(param => (
            <label key={param} style={styles.paramItem}>
              <input
                type="checkbox"
                checked={selectedParams.includes(param)}
                onChange={() => handleParamToggle(param)}
                style={{ marginRight: '8px' }}
              />
              {param}
            </label>
          ))}
        </div>
      </div>

      {/* Tabela wyników */}
      <div style={{
        ...styles.chartContainer,
        marginBottom: 20,
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px',
        overflowX: 'auto'
      }}>
        <h2>Tabela wyników</h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '15px',
          minWidth: '600px'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #dee2e6' }}>
              <th style={{
                width: '20%',
                padding: '10px',
                textAlign: 'left',
                position: 'sticky',
                left: 0,
                background: 'white',
                zIndex: 1,
                border: '1px solid #e0e0e0',
                fontSize: '0.8em'
              }}>Parametr</th>
              {uniqueDates.map(date => (
                <th
                  key={date}
                  style={{
                    padding: '10px',
                    textAlign: 'center',
                    minWidth: '120px',
                    border: '1px solid #e0e0e0',
                    fontSize: '0.95em'
                  }}
                >
                  Wynik z {date}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedData).map(([param, { values, units, analysis }]) => (
              <tr key={param}>
                <td style={{
                  width: '20%',
                  padding: '10px',
                  position: 'sticky',
                  left: 0,
                  background: 'white',
                  fontWeight: 500,
                  border: '1px solid #e0e0e0',
                  fontSize: '0.8em'
                }}>
                  {param} {units && `(${units})`}
                </td>
                {uniqueDates.map(date => {
                  const { bg, arrow } = getCellProps(analysis[date]);
                  return (
                    <td
                      key={date}
                      style={{
                        padding: '10px',
                        textAlign: 'center',
                        backgroundColor: bg,
                        color: bg === '#f8d7da' ? '#dc3545' : 'inherit',
                        fontWeight: 600,
                        border: '1px solid #e0e0e0'
                      }}
                    >
                      {values[date] || '-'}
                      {arrow && <span style={{ marginLeft: 5 }}>{arrow}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sekcja wykresu */}
      <div style={{
        ...styles.chartContainer,
        border: '2px solid #e0e0e0',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <h2>Wykres wyników</h2>
        {chartData?.datasets?.length > 0 ? (
          <div style={{ height: '500px' }}>
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
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
                    }
                  },
                  y: {
                    beginAtZero: true
                  }
                }
              }}
            />
          </div>
        ) : (
          <div>
            <p>Brak danych do wyświetlenia wykresu</p>
          </div>
        )}
        {!summary && (
          <button
            style={{ ...styles.button, marginTop: 20 }}
            onClick={handleSummarize}
            disabled={!parameters.length || isAnalyzing || selectedParams.length === 0}
          >
            {isAnalyzing ? (
              <>
                <FaHourglass className="spin-icon" style={{
                  marginRight: '8px',
                  animation: 'spin 1s linear infinite',
                  verticalAlign: 'middle'
                }} />
                Analizuję...
              </>
            ) : (
              'Analizuj wyniki'
            )}
          </button>
        )}
      </div>

      {/* Sekcja analizy */}
      {summary && (
        <div style={{
          ...styles.chartContainer,
          marginTop: 20,
          border: '2px solid #e0e0e0',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h2>Analiza</h2>
          <div
            style={{
              marginTop: 20,
              padding: 15,
              background: '#f8f9fa',
              borderRadius: 4
            }}
            dangerouslySetInnerHTML={{ __html: summary }}
          />
        </div>
      )}
    </>
  );
}

export default WykresWynikow;
