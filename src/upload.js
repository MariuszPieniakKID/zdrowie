import React from 'react';
import { FaUpload } from 'react-icons/fa';

/**
 * Komponent do wgrywania nowych plików PDF z wynikami badań.
 */
function WgrajPlik({
  handleFileUpload,
  selectedFile,
  setSelectedFile,
  symptoms,
  setSymptoms,
  chronicDiseases,
  setChronicDiseases,
  medications,
  setMedications,
  loading,
  styles,
  responsiveStyles
}) {
  return (
    <>
      <h1 style={{ 
        fontSize: '24px', 
        fontWeight: '600', 
        color: '#111827',
        marginBottom: '20px'
      }}>
        Wgraj nowy plik
      </h1>
      
      <form onSubmit={handleFileUpload} style={{ maxWidth: '600px', margin: '0 auto' }}>
        <label htmlFor="file-upload" style={styles.uploadInput}>
          <FaUpload style={styles.uploadIcon} />
          <div style={styles.uploadText}>
            {selectedFile ? selectedFile.name : 'Kliknij, aby wgrać plik PDF'}
          </div>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            onChange={(e) => setSelectedFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
        </label>
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Dodatkowe informacje</h3>
          
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Twoje symptomy</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            style={{
              ...responsiveStyles.input,
              minHeight: '80px',
              resize: 'vertical',
              marginBottom: '15px'
            }}
            placeholder="Opisz swoje symptomy..."
          />
          
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Choroby przewlekłe</label>
          <textarea
            value={chronicDiseases}
            onChange={(e) => setChronicDiseases(e.target.value)}
            style={{
              ...responsiveStyles.input,
              minHeight: '80px',
              resize: 'vertical',
              marginBottom: '15px'
            }}
            placeholder="Wymień choroby przewlekłe..."
          />
          
          <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Przyjmowane leki</label>
          <textarea
            value={medications}
            onChange={(e) => setMedications(e.target.value)}
            style={{
              ...responsiveStyles.input,
              minHeight: '80px',
              resize: 'vertical'
            }}
            placeholder="Wymień przyjmowane leki..."
          />
        </div>
        <button
          type="submit"
          disabled={!selectedFile || loading}
          style={{
            ...styles.button,
            width: '100%',
            marginTop: '15px',
            ...((!selectedFile || loading) ? { opacity: 0.7, cursor: 'not-allowed' } : {})
          }}
        >
          {loading ? 'Przesyłanie...' : 'Prześlij plik'}
        </button>
      </form>
    </>
  );
}

export default WgrajPlik;
