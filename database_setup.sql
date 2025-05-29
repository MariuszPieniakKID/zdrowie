-- Database setup for Badania app
-- Local PostgreSQL database

-- Tabela użytkowników
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela dokumentów
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    symptoms TEXT,
    chronic_diseases TEXT,
    medications TEXT,
    analysis TEXT,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela parametrów zdrowotnych
CREATE TABLE parameters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
    parameter_name VARCHAR(255) NOT NULL,
    parameter_value VARCHAR(255) NOT NULL,
    parameter_comment TEXT,
    measurement_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela pamięci agenta AI
CREATE TABLE agent_memory (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indeksy dla lepszej wydajności
CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_documents_upload_date ON documents(upload_date);
CREATE INDEX idx_parameters_user_id ON parameters(user_id);
CREATE INDEX idx_parameters_document_id ON parameters(document_id);
CREATE INDEX idx_parameters_measurement_date ON parameters(measurement_date);
CREATE INDEX idx_agent_memory_user_id ON agent_memory(user_id);
CREATE INDEX idx_agent_memory_timestamp ON agent_memory(timestamp);

-- Przykładowe dane testowe
INSERT INTO users (name, email, phone) VALUES 
('Jan Kowalski', 'jan.kowalski@example.com', '123456789'),
('Anna Nowak', 'anna.nowak@example.com', '987654321');

-- Komunikat o pomyślnym utworzeniu
SELECT 'Baza danych została utworzona pomyślnie!' as status; 