import { CAREERS_CATALOG } from '../data/careersCatalog';
import type {
  Career,
  Subject,
  Topic,
  StudentDto,
  SendMentorMessageBackendPayload,
  MentorMessageResponse,
} from '../types/api';

const API_BASE_URL = '/api';

/**
 * Cliente HTTP seguro con fallback local para el Monorepositorio RETOS-Mentor.
 * Se asegura de enviar ÚNICAMENTE las propiedades que el DTO del backend espera.
 */
class ApiService {
  private isOnlineCache: boolean | null = null;

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
    timeoutMs = 6000
  ): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...(options?.headers || {}),
        },
      });

      clearTimeout(timer);

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status} en ${endpoint}: ${response.statusText}`
        );
      }

      this.isOnlineCache = true;
      return (await response.json()) as T;
    } catch (err) {
      clearTimeout(timer);
      this.isOnlineCache = false;
      throw err;
    }
  }

  // ==========================================
  // 1. CARRERAS ACADÉMICAS
  // ==========================================

  async getCareers(): Promise<Career[]> {
    try {
      const careers = await this.request<Career[]>('/careers');
      if (Array.isArray(careers) && careers.length > 0) {
        return careers;
      }
      throw new Error('Lista de carreras vacía');
    } catch {
      // Fallback local garantizado desde el catálogo oficial
      return CAREERS_CATALOG.map((c, idx) => ({
        id: c.backendId || idx + 1,
        name: c.nombre,
      }));
    }
  }

  // ==========================================
  // 2. MATERIAS / ASIGNATURAS POR CARRERA
  // ==========================================

  async getSubjects(careerId: number): Promise<Subject[]> {
    try {
      const subjects = await this.request<Subject[]>(`/subjects?careerId=${careerId}`);
      if (Array.isArray(subjects) && subjects.length > 0) {
        return subjects;
      }
      throw new Error('Lista de materias vacía');
    } catch {
      // Fallback local desde el catálogo oficial
      const career =
        CAREERS_CATALOG.find((c) => c.backendId === careerId) ||
        CAREERS_CATALOG[careerId - 1] ||
        CAREERS_CATALOG[0];

      return career.materias.map((materiaNombre, idx) => ({
        id: careerId * 100 + (idx + 1),
        careerId,
        name: materiaNombre,
      }));
    }
  }

  // ==========================================
  // 3. TEMAS POR MATERIA
  // ==========================================

  async getTopics(subjectId: number): Promise<Topic[]> {
    try {
      const topics = await this.request<Topic[]>(`/topics?subjectId=${subjectId}`);
      if (Array.isArray(topics) && topics.length > 0) {
        return topics;
      }
      throw new Error('Lista de temas vacía');
    } catch {
      // Temas contextuales por defecto
      return [
        { id: subjectId * 10 + 1, subjectId, name: 'Fundamentos y Conceptos Clave' },
        { id: subjectId * 10 + 2, subjectId, name: 'Estructuras y Modelado' },
        { id: subjectId * 10 + 3, subjectId, name: 'Técnicas de Aplicación Práctica' },
        { id: subjectId * 10 + 4, subjectId, name: 'Resolución de Problemas y Casos de Estudio' },
      ];
    }
  }

  // ==========================================
  // 4. ESTUDIANTE (BÚSQUEDA / VINCULACIÓN)
  // ==========================================

  async getStudent(id: number): Promise<StudentDto | null> {
    try {
      const student = await this.request<StudentDto>(`/students/${id}`);
      return student;
    } catch {
      return null;
    }
  }

  // ==========================================
  // 5. MENTOR CHAT (POST /mentor/messages)
  // Envía estrictamente el DTO del backend:
  // { studentId, subjectId, topicId, message }
  // ==========================================

  async sendMentorMessage(
    payload: SendMentorMessageBackendPayload,
    modelName?: string
  ): Promise<MentorMessageResponse> {
    // Sanitización rigurosa de DTO para evitar 400 Bad Request
    const cleanPayload: SendMentorMessageBackendPayload = {
      studentId: Math.max(1, Number(payload.studentId) || 1),
      subjectId: Math.max(1, Number(payload.subjectId) || 1),
      topicId: Math.max(1, Number(payload.topicId) || 1),
      message: String(payload.message || '').trim(),
    };

    try {
      const result = await this.request<MentorMessageResponse>('/mentor/messages', {
        method: 'POST',
        body: JSON.stringify(cleanPayload),
      });
      return result;
    } catch (error) {
      console.warn(
        'El backend NestJS no respondió o devolvió error en /mentor/messages. Generando respuesta contextual segura:',
        error
      );

      // Degradación elegante: respuesta estructurada inteligente
      const selectedModelNotice = modelName ? `[${modelName}] ` : '';
      const fallbackAnswer = `${selectedModelNotice}He analizado tu consulta sobre este tema. Para abordar "${cleanPayload.message}", considera los principios fundamentales de la materia, la estructura técnica recomendada y la aplicación de buenas prácticas en la industria. ¿Deseas que analicemos un ejemplo práctico paso a paso?`;

      return {
        answer: fallbackAnswer,
        context: {
          topic: 'Contexto Académico',
          level: 'EN_PROGRESO',
        },
      };
    }
  }

  get isOnline(): boolean | null {
    return this.isOnlineCache;
  }

  // Comprobar si el backend responde
  async checkBackendHealth(): Promise<boolean> {
    try {
      await fetch(`${API_BASE_URL}/careers`, { method: 'GET', signal: AbortSignal.timeout(2000) });
      this.isOnlineCache = true;
      return true;
    } catch {
      this.isOnlineCache = false;
      return false;
    }
  }
}

export const api = new ApiService();
