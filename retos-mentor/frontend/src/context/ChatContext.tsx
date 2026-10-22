import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { api } from '../services/api';
import type {
  ChatSession,
  ChatMessage,
  AIModelId,
  AIModelOption,
} from '../types';

const CHAT_SESSIONS_STORAGE_KEY = 'retos_mentor_chat_sessions';

export const AI_MODELS: AIModelOption[] = [
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google AI',
    description: 'Máxima velocidad y razonamiento multimodal avanzado.',
    badge: 'Predeterminado',
  },
  {
    id: 'llama-3.3-70b',
    name: 'Llama 3.3 70B',
    provider: 'Together AI',
    description: 'Excelente para explicaciones teóricas y arquitectura de sistemas.',
  },
  {
    id: 'mixtral-8x7b',
    name: 'Mixtral 8x7B',
    provider: 'Together AI',
    description: 'Especializado en resolución algorítmica y matemáticas aplicadas.',
  },
  {
    id: 'qwen-2.5-coder-32b',
    name: 'Qwen 2.5 Coder 32B',
    provider: 'Together AI',
    description: 'Optimizado para desarrollo de software, depuración y sintaxis.',
    badge: 'Código',
  },
];

export interface ChatErrorState {
  message: string;
  status?: number;
  raw?: string;
}

interface ChatContextType {
  sessions: ChatSession[];
  activeSession: ChatSession | null;
  activeSessionId: string | null;
  setActiveSessionId: (id: string) => void;
  createNewSession: (
    title?: string,
    initialCareerId?: number,
    initialSubjectId?: number,
    initialTopicId?: number
  ) => string;
  deleteSession: (id: string) => void;
  renameSession: (id: string, newTitle: string) => void;
  changeSessionModel: (modelId: AIModelId) => void;
  setSessionAcademicContext: (
    careerId: number | '',
    subjectId?: number | '',
    topicId?: number | ''
  ) => void;
  sendMessage: (text: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  lastError: ChatErrorState | null;
  clearLastError: () => void;
  rateMessage: (messageId: string, rating: 'helpful' | 'unhelpful') => void;
  isStreaming: boolean;
  streamingMessageId: string | null;
  streamingStatusText: string;
  replyToMessage: ChatMessage | null;
  setReplyToMessage: (msg: ChatMessage | null) => void;
  searchFilter: string;
  setSearchFilter: (query: string) => void;
  filteredSessions: ChatSession[];
  exportSessionToMarkdown: (sessionId?: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session: studentSession } = useAuth();
  const { success, warning, info } = useToast();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingStatusText, setStreamingStatusText] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [lastError, setLastError] = useState<ChatErrorState | null>(null);

  // 1. Cargar sesiones desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CHAT_SESSIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ChatSession[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Sanitizar sesiones para garantizar que no existan IDs obsoletos 101 o 1001
          const sanitized = parsed.map((s) => ({
            ...s,
            careerBackendId: s.careerBackendId || (s.carreraId === 'desarrollo-software' ? 1 : 1),
            subjectId: s.subjectId && s.subjectId <= 8 ? s.subjectId : 1,
            topicId: s.topicId && s.topicId <= 24 ? s.topicId : 1,
          }));
          setSessions(sanitized);
          setActiveSessionId(sanitized[0].id);
          return;
        }
      }
    } catch (err) {
      console.warn('Error leyendo sesiones de chat:', err);
    }

    // Si no existen sesiones, crear una inicial con IDs reales (1..4, 1..8, 1..24)
    const initialSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'Sesión de Consulta Académica',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      carreraId: studentSession?.careerId || 'desarrollo-software',
      careerBackendId: studentSession?.careerBackendId || 1,
      subjectId: 1,
      topicId: 1,
      modelId: 'gemini-2.5-flash',
      isModelLocked: false,
      messages: [
        {
          id: 'welcome-msg',
          sender: 'assistant',
          content:
            '¡Hola! Soy tu Mentor Académico Virtual. Selecciona tu carrera, asignatura y tema para comenzar a resolver dudas o practicar ejercicios.',
          timestamp: new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      ],
    };

    setSessions([initialSession]);
    setActiveSessionId(initialSession.id);
  }, []);

  // 2. Persistir sesiones en localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        localStorage.setItem(CHAT_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
      } catch (err) {
        console.error('Error persistiendo sesiones de chat:', err);
      }
    }
  }, [sessions]);

  // Sesión activa actual
  const activeSession = useMemo(() => {
    return sessions.find((s) => s.id === activeSessionId) || sessions[0] || null;
  }, [sessions, activeSessionId]);

  // Actualizar contexto académico en la sesión activa
  const setSessionAcademicContext = useCallback(
    (careerId: number | '', subjectId?: number | '', topicId?: number | '') => {
      if (!activeSession) return;
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSession.id) return s;
          return {
            ...s,
            careerBackendId: typeof careerId === 'number' ? careerId : undefined,
            subjectId: typeof subjectId === 'number' ? subjectId : undefined,
            topicId: typeof topicId === 'number' ? topicId : undefined,
            updatedAt: new Date().toISOString(),
          };
        })
      );
    },
    [activeSession]
  );

  // Crear nueva sesión con contexto opcional
  const createNewSession = useCallback(
    (
      title?: string,
      initialCareerId?: number,
      initialSubjectId?: number,
      initialTopicId?: number
    ): string => {
      const newId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newSession: ChatSession = {
        id: newId,
        title: title || `Consulta ${sessions.length + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        carreraId: studentSession?.careerId || 'desarrollo-software',
        careerBackendId:
          initialCareerId ?? activeSession?.careerBackendId ?? studentSession?.careerBackendId ?? 1,
        subjectId: initialSubjectId ?? activeSession?.subjectId ?? 1,
        topicId: initialTopicId ?? activeSession?.topicId ?? 1,
        modelId: 'gemini-2.5-flash',
        isModelLocked: false,
        messages: [
          {
            id: `msg-welcome-${Date.now()}`,
            sender: 'assistant',
            content:
              'Nueva sesión iniciada. Configura tu contexto académico si lo requieres o escribe directamente tu consulta.',
            timestamp: new Date().toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
        ],
      };

      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newId);
      setReplyToMessage(null);
      setLastError(null);
      success('Nueva sesión creada.', 'Mentor Chat');
      return newId;
    },
    [
      sessions.length,
      studentSession?.careerId,
      studentSession?.careerBackendId,
      activeSession?.careerBackendId,
      activeSession?.subjectId,
      activeSession?.topicId,
      success,
    ]
  );

  // Eliminar sesión
  const deleteSession = useCallback(
    (id: string) => {
      if (sessions.length <= 1) {
        warning('No puedes eliminar la única sesión activa.');
        return;
      }

      setSessions((prev) => {
        const remaining = prev.filter((s) => s.id !== id);
        if (activeSessionId === id && remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
        }
        return remaining;
      });
      info('Sesión eliminada');
    },
    [sessions.length, activeSessionId, warning, info]
  );

  // Renombrar sesión
  const renameSession = useCallback((id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, title: trimmed, updatedAt: new Date().toISOString() } : s
      )
    );
  }, []);

  // Cambiar modelo de IA de la sesión (solo si no está bloqueada)
  const changeSessionModel = useCallback(
    (modelId: AIModelId) => {
      if (!activeSession) return;
      if (activeSession.isModelLocked) {
        warning(
          'El modelo está bloqueado para esta conversación porque ya cuenta con mensajes enviados.',
          'Modelo Fijado'
        );
        return;
      }

      const modelObj = AI_MODELS.find((m) => m.id === modelId);
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id ? { ...s, modelId, updatedAt: new Date().toISOString() } : s
        )
      );

      success(`Modelo cambiado a ${modelObj?.name || modelId}`);
    },
    [activeSession, warning, success]
  );

  // Valoración de mensajes de asistente (P1: AC-09)
  const rateMessage = useCallback(
    (messageId: string, rating: 'helpful' | 'unhelpful') => {
      if (!activeSession) return;
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSession.id) return s;
          const currentRating = s.feedback?.[messageId];
          const newRating = currentRating === rating ? undefined : rating;
          const nextFeedback = { ...(s.feedback || {}) };
          if (newRating) {
            nextFeedback[messageId] = newRating;
          } else {
            delete nextFeedback[messageId];
          }
          return {
            ...s,
            feedback: nextFeedback,
          };
        })
      );
    },
    [activeSession]
  );

  const clearLastError = useCallback(() => {
    setLastError(null);
  }, []);

  // Enviar mensaje con propagación de errores y continuidad de sesión
  const sendMessage = useCallback(
    async (text: string) => {
      const cleanText = text.trim();
      if (!cleanText || !activeSession || isStreaming) return;

      // Validación de 2,000 caracteres
      if (cleanText.length > 2000) {
        setLastError({
          message: 'El mensaje supera el límite máximo de 2,000 caracteres permitido.',
          status: 400,
          raw: cleanText,
        });
        return;
      }

      const studentId = studentSession?.id ?? 1;
      const subjectId = Number(activeSession.subjectId);
      const topicId = Number(activeSession.topicId);

      if (!studentId || !subjectId || !topicId) {
        setLastError({
          message: 'Por favor selecciona una Asignatura y un Tema válidos antes de enviar tu consulta.',
          status: 400,
          raw: cleanText,
        });
        return;
      }

      if (subjectId < 1 || subjectId > 8 || topicId < 1 || topicId > 24) {
        setLastError({
          message: 'Contexto académico inválido. Selecciona una materia (1..8) y tema (1..24) reales.',
          status: 400,
          raw: cleanText,
        });
        return;
      }

      // Limpiar error previo al reintentar o enviar
      setLastError(null);

      const userMsgId = `msg-user-${Date.now()}`;
      const nowFormatted = new Date().toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const userMsg: ChatMessage = {
        id: userMsgId,
        sender: 'user',
        content: cleanText,
        timestamp: nowFormatted,
        replyToId: replyToMessage?.id,
        replyToSnippet: replyToMessage
          ? replyToMessage.content.substring(0, 80) +
            (replyToMessage.content.length > 80 ? '...' : '')
          : undefined,
      };

      // 1. Agregar mensaje de usuario y bloquear el modelo si no lo estaba
      const updatedMessages = [...activeSession.messages, userMsg];
      const sessionTitle =
        activeSession.messages.filter((m) => m.sender === 'user').length === 0
          ? cleanText.substring(0, 32) + (cleanText.length > 32 ? '...' : '')
          : activeSession.title;

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSession.id
            ? {
                ...s,
                title: sessionTitle,
                isModelLocked: true,
                messages: updatedMessages,
                updatedAt: new Date().toISOString(),
              }
            : s
        )
      );

      setReplyToMessage(null);
      setIsStreaming(true);
      setStreamingStatusText('El Mentor Académico está analizando tu consulta...');

      try {
        // 2. Llamada real al backend NestJS con sessionId para continuidad (2+ turnos)
        const apiResponse = await api.sendMentorMessage({
          studentId,
          subjectId,
          topicId,
          message: cleanText,
          sessionId: activeSession.id,
        });

        const fullAnswer = (apiResponse?.answer || '').trim();
        if (!fullAnswer) {
          throw new Error('El mentor devolvió una respuesta vacía.');
        }

        const sources = apiResponse.sources;

        // 3. Efecto de streaming progresivo en el cliente
        const assistantMsgId = `msg-assistant-${Date.now()}`;
        setStreamingMessageId(assistantMsgId);

        const initialAssistantMsg: ChatMessage = {
          id: assistantMsgId,
          sender: 'assistant',
          content: '',
          timestamp: new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          sources,
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSession.id
              ? {
                  ...s,
                  messages: [...s.messages, initialAssistantMsg],
                }
              : s
          )
        );

        const words = fullAnswer.split(' ');
        let currentStreamedText = '';

        for (let i = 0; i < words.length; i++) {
          currentStreamedText += (i === 0 ? '' : ' ') + words[i];
          const textChunk = currentStreamedText;
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== activeSession.id) return s;
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: textChunk, sources }
                    : m
                ),
              };
            })
          );

          if (words.length > 15) {
            await new Promise((res) => setTimeout(res, 20));
          }
        }
      } catch (err: any) {
        console.error('Error en envío de mensaje:', err);
        const status = err.status || (err.name === 'AbortError' ? 502 : 503);
        const errorText = err.message || 'Error de conexión con el backend.';

        setLastError({
          message: errorText,
          status,
          raw: cleanText,
        });

        const errorMsg: ChatMessage = {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          content: `⚠️ No se pudo procesar tu respuesta (${errorText}). Puedes pulsar "Reintentar" para volver a enviarla.`,
          timestamp: new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        setSessions((prev) =>
          prev.map((s) =>
            s.id === activeSession.id
              ? { ...s, messages: [...s.messages, errorMsg] }
              : s
          )
        );
      } finally {
        setIsStreaming(false);
        setStreamingMessageId(null);
        setStreamingStatusText('');
      }
    },
    [activeSession, isStreaming, replyToMessage, studentSession?.id]
  );

  // Reintentar último mensaje fallido (BUG-005 y QA-09)
  const retryLastMessage = useCallback(async () => {
    if (!lastError?.raw) return;
    const textToRetry = lastError.raw;
    setLastError(null);
    await sendMessage(textToRetry);
  }, [lastError, sendMessage]);

  // Filtrado de sesiones por búsqueda
  const filteredSessions = useMemo(() => {
    if (!searchFilter.trim()) return sessions;
    const q = searchFilter.toLowerCase();
    return sessions.filter((s) => {
      const matchTitle = s.title.toLowerCase().includes(q);
      const matchMsg = s.messages.some((m) => m.content.toLowerCase().includes(q));
      return matchTitle || matchMsg;
    });
  }, [sessions, searchFilter]);

  // Exportar conversación a Markdown (.md)
  const exportSessionToMarkdown = useCallback(
    (sessionId?: string) => {
      const targetSession = sessionId
        ? sessions.find((s) => s.id === sessionId)
        : activeSession;

      if (!targetSession) {
        warning('No hay sesión seleccionada para exportar.');
        return;
      }

      const modelObj = AI_MODELS.find((m) => m.id === targetSession.modelId);

      let md = `# Conversación de Mentoría: ${targetSession.title}\n\n`;
      md += `- **Fecha de Creación**: ${new Date(targetSession.createdAt).toLocaleString('es-ES')}\n`;
      md += `- **Carrera**: ${studentSession?.careerName || targetSession.carreraId}\n`;
      md += `- **Asignatura (ID)**: ${targetSession.subjectId || 'N/A'}\n`;
      md += `- **Tema (ID)**: ${targetSession.topicId || 'N/A'}\n`;
      md += `- **Modelo de IA**: ${modelObj?.name || targetSession.modelId} (${modelObj?.provider || 'IA'})\n`;
      md += `- **Total Mensajes**: ${targetSession.messages.length}\n\n`;
      md += `---\n\n`;

      for (const msg of targetSession.messages) {
        const senderLabel = msg.sender === 'user' ? '👤 Estudiante' : '🤖 Mentor Virtual';
        md += `### ${senderLabel} [${msg.timestamp}]\n\n`;
        if (msg.replyToSnippet) {
          md += `> En respuesta a: "${msg.replyToSnippet}"\n\n`;
        }
        md += `${msg.content}\n\n`;
        md += `---\n\n`;
      }

      // Disparar descarga en el navegador
      const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeTitle = targetSession.title.replace(/[^\w\s-]/g, '').replace(/\s+/g, '_');
      link.href = url;
      link.download = `Mentor_${safeTitle}_${new Date().toISOString().substring(0, 10)}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      success('Archivo Markdown descargado con éxito.', 'Exportación de Chat');
    },
    [sessions, activeSession, studentSession?.careerName, warning, success]
  );

  return (
    <ChatContext.Provider
      value={{
        sessions,
        activeSession,
        activeSessionId,
        setActiveSessionId,
        createNewSession,
        deleteSession,
        renameSession,
        changeSessionModel,
        setSessionAcademicContext,
        sendMessage,
        retryLastMessage,
        lastError,
        clearLastError,
        rateMessage,
        isStreaming,
        streamingMessageId,
        streamingStatusText,
        replyToMessage,
        setReplyToMessage,
        searchFilter,
        setSearchFilter,
        filteredSessions,
        exportSessionToMarkdown,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe ser utilizado dentro de un ChatProvider');
  }
  return context;
};

