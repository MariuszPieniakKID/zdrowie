// Types for MedAnalyzer application

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
}

export interface Document {
  id: number;
  filename: string;
  upload_date: string;
  analysis?: string;
  symptoms?: string;
  chronic_diseases?: string;
  medications?: string;
  showAnalysis?: boolean;
}

export interface FilesData {
  documents: Document[];
  total: number;
  page: number;
  totalPages: number;
}

export interface Parameter {
  id?: number;
  parameter_name: string;
  parameter_value: string;
  units?: string;
  measurement_date: string;
  analysis?: string;
}

export interface ChartDataPoint {
  x: Date;
  y: number;
}

export interface ChartDataset {
  label: string;
  data: ChartDataPoint[];
  borderColor: string;
  tension: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface RegisterForm {
  name: string;
  email: string;
  phone: string;
}

export interface EditForm {
  name: string;
  email: string;
  phone: string;
}

export interface LandingProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

export interface WykresWynikowProps {
  parameters: Parameter[];
  selectedParams: string[];
  chartData: ChartData;
  handleParamToggle: (paramName: string) => void;
  handleSummarize: () => void;
  summary: string;
  isAnalyzing: boolean;
  handleSelectAll: () => void;
  handleDeselectAll: () => void;
}

export interface PrzeslaneBadaniaProps {
  files: FilesData;
  loadingAnalysis: number | null;
  handleAnalyze: (doc: Document) => void;
  handleShowAnalysis: (doc: Document) => void;
  handleDelete: (docId: number) => void;
  formatDate: (dateString: string) => string;
  setFiles: React.Dispatch<React.SetStateAction<FilesData>>;
}

export interface WgrajPlikProps {
  handleFileUpload: (e: React.FormEvent<HTMLFormElement>) => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
  symptoms: string;
  setSymptoms: (value: string) => void;
  chronicDiseases: string;
  setChronicDiseases: (value: string) => void;
  medications: string;
  setMedications: (value: string) => void;
  loading: boolean;
}

export interface EdytujProfilProps {
  editForm: EditForm;
  setEditForm: React.Dispatch<React.SetStateAction<EditForm>>;
  handleEdit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleDeleteUserData: () => void;
  setView: (view: string) => void;
  loading: boolean;
  error: string;
}

export type ViewType = 'login' | 'register' | 'main' | 'upload' | 'files' | 'chart' | 'analysis' | 'edit';

