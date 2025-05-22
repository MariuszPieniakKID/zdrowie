import React from 'react';
import './landing.css';

function Landing({ onLoginClick }) {
  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <span className="nav-item">Firma</span>
          <span className="nav-item">Zespół</span>
          <span className="nav-item">Cennik</span>
          <span className="nav-item" onClick={onLoginClick} style={{ cursor: 'pointer' }}>Zaloguj</span>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>Twoje zdrowie.<br />Nasza analiza.</h1>
          <p>Zaawansowana analiza wyników, dostępna zawsze dla Ciebie i lekarza.</p>
          <div className="button-group">
            <button className="primary-button">Primary Action</button>
            <button className="secondary-button">Secondary Action</button>
          </div>
        </div>
        <div className="hero-image">
          <div className="stats-box">
            <div className="stat">
              <h3>250+</h3>
              <p>analizowanych parametrów</p>
            </div>
            <div className="placeholder-image"></div>
            <div className="stat">
              <h3>67%</h3>
              <p>dokładniejszych diagnoz</p>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <h2>Jak to działa?</h2>
        <p>Krótki opis procesu AI do analizy wyników badań. Znajdź swoje rozwiązanie dzięki sztucznej inteligencji, która bazuje na wiedzy Twoich lekarzy. Niski, wysoki, Twój - historia pokazuje.</p>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>Zleć badania</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔬</div>
            <h3>Prześlij wyniki</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Otrzymaj analizę</h3>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </div>
        </div>
      </section>

      <section className="ai-analysis">
        <h2>Jak wygląda analiza AI?</h2>
        <p>Krótki opis procesu AI do analizy wyników badań. Znajdź swoje rozwiązanie dzięki sztucznej inteligencji, która bazuje na wiedzy Twoich lekarzy.</p>
        <div className="analysis-grid">
          <div className="analysis-card">
            <h3>Historia wyników</h3>
            <div className="history-chart">
              <div className="chart-row">
                <span>Badanie</span>
                <span>Wynik</span>
              </div>
              <div className="chart-row">
                <span>Glukoza</span>
                <span>95 mg/dl</span>
              </div>
              <div className="chart-row">
                <span>Cholesterol</span>
                <span>175 mg/dl</span>
              </div>
              <div className="chart-line-graph"></div>
            </div>
          </div>
          <div className="analysis-card">
            <h3>Analiza wyników AI</h3>
            <div className="ai-analysis-content">
              <div className="ai-section">
                <h4>Hemoglobina</h4>
                <p>Twój wynik hemoglobiny wynosi 14,2 g/dl, co mieści się w normie referencyjnej określonej przez lekarzy dla Twojej płci i wieku (13-18 g/dl).</p>
              </div>
              <div className="ai-section">
                <h4>Płytki</h4>
                <p>Poziom płytek krwi jest w normie (350 tys./μl), co świadczy o prawidłowej funkcji płytkowej organizmu. Płytki krwi odpowiadają za krzepnięcie krwi i zapobieganie krwawieniom.</p>
              </div>
              <div className="ai-section">
                <h4>Komentarz AI</h4>
                <p>Wyniki Twoich badań krwi (HGB 14,2 g/dl, PLT 350 tys./μl) są prawidłowe i świadczą o dobrym stanie zdrowia w zakresie funkcjonowania elementów morfotycznych krwi. Wartości mieszczą się w przedziałach referencyjnych dla Twojego wieku i płci.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="care-options">
        <h2>Wybierz, jak mamy się o Ciebie troszczyć</h2>
        <p>Krótki opis dostępnych opcji opieki zdrowotnej. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <div className="care-grid">
          <div className="care-card">
            <div className="care-image"></div>
            <h3>Podstawowa opieka</h3>
            <p>Poznaj pełną charakterystykę dla wybranej kategorii usług</p>
            <button className="outline-button">Sprawdź Plan</button>
          </div>
          <div className="care-card">
            <div className="care-image"></div>
            <h3>Pakiety</h3>
            <p>Poznaj pełną charakterystykę dla wybranej kategorii usług</p>
            <button className="outline-button">Sprawdź Plan</button>
          </div>
          <div className="care-card">
            <div className="care-image"></div>
            <h3>Abonament</h3>
            <p>Poznaj pełną charakterystykę dla wybranej kategorii usług</p>
            <button className="outline-button">Sprawdź Plan</button>
          </div>
        </div>
      </section>

      <section className="parameters">
        <h2>Parametry krwi - klucz do Twojego zdrowia</h2>
        <p>Krótki opis znaczenia parametrów krwi dla zdrowia. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
        <div className="parameters-grid">
          <div className="parameter-card">
            <div className="parameter-icon">🔬</div>
            <h3>Badania ogólne</h3>
            <ul className="parameter-list">
              <li>Hemoglobina (HGB)</li>
              <li>Erytrocyty (RBC)</li>
              <li>Leukocyty (WBC)</li>
              <li>Płytki krwi (PLT)</li>
              <li>Hematokryt (HCT)</li>
            </ul>
            <span className="test-count">7-10 testów</span>
          </div>
          <div className="parameter-card">
            <div className="parameter-icon">🧪</div>
            <h3>Badania biochemiczne</h3>
            <ul className="parameter-list">
              <li>Cholesterol (1-7)</li>
              <li>Glukoza</li>
              <li>Kwas moczowy (UA)</li>
              <li>Enzymy wątrobowe (ALT, AST)</li>
              <li>Bilirubina</li>
            </ul>
            <span className="test-count">7-12 testów</span>
          </div>
          <div className="parameter-card">
            <div className="parameter-icon">🧬</div>
            <h3>Badania hormonalne</h3>
            <ul className="parameter-list">
              <li>TSH</li>
              <li>FT3</li>
              <li>FT4</li>
              <li>Estrogeny</li>
              <li>Testosteron</li>
            </ul>
            <span className="test-count">5-8 testów</span>
          </div>
          <div className="parameter-card">
            <div className="parameter-icon">⚗️</div>
            <h3>Badania metaboliczne</h3>
            <ul className="parameter-list">
              <li>HbA1c</li>
              <li>CRP</li>
              <li>Lipidogram</li>
              <li>Insulina</li>
              <li>Leptyna</li>
            </ul>
            <span className="test-count">7-10 testów</span>
          </div>
        </div>
        <div className="center-button">
          <button className="primary-button">Sprawdź Test</button>
        </div>
      </section>

      <section className="stats-section">
        <h2>Bibendum amet at molestie mattis.</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Bibendum amet at molestie mattis. Consectetur in mattis lacus, ullamcorper ac. Nunc, amet, aliquot vulputate nullam facilisis pulvinar. Elementum scelerisque sit consequat non vel. Mattis leo lecturus aliquot ipsum fusce lectus.</p>
        <div className="stats-container">
          <div className="stats-box-large">
            <div className="stat">
              <h3>123</h3>
              <p>Consectetur dolor sit</p>
            </div>
            <div className="placeholder-image-large"></div>
            <div className="stat">
              <h3>67%</h3>
              <p>Bibendum amet at</p>
            </div>
            <div className="stat">
              <h3>+274</h3>
              <p>Consectetur dolor sit</p>
            </div>
            <div className="stat">
              <h3>+257</h3>
              <p>Consectetur dolor sit</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Lorem ipsum dolor sit amet, consectetur adipiscing elit.<br />Bibendum amet at molestie mattis.</h2>
        <div className="cta-grid">
          <div className="cta-item">
            <p>Curabitur elit id consectetur et leo vulputate nulla hendrerit.</p>
          </div>
          <div className="cta-item">
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco.</p>
          </div>
          <div className="cta-item">
            <p>Nunc, pellentesque amet consectetur non massa arcu.</p>
          </div>
          <div className="cta-item">
            <p>Curabitur justo pellentesque et in nisi et amet. Nunc nulla.</p>
          </div>
        </div>
        <div className="center-button">
          <button className="primary-button">Zacznij teraz</button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-logo">
          <span>🏥</span>
        </div>
        <div className="footer-columns">
          <div className="footer-column">
            <h4>Column One</h4>
            <ul>
              <li>First Item</li>
              <li>Second Item</li>
              <li>Third Item</li>
              <li>Fourth Item</li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Column Two</h4>
            <ul>
              <li>First Item</li>
              <li>Second Item</li>
              <li>Third Item</li>
              <li>Fourth Item</li>
              <li>Fifth Item</li>
            </ul>
          </div>
          <div className="footer-column">
            <h4>Column Three</h4>
            <ul>
              <li>First Item</li>
              <li>Second Item</li>
              <li>Third Item</li>
              <li>Fourth Item</li>
              <li>Fifth Item</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© Copyright 2025. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Cookies</a>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
