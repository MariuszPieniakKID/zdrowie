import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import WykresWynikow from './wykres';
import PrzeslaneBadania from './badania';
import WgrajPlik from './upload'; 
import EdytujProfil from './edit'; 
import Landing from './landing';
import './components.css';
import { FaSignOutAlt, FaUser, FaChartLine, FaFileAlt, FaHome, FaUpload, FaEye, FaMobileAlt, FaKey } from 'react-icons/fa';

Chart.register(...registerables);

function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [loginPhone, setLoginPhone] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [awaitingSmsCode, setAwaitingSmsCode] = useState(false);
  const [smsCodeId, setSmsCodeId] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [files, setFiles] = useState({
    documents: [],
    total: 0,
    page: 1,
    totalPages: 1
  });
  const [showLanding, setShowLanding] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);
  const [symptoms, setSymptoms] = useState('');
  const [chronicDiseases, setChronicDiseases] = useState('');
  const [medications, setMedications] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [parameters, setParameters] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(null);
  const [selectedParams, setSelectedParams] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const fetchFiles = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`https://zdrowie-backend.vercel.app/api/documents/${user.id}?page=${files.page}`);
      setFiles(res.data);
    } catch (err) {
      setError('Błąd pobierania plików');
    }
  }, [user, files.page]);

  const fetchParameters = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`https://zdrowie-backend.vercel.app/api/parameters/${user.id}`);
      setParameters(res.data);
      setSelectedParams(res.data.map(p => p.parameter_name));
    } catch (err) {
      setError('Błąd pobierania parametrów');
    }
  }, [user]);

  const generateChartData = useCallback(() => {
    const datasets = {};
    parameters.forEach(param => {
      if (!selectedParams.includes(param.parameter_name)) return;
      const key = param.parameter_name;
      if (!datasets[key]) {
        datasets[key] = {
          label: key,
          data: [],
          borderColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
          tension: 0.1
        };
      }
      let yVal = parseFloat(
        String(param.parameter_value)
          .replace(/[^0-9,.-]/g, '')
          .replace(/,/g, '.')
      );
      let xVal = new Date(param.measurement_date);
      if (!isNaN(xVal) && !isNaN(yVal)) {
        datasets[key].data.push({
          x: xVal,
          y: yVal
        });
      }
    });
    setChartData({
      labels: [],
      datasets: Object.values(datasets)
    });
  }, [selectedParams, parameters]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEditForm(parsedUser);
      setView('main');
      setShowLanding(false);
    }
  }, []);

  useEffect(() => {
    const checkExistingAnalysis = async () => {
      try {
        const res = await axios.get(`https://zdrowie-backend.vercel.app/api/documents/${user.id}`);
        if (res.data.documents.length > 0 && res.data.documents[0].analysis) {
          setSummary(res.data.documents[0].analysis);
        }
      } catch (err) {
        console.error('Błąd pobierania analizy:', err);
      }
    };
    if (user && user.id) {
      checkExistingAnalysis();
      fetchFiles();
      fetchParameters();
    }
  }, [user, files.page, fetchFiles, fetchParameters]);

  useEffect(() => {
    if (view === 'chart') {
      generateChartData();
    }
  }, [view, generateChartData]);

  const sanitizePhone = (phone) => phone.replace(/[\s-]/g, '');
  const isValidPhone = (phone) => /^(\+48)?\d{9}$/.test(sanitizePhone(phone));

  // STARY SYSTEM LOGOWANIA - ZAKOMENTOWANY
  /*
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidPhone(loginPhone)) {
      setError('Podaj poprawny numer telefonu');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('https://zdrowie-backend.vercel.app/api/login', { phone: sanitizePhone(loginPhone) });
      setUser(res.data.user);
      setEditForm(res.data.user);
      setView('main');
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // CZYSZCZENIE STANU
      setFiles({ documents: [], total: 0, page: 1, totalPages: 1 });
      setParameters([]);
      setSelectedParams([]);
      setChartData({ labels: [], datasets: [] });
      setSummary('');
      setAnalysis('');
      setSelectedDoc(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd logowania');
    } finally {
      setLoading(false);
    }
  };
  */

  // NOWY SYSTEM LOGOWANIA Z KODEM SMS
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendSmsCode = async (e) => {
    e.preventDefault();
    setError('');
    if (!isValidPhone(loginPhone)) {
      setError('Podaj poprawny numer telefonu');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('https://zdrowie-backend.vercel.app/api/send-sms-code', { 
        phone: sanitizePhone(loginPhone) 
      });
      setSmsCodeId(res.data.codeId);
      setAwaitingSmsCode(true);
      setResendTimer(60); // 60 sekund do ponownego wysłania
      setSmsCode('');
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd wysyłania kodu SMS');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySmsCode = async (e) => {
    e.preventDefault();
    setError('');
    if (!smsCode || smsCode.length !== 4) {
      setError('Podaj 4-cyfrowy kod SMS');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('https://zdrowie-backend.vercel.app/api/verify-sms-code', {
        phone: sanitizePhone(loginPhone),
        code: smsCode,
        codeId: smsCodeId
      });
      setUser(res.data.user);
      setEditForm(res.data.user);
      setView('main');
      localStorage.setItem('user', JSON.stringify(res.data.user));
      // CZYSZCZENIE STANU
      setFiles({ documents: [], total: 0, page: 1, totalPages: 1 });
      setParameters([]);
      setSelectedParams([]);
      setChartData({ labels: [], datasets: [] });
      setSummary('');
      setAnalysis('');
      setSelectedDoc(null);
      setError('');
      setAwaitingSmsCode(false);
      setSmsCodeId(null);
      setSmsCode('');
      setLoginPhone('');
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd weryfikacji kodu SMS');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setAwaitingSmsCode(false);
    setSmsCodeId(null);
    setSmsCode('');
    setResendTimer(0);
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (!registerForm.name || !registerForm.email || !registerForm.phone) {
      setError('Wypełnij wszystkie pola');
      return;
    }
    if (!isValidPhone(registerForm.phone)) {
      setError('Podaj poprawny numer telefonu');
      return;
    }
    setLoading(true);
    try {
      await axios.post('https://zdrowie-backend.vercel.app/api/register', { ...registerForm, phone: sanitizePhone(registerForm.phone) });
      setView('login');
      setRegisterForm({ name: '', email: '', phone: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd rejestracji');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setError('');
    if (!editForm.name || !editForm.email || !editForm.phone) {
      setError('Wypełnij wszystkie pola');
      return;
    }
    if (!isValidPhone(editForm.phone)) {
      setError('Podaj poprawny numer telefonu');
      return;
    }
    setLoading(true);
    try {
      await axios.put(`https://zdrowie-backend.vercel.app/api/user/${user.id}`, {
        ...editForm,
        phone: sanitizePhone(editForm.phone)
      });
      setUser(prev => ({ ...prev, ...editForm }));
      setView('main');
      localStorage.setItem('user', JSON.stringify({ ...user, ...editForm }));
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd edycji danych');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUserData = async () => {
    if (window.confirm('Czy na pewno chcesz usunąć wszystkie swoje dane? Ta operacja jest nieodwracalna.')) {
      setError('');
      setLoading(true);
      try {
        await axios.delete(`https://zdrowie-backend.vercel.app/api/user-data/${user.id}`);
        setFiles({ documents: [], total: 0, page: 1, totalPages: 1 });
        setParameters([]);
        setSelectedParams([]);
        setChartData({ labels: [], datasets: [] });
        setSummary('');
        setView('main');
        alert('Dane zostały pomyślnie usunięte');
      } catch (err) {
        setError(err.response?.data?.error || 'Błąd usuwania danych');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedFile) {
      setError('Wybierz plik PDF');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('pdf', selectedFile);
    formData.append('user_id', user.id);
    formData.append('symptoms', symptoms);
    formData.append('chronic_diseases', chronicDiseases);
    formData.append('medications', medications);

    try {
      await axios.post('https://zdrowie-backend.vercel.app/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      await fetchFiles();
      setSelectedFile(null);
      setSymptoms('');
      setChronicDiseases('');
      setMedications('');
      setView('files');
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd przesyłania pliku');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (doc) => {
    setError('');
    setLoadingAnalysis(doc.id);
    setSelectedDoc(doc);
    setAnalysis('');
    try {
      const res = await axios.post('https://zdrowie-backend.vercel.app/api/analyze-file', {
        document_id: doc.id,
        user_id: user.id
      });
      setAnalysis(res.data.analysis);
      await fetchParameters();
      await fetchFiles();
      setView('analysis');
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd analizy pliku');
    } finally {
      setLoadingAnalysis(null);
    }
  };

  const handleShowAnalysis = (doc) => {
    setSelectedDoc(doc);
    setAnalysis(doc.analysis);
    setView('analysis');
  };

  const handleDelete = async (docId) => {
    setError('');
    setLoading(true);
    try {
      await axios.delete(`https://zdrowie-backend.vercel.app/api/document/${docId}`);
      await fetchFiles();
      await fetchParameters();
      setSelectedDoc(null);
      setAnalysis('');
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd usuwania pliku');
    } finally {
      setLoading(false);
    }
  };

  const handleParamToggle = (paramName) => {
    setSelectedParams(prev =>
      prev.includes(paramName)
        ? prev.filter(p => p !== paramName)
        : [...prev, paramName]
    );
  };

  const handleSelectAll = () => {
    const allParams = [...new Set(parameters.map(p => p.parameter_name))];
    setSelectedParams(allParams);
  };

  const handleDeselectAll = () => {
    setSelectedParams([]);
  };

  const handleSummarize = async () => {
    setError('');
    setIsAnalyzing(true);
    try {
      const res = await axios.post('https://zdrowie-backend.vercel.app/api/summarize', {
        userId: user.id,
        parameters: parameters.filter(p => selectedParams.includes(p.parameter_name))
      });
      setSummary(res.data.summary);
    } catch (err) {
      setError(err.response?.data?.error || 'Błąd generowania analizy');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleLogout = () => {
    setUser(null);
    setShowLanding(true);
    localStorage.removeItem('user');
    setFiles({ documents: [], total: 0, page: 1, totalPages: 1 });
    setParameters([]);
    setSelectedParams([]);
    setChartData({ labels: [], datasets: [] });
    setSummary('');
    setAnalysis('');
    setSelectedDoc(null);
    setError('');
    // Reset SMS login states
    setLoginPhone('');
    setSmsCode('');
    setAwaitingSmsCode(false);
    setSmsCodeId(null);
    setResendTimer(0);
    window.location.reload();
  };

  // Modern Landing Page
  if (showLanding && !user) {
    return (
      <Landing
        onLoginClick={() => setShowLanding(false)}
        onRegisterClick={() => {
          setShowLanding(false);
          setView('register');
        }}
      />
    );
  }

  // Modern Login Page
  if (view === 'login') {
    return (
      <div className="modern-container">
        <div className="bg-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          padding: '2rem'
        }}>
          <div className="modern-card" style={{ maxWidth: '400px', width: '100%' }}>
            {!awaitingSmsCode ? (
              <>
                <div className="modern-page-header" style={{ marginBottom: '2rem' }}>
                  <h2 className="modern-page-title" style={{ fontSize: '2rem' }}>
                    Logowanie
                  </h2>
                  <p className="modern-page-subtitle">
                    Podaj numer telefonu aby otrzymać kod SMS
                  </p>
                </div>
                
                <form onSubmit={handleSendSmsCode} className="modern-form">
                  <div className="modern-form-group">
                    <label className="modern-label">
                      <FaMobileAlt style={{ marginRight: '0.5rem', color: 'var(--accent-blue)' }} />
                      Numer telefonu
                    </label>
                    <input
                      type="text"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      placeholder="123456789"
                      className="modern-input"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="modern-btn"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="modern-loading">
                        <div className="modern-spinner"></div>
                        Wysyłanie kodu SMS...
                      </div>
                    ) : (
                      <>
                        <FaMobileAlt />
                        Wyślij kod SMS
                      </>
                    )}
                  </button>
                  
                  <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      Nie masz konta?{' '}
                    </span>
                    <button
                      type="button"
                      onClick={() => setView('register')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-blue)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                      }}
                    >
                      Zarejestruj się
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="modern-page-header" style={{ marginBottom: '2rem' }}>
                  <h2 className="modern-page-title" style={{ fontSize: '2rem' }}>
                    Wprowadź kod SMS
                  </h2>
                  <p className="modern-page-subtitle">
                    Kod został wysłany na numer: {loginPhone}
                  </p>
                </div>
                
                <form onSubmit={handleVerifySmsCode} className="modern-form">
                  <div className="modern-form-group">
                    <label className="modern-label">
                      <FaKey style={{ marginRight: '0.5rem', color: 'var(--accent-green)' }} />
                      Kod SMS (4 cyfry)
                    </label>
                    <input
                      type="text"
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
                      placeholder="0000"
                      className="modern-input"
                      style={{ 
                        textAlign: 'center', 
                        fontSize: '1.5rem', 
                        letterSpacing: '0.5rem',
                        fontWeight: 'bold'
                      }}
                      maxLength="4"
                      required
                      disabled={loading}
                      autoFocus
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="modern-btn"
                    disabled={loading || smsCode.length !== 4}
                  >
                    {loading ? (
                      <div className="modern-loading">
                        <div className="modern-spinner"></div>
                        Weryfikacja...
                      </div>
                    ) : (
                      <>
                        <FaKey />
                        Zaloguj się
                      </>
                    )}
                  </button>
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginTop: '1rem',
                    fontSize: '0.875rem'
                  }}>
                    <button
                      type="button"
                      onClick={handleBackToPhone}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      ← Zmień numer
                    </button>
                    
                    {resendTimer > 0 ? (
                      <span style={{ color: 'var(--text-muted)' }}>
                        Wyślij ponownie za {resendTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendSmsCode}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--accent-blue)',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                        }}
                        disabled={loading}
                      >
                        Wyślij ponownie
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
            
            {error && <div className="modern-error">{error}</div>}
          </div>
        </div>
      </div>
    );
  }

  // Modern Register Page
  if (view === 'register') {
    return (
      <div className="modern-container">
        <div className="bg-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>

        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          padding: '2rem'
        }}>
          <div className="modern-card" style={{ maxWidth: '400px', width: '100%' }}>
            <div className="modern-page-header" style={{ marginBottom: '2rem' }}>
              <h2 className="modern-page-title" style={{ fontSize: '2rem' }}>
                Rejestracja
              </h2>
              <p className="modern-page-subtitle">
                Stwórz nowe konto w systemie medycznym
              </p>
            </div>
            
            <form onSubmit={handleRegister} className="modern-form">
              <div className="modern-form-group">
                <label className="modern-label">
                  <FaUser style={{ marginRight: '0.5rem', color: 'var(--accent-blue)' }} />
                  Imię i nazwisko
                </label>
                <input
                  type="text"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                  placeholder="Jan Kowalski"
                  className="modern-input"
                  required
                />
              </div>
              
              <div className="modern-form-group">
                <label className="modern-label">
                  <FaUser style={{ marginRight: '0.5rem', color: 'var(--accent-green)' }} />
                  Email
                </label>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  placeholder="jan@example.com"
                  className="modern-input"
                  required
                />
              </div>
              
              <div className="modern-form-group">
                <label className="modern-label">
                  <FaUser style={{ marginRight: '0.5rem', color: 'var(--accent-orange)' }} />
                  Numer telefonu
                </label>
                <input
                  type="text"
                  value={registerForm.phone}
                  onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                  placeholder="123456789"
                  className="modern-input"
                  required
                />
              </div>
              
              <button 
                type="submit" 
                className="modern-btn"
                disabled={loading}
              >
                {loading ? (
                  <div className="modern-loading">
                    <div className="modern-spinner"></div>
                    Rejestracja...
                  </div>
                ) : (
                  <>
                    <FaUser />
                    Zarejestruj się
                  </>
                )}
              </button>
              
              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  Masz już konto?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => setView('login')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--accent-blue)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                  }}
                >
                  Zaloguj się
                </button>
              </div>
            </form>
            
            {error && <div className="modern-error">{error}</div>}
          </div>
        </div>
      </div>
    );
  }

  // Modern Main Application
  return (
    <div className="modern-container">
      <div className="bg-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>

      {/* Modern Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--bg-glass)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem 2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'var(--primary-gradient)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.25rem'
            }}>
              <FaUser />
            </div>
            <div>
              <h1 style={{
                color: 'var(--text-primary)',
                fontSize: '1.125rem',
                fontWeight: '600',
                margin: 0
              }}>
                Witaj, {user?.name || 'Użytkowniku'}
              </h1>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: '0.875rem',
                margin: 0
              }}>
                Panel medyczny
              </p>
            </div>
          </div>

          <button 
            onClick={handleLogout} 
            className="modern-btn modern-btn-danger modern-btn-small"
          >
            <FaSignOutAlt />
            Wyloguj
          </button>
        </div>
      </header>

      <div style={{
        display: 'flex',
        maxWidth: '1400px',
        margin: '0 auto',
        minHeight: 'calc(100vh - 80px)'
      }}>
        {/* Modern Sidebar */}
        <nav style={{
          width: '280px',
          padding: '2rem',
          background: 'var(--bg-glass)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid var(--border-color)',
          height: 'fit-content',
          position: 'sticky',
          top: '100px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              onClick={() => setView('main')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                background: view === 'main' ? 'var(--accent-blue)' : 'transparent',
                color: view === 'main' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: '500',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <FaHome />
              Strona główna
            </button>
            
            <button
              onClick={() => setView('chart')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                background: view === 'chart' ? 'var(--accent-blue)' : 'transparent',
                color: view === 'chart' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: '500',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <FaChartLine />
              Podsumowanie badań
            </button>
            
            <button
              onClick={() => setView('files')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                background: view === 'files' ? 'var(--accent-blue)' : 'transparent',
                color: view === 'files' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: '500',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <FaFileAlt />
              Przesłane badania
            </button>
            
            <button
              onClick={() => setView('upload')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                background: view === 'upload' ? 'var(--accent-blue)' : 'transparent',
                color: view === 'upload' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: '500',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <FaUpload />
              Wgraj nowy plik
            </button>
            
            <button
              onClick={() => setView('edit')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1rem',
                background: view === 'edit' ? 'var(--accent-blue)' : 'transparent',
                color: view === 'edit' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '0.875rem',
                fontWeight: '500',
                width: '100%',
                textAlign: 'left'
              }}
            >
              <FaUser />
              Edytuj profil
            </button>
          </div>
        </nav>
        
        {/* Modern Content Area */}
        <main style={{ flex: 1, padding: '2rem' }}>
          {view === 'main' && (
            <div className="modern-card">
              <div className="modern-page-header">
                <h1 className="modern-page-title">
                  Panel główny
                </h1>
                <p className="modern-page-subtitle">
                  Witaj w aplikacji AI analizującej Twoje wyniki badań medycznych. 
                  Wgraj swoje wyniki w formacie PDF, a sztuczna inteligencja automatycznie je przeanalizuje.
                </p>
              </div>
              
              {summary && (
                <div className="modern-card modern-card-small" style={{ marginTop: '2rem' }}>
                  <h3 style={{
                    color: 'var(--text-primary)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <FaEye style={{ color: 'var(--accent-green)' }} />
                    Twoja ostatnia analiza
                  </h3>
                  <div 
                    className="modern-analysis-content"
                    dangerouslySetInnerHTML={{ __html: summary }} 
                  />
                </div>
              )}
              
              {error && <div className="modern-error">{error}</div>}
            </div>
          )}
          
          {view === 'analysis' && selectedDoc && (
            <div className="modern-card">
              <div className="modern-page-header">
                <h1 className="modern-page-title">
                  Analiza badania
                </h1>
                <p className="modern-page-subtitle">
                  Szczegółowa analiza pliku: {selectedDoc.filename}
                </p>
              </div>
              
              <div 
                className="modern-analysis-content"
                dangerouslySetInnerHTML={{ __html: analysis }} 
                style={{
                  background: 'var(--bg-glass)',
                  borderRadius: '12px',
                  padding: '2rem',
                  marginBottom: '2rem'
                }}
              />
              
              <button
                onClick={() => setView('files')}
                className="modern-btn modern-btn-secondary"
              >
                ← Powrót do badań
              </button>
              
              {error && <div className="modern-error">{error}</div>}
            </div>
          )}
          
          {view === 'chart' && (
            <WykresWynikow
              parameters={parameters}
              selectedParams={selectedParams}
              chartData={chartData}
              handleParamToggle={handleParamToggle}
              handleSummarize={handleSummarize}
              summary={summary}
              isAnalyzing={isAnalyzing}
              handleSelectAll={handleSelectAll}
              handleDeselectAll={handleDeselectAll}
            />
          )}
          
          {view === 'files' && (
            <PrzeslaneBadania 
              files={files}
              loadingAnalysis={loadingAnalysis}
              handleAnalyze={handleAnalyze}
              handleShowAnalysis={handleShowAnalysis}
              handleDelete={handleDelete}
              formatDate={formatDate}
              setFiles={setFiles}
            />
          )}
          
          {view === 'upload' && (
            <WgrajPlik
              handleFileUpload={handleFileUpload}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              symptoms={symptoms}
              setSymptoms={setSymptoms}
              chronicDiseases={chronicDiseases}
              setChronicDiseases={setChronicDiseases}
              medications={medications}
              setMedications={setMedications}
              loading={loading}
            />
          )}
          
          {view === 'edit' && (
            <EdytujProfil
              editForm={editForm}
              setEditForm={setEditForm}
              handleEdit={handleEdit}
              handleDeleteUserData={handleDeleteUserData}
              setView={setView}
              loading={loading}
              error={error}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;