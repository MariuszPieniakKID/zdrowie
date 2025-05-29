import React from 'react';
import './landing.css';
import { FaRocket, FaChartLine, FaBrain, FaShieldAlt, FaUsers, FaClock, FaHeart, FaFlask, FaMicroscope, FaDna } from 'react-icons/fa';

function Landing({ onLoginClick, onRegisterClick }) {
  return (
    <div className="modern-app">
      {/* Animated background */}
      <div className="animated-bg">
        <div className="bg-particle"></div>
        <div className="bg-particle"></div>
        <div className="bg-particle"></div>
        <div className="bg-particle"></div>
        <div className="bg-particle"></div>
      </div>

      {/* Modern Header */}
      <header className="modern-header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo-icon">
              <FaHeart className="pulse-animation" />
            </div>
            <span className="logo-text">MedAnalyzer</span>
          </div>
          <nav className="nav-links">
            <a href="#features" className="nav-link">Funkcje</a>
            <a href="#how-it-works" className="nav-link">Jak działa</a>
            <a href="#pricing" className="nav-link">Cennik</a>
          </nav>
          <div className="auth-buttons">
            <button className="ghost-btn" onClick={onLoginClick}>
              Zaloguj się
            </button>
            <button className="gradient-btn" onClick={onRegisterClick}>
              Rozpocznij analizę
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="modern-hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge">
              <FaBrain className="badge-icon" />
              <span>Zaawansowana analiza AI</span>
            </div>
            <h1 className="hero-title">
              Twoje wyniki badań,
              <span className="gradient-text"> nasza inteligencja</span>
            </h1>
            <p className="hero-description">
              Przeanalizuj wyniki badań medycznych w sekundach dzięki zaawansowanej sztucznej inteligencji. 
              Otrzymaj precyzyjne interpretacje, wykryj trendy i zadbaj o swoje zdrowie świadomie.
            </p>
            <div className="hero-actions">
              <button className="cta-primary" onClick={onRegisterClick}>
                <FaRocket />
                Zacznij analizę za darmo
              </button>
              <button className="cta-secondary">
                <FaChartLine />
                Zobacz przykład analizy
              </button>
            </div>
            <div className="trust-indicators">
              <div className="trust-item">
                <FaShieldAlt />
                <span>100% bezpieczne</span>
              </div>
              <div className="trust-item">
                <FaUsers />
                <span>5000+ użytkowników</span>
              </div>
              <div className="trust-item">
                <FaClock />
                <span>Wyniki w 30 sekund</span>
              </div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card main-card">
              <div className="card-header">
                <div className="status-indicator active"></div>
                <span>Analiza w toku</span>
                <div className="progress-ring">
                  <svg className="progress-svg">
                    <circle cx="20" cy="20" r="18" className="progress-circle"></circle>
                  </svg>
                  <span className="progress-text">87%</span>
                </div>
              </div>
              <div className="card-content">
                <div className="analysis-row">
                  <span className="param-name">Hemoglobina</span>
                  <span className="param-value normal">14.2 g/dl</span>
                  <div className="param-status good">✓</div>
                </div>
                <div className="analysis-row">
                  <span className="param-name">Cholesterol</span>
                  <span className="param-value warning">220 mg/dl</span>
                  <div className="param-status warning">⚠</div>
                </div>
                <div className="analysis-row">
                  <span className="param-name">Glukoza</span>
                  <span className="param-value normal">95 mg/dl</span>
                  <div className="param-status good">✓</div>
                </div>
              </div>
            </div>
            <div className="floating-card stats-card">
              <h4>Twoje trendy</h4>
              <div className="mini-chart">
                <div className="chart-bars">
                  <div className="bar" style={{height: '60%'}}></div>
                  <div className="bar" style={{height: '80%'}}></div>
                  <div className="bar" style={{height: '45%'}}></div>
                  <div className="bar active" style={{height: '90%'}}></div>
                </div>
              </div>
              <span className="trend-text">↗ Poprawa o 15%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Dlaczego warto wybrać naszą platformę?</h2>
            <p>Nowoczesne narzędzia analityczne wsparte sztuczną inteligencją</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon gradient-bg">
                <FaBrain />
              </div>
              <h3>Analiza AI w czasie rzeczywistym</h3>
              <p>Zaawansowane algorytmy uczenia maszynowego analizują Twoje wyniki natychmiast, wykrywając nieprawidłowości i trendy zdrowotne.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon gradient-bg">
                <FaChartLine />
              </div>
              <h3>Interaktywne wykresy i trendy</h3>
              <p>Wizualizacja zmian w czasie z możliwością porównywania parametrów i śledzenia postępów w leczeniu.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon gradient-bg">
                <FaShieldAlt />
              </div>
              <h3>Bezpieczeństwo danych</h3>
              <p>Pełne szyfrowanie end-to-end i zgodność z RODO. Twoje dane medyczne są chronione najwyższymi standardami.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon gradient-bg">
                <FaFlask />
              </div>
              <h3>Rozpoznawanie wszystkich formatów</h3>
              <p>Automatyczne rozpoznawanie PDF-ów, obrazów i skanów wyników. Obsługa laboratoriów z całej Polski.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon gradient-bg">
                <FaMicroscope />
              </div>
              <h3>Precyzyjne interpretacje</h3>
              <p>Szczegółowe wyjaśnienia każdego parametru z uwzględnieniem Twojego wieku, płci i historii medycznej.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon gradient-bg">
                <FaDna />
              </div>
              <h3>Predykcje zdrowotne</h3>
              <p>Analiza predykcyjna ostrzegająca przed potencjalnymi problemami zdrowotnymi na podstawie trendów.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="how-it-works">
        <div className="container">
          <div className="section-header">
            <h2>Jak to działa?</h2>
            <p>Prosty proces w trzech krokach do pełnej analizy</p>
          </div>
          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">
                <FaFlask />
              </div>
              <h3>Prześlij wyniki</h3>
              <p>Wgraj plik PDF lub zdjęcie swoich wyników badań. Obsługujemy wszystkie popularne laboratoria w Polsce.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">
                <FaBrain />
              </div>
              <h3>AI analizuje dane</h3>
              <p>Nasza sztuczna inteligencja przetwarza wyniki w czasie rzeczywistym, porównując z normami i Twoją historią.</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">
                <FaChartLine />
              </div>
              <h3>Otrzymaj raporty</h3>
              <p>Otrzymuj szczegółowe raporty, trendy czasowe i rekomendacje dotyczące Twojego zdrowia.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing-section">
        <div className="container">
          <div className="section-header">
            <h2>Wybierz plan dla siebie</h2>
            <p>Elastyczne opcje dostosowane do Twoich potrzeb</p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="plan-header">
                <h3>Podstawowy</h3>
                <div className="price">
                  <span className="currency">Darmowy</span>
                </div>
                <p>Idealna do sporadycznego korzystania</p>
              </div>
              <ul className="features-list">
                <li>✓ 3 analizy miesięcznie</li>
                <li>✓ Podstawowe wykresy</li>
                <li>✓ Analiza AI</li>
                <li>✓ Bezpieczne przechowywanie</li>
              </ul>
              <button className="plan-btn basic" onClick={onRegisterClick}>Rozpocznij za darmo</button>
            </div>
            <div className="pricing-card featured">
              <div className="popular-badge">Najpopularniejszy</div>
              <div className="plan-header">
                <h3>Pro</h3>
                <div className="price">
                  <span className="amount">29</span>
                  <span className="currency">zł/mies</span>
                </div>
                <p>Dla osób dbających o zdrowie</p>
              </div>
              <ul className="features-list">
                <li>✓ Nielimitowane analizy</li>
                <li>✓ Zaawansowane wykresy</li>
                <li>✓ Predykcje zdrowotne</li>
                <li>✓ Eksport raportów PDF</li>
                <li>✓ Powiadomienia o trendach</li>
                <li>✓ Wsparcie priorytetowe</li>
              </ul>
              <button className="plan-btn pro" onClick={onRegisterClick}>Wypróbuj 14 dni za darmo</button>
            </div>
            <div className="pricing-card">
              <div className="plan-header">
                <h3>Enterprise</h3>
                <div className="price">
                  <span className="currency">Skontaktuj się</span>
                </div>
                <p>Dla klinik i placówek medycznych</p>
              </div>
              <ul className="features-list">
                <li>✓ Wszystko z planu Pro</li>
                <li>✓ API dostęp</li>
                <li>✓ Niestandardowe integracje</li>
                <li>✓ Dedykowany manager</li>
                <li>✓ SLA 99.9%</li>
              </ul>
              <button className="plan-btn enterprise">Skontaktuj się</button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Dokładność analizy</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">5000+</div>
              <div className="stat-label">Użytkowników</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50k+</div>
              <div className="stat-label">Przeanalizowanych wyników</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">30s</div>
              <div className="stat-label">Średni czas analizy</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Gotowy na inteligentną analizę zdrowia?</h2>
            <p>Dołącz do tysięcy użytkowników, którzy już korzystają z naszej platformy</p>
            <div className="cta-buttons">
              <button className="cta-primary large" onClick={onRegisterClick}>
                <FaRocket />
                Rozpocznij analizę teraz
              </button>
              <button className="cta-secondary large" onClick={onLoginClick}>
                Mam już konto
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="modern-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div className="footer-logo">
                <FaHeart />
                <span>MedAnalyzer</span>
              </div>
              <p>Nowoczesna platforma analizy wyników badań medycznych wykorzystująca sztuczną inteligencję.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Produkt</h4>
                <ul>
                  <li><a href="#features">Funkcje</a></li>
                  <li><a href="#pricing">Cennik</a></li>
                  <li><a href="#">API</a></li>
                  <li><a href="#">Bezpieczeństwo</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Firma</h4>
                <ul>
                  <li><a href="#">O nas</a></li>
                  <li><a href="#">Kariera</a></li>
                  <li><a href="#">Blog</a></li>
                  <li><a href="#">Kontakt</a></li>
                </ul>
              </div>
              <div className="footer-column">
                <h4>Pomoc</h4>
                <ul>
                  <li><a href="#">Dokumentacja</a></li>
                  <li><a href="#">Wsparcie</a></li>
                  <li><a href="#">Status</a></li>
                  <li><a href="#">FAQ</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-bottom-content">
              <p>&copy; 2025 MedAnalyzer. Wszystkie prawa zastrzeżone.</p>
              <div className="footer-legal">
                <a href="#">Polityka prywatności</a>
                <a href="#">Regulamin</a>
                <a href="#">RODO</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
