import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { pl } from 'date-fns/locale';
import WykresWynikow from './wykres';
import PrzeslaneBadania from './badania'; //import logger from './logger';
import WgrajPlik from './upload'; 
import EdytujProfil from './edit'; 

//import logger from './logger';
import { FaSignOutAlt, FaUser, FaChartLine, FaFileAlt, FaHome, FaUpload } from 'react-icons/fa';

Chart.register(...registerables);

function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  const [loginPhone, setLoginPhone] = useState('');
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
  useEffect(() => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setEditForm(parsedUser);
    setView('main');
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
}, [user, files.page]);


  useEffect(() => {
    if (view === 'chart') {
      generateChartData();
    }
  }, [selectedParams, parameters, view]);

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`https://zdrowie-backend.vercel.app/api/documents/${user.id}?page=${files.page}`);
      setFiles(res.data);
    } catch (err) {
      setError('Błąd pobierania plików');
    }
  };

  const fetchParameters = async () => {
    try {
      const res = await axios.get(`https://zdrowie-backend.vercel.app/api/parameters/${user.id}`);
      setParameters(res.data);
      setSelectedParams(res.data.map(p => p.parameter_name));
    } catch (err) {
      setError('Błąd pobierania parametrów');
    }
  };

  const sanitizePhone = (phone) => phone.replace(/[\s-]/g, '');
  const isValidPhone = (phone) => /^(\+48)?\d{9}$/.test(sanitizePhone(phone));

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
      setError('WypeĹnij wszystkie pola');
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
  if (window.confirm('Czy na pewno chcesz Usunąć wszystkie swoje dane? Ta operacja jest nieodwracalna.')) {
    setError('');
    setLoading(true);
    try {
      await axios.delete(`https://zdrowie-backend.vercel.app/api/user-data/${user.id}`);
      // OdĹwieĹźamy dane po usuniÄciu
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
      setView('files'); // PrzejĹcie do sekcji "PrzesĹane badania" po wgraniu pliku

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
      setError(err.response?.data?.error || 'Błąda analizy pliku');
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

  const generateChartData = () => {
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
  setView('login');
  localStorage.removeItem('user');
  setFiles({ documents: [], total: 0, page: 1, totalPages: 1 });
  setParameters([]);
  setSelectedParams([]);
  setChartData({ labels: [], datasets: [] });
  setSummary('');
  setAnalysis('');
  setSelectedDoc(null);
  setError('');
};


  const styles = {
    layout: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    appContainer: {
      display: 'flex',
      flexDirection: 'row',
      flex: 1,
      '@media (max-width: 768px)': {
        flexDirection: 'column',
      }
    },
    sidebar: {
      width: '280px',
      padding: '20px',
      backgroundColor: '#f0f2f5',
      borderRight: '1px solid #e5e7eb',
      transition: 'all 0.3s ease',
      overflow: 'auto',
      height: '100vh',
      position: 'sticky',
      top: 0,
      '@media (max-width: 768px)': {
        width: '100%',
        height: 'auto',
        position: 'relative',
        borderRight: 'none',
        borderBottom: '1px solid #e5e7eb',
      }
    },
    content: {
      flex: 1,
      padding: '30px',
      backgroundColor: '#ffffff',
      borderRadius: '16px',
      margin: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      overflow: 'auto',
      '@media (max-width: 768px)': {
        margin: '10px',
        padding: '20px',
      }
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '15px 20px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
    },
    headerTitle: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: '18px',
      fontWeight: '600',
      color: '#111827',
    },
    headerActions: {
      display: 'flex',
      gap: '15px',
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      margin: '20px 0',
      maxWidth: '400px',
      width: '100%',
    },
    input: {
      padding: '12px 16px',
      borderRadius: '8px',
      border: '1px solid #d1d5db',
      fontSize: '16px',
      backgroundColor: '#f9fafb',
      transition: 'border-color 0.2s',
      width: '100%',
      boxSizing: 'border-box',
      '&:focus': {
        borderColor: '#6366f1',
        outline: 'none',
      }
    },
    button: {
      padding: '12px 20px',
      borderRadius: '8px',
      border: 'none',
      backgroundColor: '#6366f1',
      color: 'white',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      width: '100%',
      boxSizing: 'border-box',
      '&:hover': {
        backgroundColor: '#4f46e5',
      },
      '&:disabled': {
        backgroundColor: '#9ca3af',
        cursor: 'not-allowed',
      }
    },
    secondaryButton: {
      backgroundColor: '#f3f4f6',
      color: '#4b5563',
      border: '1px solid #d1d5db',
      '&:hover': {
        backgroundColor: '#e5e7eb',
      }
    },
    smallButton: {
      padding: '8px 12px',
      fontSize: '14px',
      borderRadius: '6px',
    },
    iconButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px',
      borderRadius: '8px',
      backgroundColor: 'transparent',
      color: '#6b7280',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#f3f4f6',
      }
    },
    error: {
      color: '#ef4444',
      margin: '10px 0',
      fontSize: '14px',
    },
    chartContainer: {
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      marginTop: '20px',
    },
    welcomeMessage: {
      fontSize: '24px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '20px',
    },
    welcomeContent: {
      fontSize: '16px',
      color: '#4b5563',
      lineHeight: '1.6',
      marginBottom: '30px',
    },
    navItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '8px',
      color: '#4b5563',
      fontSize: '14px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#e5e7eb',
      },
      '&.active': {
        backgroundColor: '#ede9fe',
        color: '#6d28d9',
      }
    },
    navIcon: {
      fontSize: '18px',
    },
    logoutButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      borderRadius: '8px',
      backgroundColor: '#ef4444',
      color: 'white',
      fontWeight: '500',
      cursor: 'pointer',
      border: 'none',
      transition: 'background-color 0.2s',
      '&:hover': {
        backgroundColor: '#dc2626',
      }
    },
    mainBackground: {
      backgroundImage: `url('${process.env.PUBLIC_URL}/tĹo.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative',
    },
    mainOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      zIndex: 1,
    },
    mainContent: {
      position: 'relative',
      zIndex: 2,
    },
    fileItem: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      padding: '16px',
      margin: '12px 0',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: '#f9fafb',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    },
    fileHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    fileName: {
      fontWeight: '600',
      fontSize: '14px',
      color: '#111827',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    fileDate: {
      fontSize: '12px',
      color: '#6b7280',
    },
    fileActions: {
      display: 'flex',
      gap: '8px',
      marginTop: '8px',
    },
    pagination: {
      display: 'flex',
      gap: '10px',
      marginTop: '20px',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pageButton: {
      padding: '8px 12px',
      borderRadius: '6px',
      border: '1px solid #d1d5db',
      backgroundColor: '#ffffff',
      color: '#4b5563',
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: '#f3f4f6',
      },
      '&.active': {
        backgroundColor: '#ede9fe',
        borderColor: '#a78bfa',
        color: '#6d28d9',
      },
      '&:disabled': {
        backgroundColor: '#f3f4f6',
        color: '#9ca3af',
        cursor: 'not-allowed',
      }
    },
    uploadInput: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px',
      border: '2px dashed #d1d5db',
      borderRadius: '8px',
      backgroundColor: '#ffffff',
      cursor: 'pointer',
      transition: 'border-color 0.2s',
      '&:hover': {
        borderColor: '#9ca3af',
      }
    },
    uploadIcon: {
      fontSize: '24px',
      color: '#6b7280',
      marginBottom: '12px',
    },
    uploadText: {
      color: '#4b5563',
      fontSize: '14px',
      textAlign: 'center',
    },
  };

  // Responsywne style z uĹźyciem media queries
  const applyResponsiveStyles = (baseStyles) => {
    const isMobile = window.innerWidth <= 768;
    
    return {
      ...baseStyles,
      sidebar: {
        ...baseStyles.sidebar,
        width: isMobile ? '100%' : '280px',
        height: isMobile ? 'auto' : '100vh',
        position: isMobile ? 'relative' : 'sticky',
        borderRight: isMobile ? 'none' : '1px solid #e5e7eb',
        borderBottom: isMobile ? '1px solid #e5e7eb' : 'none',
      },
      appContainer: {
        ...baseStyles.appContainer,
        flexDirection: isMobile ? 'column' : 'row',
      },
      content: {
        ...baseStyles.content,
        margin: isMobile ? '10px' : '20px',
        padding: isMobile ? '20px' : '30px',
      }
    };
  };

  const responsiveStyles = applyResponsiveStyles(styles);

 if (view === 'login') {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      padding: '20px',
      backgroundImage: `url('${process.env.PUBLIC_URL}/tlo.png')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(249, 250, 251, 0.8)',
        zIndex: 1
      }}></div>

        <div style={{ 
          maxWidth: '400px', 
          width: '100%', 
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          zIndex: 2,
          position: 'relative'
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '24px',
            color: '#111827',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            Logowanie do aplikacji
          </h2>
          
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={{ width: '100%' }}>
              <label htmlFor="phone" style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#4b5563'
              }}>
                Numer telefonu
              </label>
              <input
                id="phone"
                type="text"
                value={loginPhone}
                onChange={(e) => setLoginPhone(e.target.value)}
                placeholder="np. 123456789"
                style={styles.input}
                required
              />
            </div>
            
            <button 
              type="submit" 
              style={styles.button}
              disabled={loading}
            >
              {loading ? 'Logowanie...' : 'Zaloguj się'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                Nie masz konta?{' '}
              </span>
              <button
                type="button"
                onClick={() => setView('register')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6366f1',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Zarejestruj się
              </button>
            </div>
          </form>
          
          {error && <div style={styles.error}>{error}</div>}
        </div>
      </div>
    );
  }

  if (view === 'register') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '20px'
      }}>
        <div style={{ 
          maxWidth: '400px', 
          width: '100%', 
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '30px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}>
          <h2 style={{ 
            textAlign: 'center', 
            marginBottom: '24px',
            color: '#111827',
            fontSize: '24px',
            fontWeight: '600'
          }}>
            Rejestracja
          </h2>
          
          <form onSubmit={handleRegister} style={styles.form}>
            <div>
              <label htmlFor="name" style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#4b5563'
              }}>
                Imię i nazwisko
              </label>
              <input
                id="name"
                type="text"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                placeholder="Jan Kowalski"
                style={styles.input}
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#4b5563'
              }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                placeholder="jan@example.com"
                style={styles.input}
                required
              />
            </div>
            
            <div>
              <label htmlFor="reg-phone" style={{ 
                display: 'block', 
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: '#4b5563'
              }}>
                Numer telefonu
              </label>
              <input
                id="reg-phone"
                type="text"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                placeholder="np. 123456789"
                style={styles.input}
                required
              />
            </div>
            
            <button 
              type="submit" 
              style={styles.button}
              disabled={loading}
            >
              {loading ? 'Rejestracja...' : 'Zarejestruj się'}
            </button>
            
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>
                Masz już konto?{' '}
              </span>
              <button
                type="button"
                onClick={() => setView('login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6366f1',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Zaloguj się
              </button>
            </div>
          </form>
          
          {error && <div style={styles.error}>{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div style={responsiveStyles.layout}>
      <div style={responsiveStyles.header}>
        <div style={styles.headerTitle}>
          <FaUser style={{ color: '#6366f1' }} />
          <span>Witaj, {user?.name || 'Uzytkowniku'}</span>
        </div>
        <div style={styles.headerActions}>
          <button 
            onClick={handleLogout} 
            style={{
              ...styles.button,
              ...styles.smallButton,
              backgroundColor: '#ef4444',
              width: 'auto'
            }}
          >
            <FaSignOutAlt /> Wyloguj
          </button>
        </div>
      </div>
      
      <div style={responsiveStyles.appContainer}>
        <div style={responsiveStyles.sidebar}>
          <div style={{ marginBottom: '24px' }}>
            <div 
              style={{
                ...styles.navItem,
                ...(view === 'main' ? { backgroundColor: '#ede9fe', color: '#6d28d9' } : {})
              }}
              onClick={() => setView('main')}
            >
              <FaHome style={styles.navIcon} />
              <span>Strona główna</span>
            </div>
            
            <div 
              style={{
                ...styles.navItem,
                ...(view === 'chart' ? { backgroundColor: '#ede9fe', color: '#6d28d9' } : {})
              }}
              onClick={() => setView('chart')}
            >
              <FaChartLine style={styles.navIcon} />
              <span>Podsumowanie badań</span>
            </div>
            
            <div 
              style={{
                ...styles.navItem,
                ...(view === 'files' ? { backgroundColor: '#ede9fe', color: '#6d28d9' } : {})
              }}
              onClick={() => setView('files')}
            >
              <FaFileAlt style={styles.navIcon} />
              <span>Przesłane badania</span>
            </div>
            
            <div 
              style={{
                ...styles.navItem,
                ...(view === 'upload' ? { backgroundColor: '#ede9fe', color: '#6d28d9' } : {})
              }}
              onClick={() => setView('upload')}
            >
              <FaUpload style={styles.navIcon} />
              <span>Wgraj nowy plik</span>
            </div>
            
            <div 
              style={{
                ...styles.navItem,
                ...(view === 'edit' ? { backgroundColor: '#ede9fe', color: '#6d28d9' } : {})
              }}
              onClick={() => setView('edit')}
            >
              <FaUser style={styles.navIcon} />
              <span>Edytuj profil</span>
            </div>
          </div>
        </div>
        
        <div style={responsiveStyles.content}>
          {view === 'main' && (
            <div style={styles.mainBackground}>
              <div style={styles.mainOverlay}></div>
              <div style={styles.mainContent}>
                <h1 style={styles.welcomeMessage}>Witaj w aplikacji AI analizującej Twoje wyniki krwi</h1>
                <p style={styles.welcomeContent}>
                  Wgrywaj wyniki i analizuj. Nasza aplikacja pomoze Ci zrozumieć Twoje badania krwi oraz zmiany parametrów w czasie. Wgraj swoje wyniki w formacie PDF,
                  a sztuczna inteligencja automatycznie je przeanalizuje.
                </p>
                
                {summary && (
                  <div style={styles.chartContainer}>
                    <h2 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#111827',
                      marginBottom: '16px'
                    }}>
                      Twoja ostatnia analiza
                    </h2>
                    <div dangerouslySetInnerHTML={{ __html: summary }} />
                  </div>
                )}
                
                {error && <div style={styles.error}>{error}</div>}
              </div>
            </div>
          )}
          
          {view === 'analysis' && selectedDoc && (
            <>
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                color: '#111827',
                marginBottom: '20px'
              }}>
                Analiza pliku: {selectedDoc.filename}
              </h1>
              
              <div style={styles.chartContainer}>
                <div dangerouslySetInnerHTML={{ __html: analysis }} />
              </div>
              
              <button
                onClick={() => setView('files')}
                style={{
                  ...styles.button,
                  ...styles.secondaryButton,
                  marginTop: '20px',
                  width: 'auto'
                }}
              >
                Powrót
              </button>
              
              {error && <div style={styles.error}>{error}</div>}
            </>
          )}
          
          {view === 'chart' && (
            <WykresWynikow
              parameters={parameters}
              selectedParams={selectedParams}
              chartData={chartData}
              styles={styles}
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
    styles={styles}
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
    styles={styles}
    responsiveStyles={responsiveStyles}
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
    styles={styles}
    responsiveStyles={responsiveStyles}
  />
)}

        </div>
      </div>
    </div>
  );
}

export default App;