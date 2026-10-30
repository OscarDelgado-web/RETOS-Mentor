import type {
  Career,
  Subject,
  Topic,
  StudentDto,
  MentorMessageRequest,
  MentorMessageResponse,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ApiHttpError extends Error {
  status?: number;
  statusText?: string;
  details?: unknown;
}

/**
 * Cliente HTTP seguro con fallback local para el Monorepositorio RETOS-Mentor.
 * Se asegura de enviar ÚNICAMENTE las propiedades que el DTO del backend espera.
 */
class ApiService {
  private isOnlineCache: boolean | null = null;

  private async request<T>(
    endpoint: string,
    options?: RequestInit,
    timeoutMs = 18000
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

      const isSuccess = response.status === 200 || response.status === 201 || response.ok;

      if (!isSuccess) {
        let errorMsg = `HTTP ${response.status} en ${endpoint}: ${response.statusText}`;
        let details: unknown = null;
        try {
          const jsonBody = (await response.json()) as { message?: string | string[] };
          details = jsonBody;
          if (jsonBody?.message) {
            errorMsg = Array.isArray(jsonBody.message)
              ? jsonBody.message.join(', ')
              : String(jsonBody.message);
          }
        } catch {
          // No es JSON, mantener errorMsg estándar
        }
        const httpError = new Error(errorMsg) as ApiHttpError;
        httpError.status = response.status;
        httpError.statusText = response.statusText;
        httpError.details = details;
        throw httpError;
      }

      this.isOnlineCache = true;
      return (await response.json()) as T;
    } catch (err: unknown) {
      clearTimeout(timer);
      this.isOnlineCache = false;

      const httpErr = err as ApiHttpError;
      if (httpErr.name === 'AbortError') {
        const timeoutError = new Error(
          `Tiempo de espera agotado al conectar con el servidor (timeout de ${timeoutMs / 1000}s)`
        ) as ApiHttpError;
        timeoutError.status = 502;
        throw timeoutError;
      }

      // Si no tiene status, se trata de una falla de red / servidor detenido
      if (!httpErr.status) {
        httpErr.status = 503;
        httpErr.message = httpErr.message || 'El servidor backend está detenido o no responde.';
      }

      throw httpErr;
    }
  }

  // ==========================================
  // 1. CARRERAS ACADÉMICAS
  // ==========================================

  async getCareers(): Promise<Career[]> {
    return await this.request<Career[]>('/careers', undefined, 6000);
  }

  // ==========================================
  // 2. MATERIAS / ASIGNATURAS POR CARRERA
  // ==========================================

  async getSubjects(careerId: number): Promise<Subject[]> {
    return await this.request<Subject[]>(`/subjects?careerId=${careerId}`, undefined, 6000);
  }

  // ==========================================
  // 3. TEMAS POR MATERIA
  // ==========================================

  async getTopics(subjectId: number): Promise<Topic[]> {
    return await this.request<Topic[]>(`/topics?subjectId=${subjectId}`, undefined, 6000);
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
  // Sin mock silencioso (BUG-002 y QA-08)
  // Propaga errores HTTP reales hacia la UI
  // ==========================================

  async sendMentorMessage(
    payload: MentorMessageRequest
  ): Promise<MentorMessageResponse> {
    const studentId = Number(payload.studentId);
    const subjectId = Number(payload.subjectId);
    const topicId = Number(payload.topicId);
    const message = String(payload.message || '').trim();

    if (!studentId || !subjectId || !topicId || !message) {
      const validationError = new Error(
        'studentId, subjectId, topicId y message son requeridos.'
      ) as ApiHttpError;
      validationError.status = 400;
      throw validationError;
    }

    const cleanPayload: MentorMessageRequest = {
      studentId,
      subjectId,
      topicId,
      message,
      ...(payload.sessionId ? { sessionId: payload.sessionId } : {}),
    };

    return await this.request<MentorMessageResponse>(
      '/mentor/messages',
      {
        method: 'POST',
        body: JSON.stringify(cleanPayload),
      },
      18000
    );
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
