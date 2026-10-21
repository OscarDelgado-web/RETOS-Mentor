export type AIModelId =
  | 'gemini-2.5-flash'
  | 'llama-3.3-70b'
  | 'mixtral-8x7b'
  | 'qwen-2.5-coder-32b';

export interface AIModelOption {
  id: AIModelId;
  name: string;
  provider: string;
  description: string;
  badge?: string;
}

export interface StudentSession {
  id: number;
  name: string;
  careerId: string; // ID en careersCatalog (ej. 'desarrollo-software')
  careerBackendId?: number;
  careerName: string;
  avatar?: string;
  isCustom?: boolean;
}

export interface MateriaTopic {
  id: number;
  subjectId?: number;
  name: string;
}

export interface MateriaItem {
  id: string; // ej: 'desarrollo-software-db2' o número id backend
  backendId?: number;
  name: string;
  careerId: string;
  codigo?: string;
  ciclo?: string;
  creditos?: number;
  descripcion?: string;
  topics?: MateriaTopic[];
}

export type DocumentProcessingStatus = 'cargando' | 'procesando' | 'listo' | 'error';

export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  tokenCountEstimate: number;
}

export interface DocumentoItem {
  id: string;
  materiaId: string;
  materiaNombre: string;
  nombre: string;
  tipo: 'pdf' | 'txt' | 'doc' | 'docx' | 'md' | 'otro';
  tamanoBytes: number;
  tamanoFormateado: string;
  fechaSubida: string;
  estado: DocumentProcessingStatus;
  progreso: number; // 0 - 100
  activoParaChat: boolean;
  contenidoTextoExtraido: string;
  fragmentos: DocumentChunk[];
  errorMensaje?: string;
}

export interface SourceCitation {
  id: string;
  documentoId: string;
  documentoNombre: string;
  materiaNombre: string;
  fragmento: string;
  similitud?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  citas?: SourceCitation[];
  replyToId?: string;
  replyToSnippet?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  carreraId: string;
  materiaId?: string;
  topicId?: number;
  modelId: AIModelId;
  isModelLocked: boolean;
  messages: ChatMessage[];
}

export interface ToastNotification {
  id: string;
  tipo: 'success' | 'warning' | 'error' | 'info';
  mensaje: string;
  titulo?: string;
  duracionMs?: number;
}
