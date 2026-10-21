import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useAuth } from './AuthContext';
import { useMaterias } from './MateriasContext';
import { useToast } from './ToastContext';
import { api } from '../services/api';
import { findRelevantChunks } from '../services/documentProcessor';
import type {
  ChatSession,
  ChatMessage,
  AIModelId,
  AIModelOption,
  SourceCitation,
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

interface ChatContextType {
  sessions: ChatSession[];
  activeSession: ChatSession | null;
  activeSessionId: string | null;
  setActiveSessionId: (id: string) => void;
  createNewSession: (title?: string, initialMateriaId?: string) => string;
  deleteSession: (id: string) => void;
  renameSession: (id: string, newTitle: string) => void;
  changeSessionModel: (modelId: AIModelId) => void;
  sendMessage: (text: string) => Promise<void>;
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
  const { documentosActivosParaChat, materias, selectedMateria } = useMaterias();
  const { success, warning, info } = useToast();

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [streamingStatusText, setStreamingStatusText] = useState('');
  const [replyToMessage, setReplyToMessage] = useState<ChatMessage | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  // 1. Cargar sesiones desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CHAT_SESSIONS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ChatSession[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      }
    } catch (err) {
      console.warn('Error leyendo sesiones de chat:', err);
    }

    // Si no existen sesiones, crear una inicial
    const initialSession: ChatSession = {
      id: `session-${Date.now()}`,
      title: 'Sesión de Consulta Académica',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      carreraId: studentSession?.careerId || 'desarrollo-software',
      materiaId: selectedMateria?.id,
      topicId: 1,
      modelId: 'gemini-2.5-flash',
      isModelLocked: false,
      messages: [
        {
          id: 'welcome-msg',
          sender: 'assistant',
          content:
            '¡Hola! Soy tu Mentor Académico Virtual. Puedes consultarme dudas teóricas, ejercicios prácticos o análisis de los documentos que hayas cargado en el módulo **Materias**.',
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

  // Crear nueva sesión
  const createNewSession = useCallback(
    (title?: string, initialMateriaId?: string): string => {
      const newId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newSession: ChatSession = {
        id: newId,
        title: title || `Consulta ${sessions.length + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        carreraId: studentSession?.careerId || 'desarrollo-software',
        materiaId: initialMateriaId || selectedMateria?.id,
        topicId: 1,
        modelId: 'gemini-2.5-flash',
        isModelLocked: false,
        messages: [
          {
            id: `msg-welcome-${Date.now()}`,
            sender: 'assistant',
            content:
              'Nueva sesión iniciada. Selecciona tu modelo de IA favorito antes de comenzar o haz una pregunta directa para consultar a tu Mentor.',
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
      success('Nueva sesión creada.', 'Mentor Chat');
      return newId;
    },
    [sessions.length, studentSession?.careerId, selectedMateria?.id, success]
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
      prev.map((s) => (s.id === id ? { ...s, title: trimmed, updatedAt: new Date().toISOString() } : s))
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

  // Enviar mensaje con streaming y citas de fuentes
  const sendMessage = useCallback(
    async (text: string) => {
      const cleanText = text.trim();
      if (!cleanText || !activeSession || isStreaming) return;

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
          ? replyToMessage.content.substring(0, 80) + (replyToMessage.content.length > 80 ? '...' : '')
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
                isModelLocked: true, // Bloqueo de modelo tras el primer mensaje
                messages: updatedMessages,
                updatedAt: new Date().toISOString(),
              }
            : s
        )
      );

      setReplyToMessage(null);
      setIsStreaming(true);
      setStreamingStatusText('El Mentor está analizando tus documentos y contexto...');

      try {
        // 2. Buscar fragmentos relevantes en documentos activos
        const relevantResults = findRelevantChunks(cleanText, documentosActivosParaChat, 3);
        const sourceCitations: SourceCitation[] = relevantResults.map((r, idx) => ({
          id: `citation-${idx}-${r.chunk.id}`,
          documentoId: r.documentId,
          documentoNombre: r.documentName,
          materiaNombre: r.materiaNombre,
          fragmento: r.chunk.text,
          similitud: r.score,
        }));

        if (sourceCitations.length > 0) {
          setStreamingStatusText(
            `Analizando ${sourceCitations.length} fragmento(s) en ${sourceCitations[0].documentoNombre}...`
          );
        }

        // 3. Preparar payload seguro para el backend NestJS (DTO estricto: studentId, subjectId, topicId, message)
        const studentId = studentSession?.id || 1;
        const currentMateria =
          materias.find((m) => m.id === activeSession.materiaId) || materias[0] || selectedMateria;
        const subjectId = currentMateria?.backendId || 101;
        const topicId = activeSession.topicId || 1001;

        // Contexto enriquecido solo si hay citas activas
        let messageToSend = cleanText;
        if (sourceCitations.length > 0) {
          const docSnippet = sourceCitations
            .map((c) => `[Fuente: ${c.documentoNombre}]: ${c.fragmento.substring(0, 300)}...`)
            .join('\n');
          messageToSend = `${cleanText}\n\n[Contexto Documental]:\n${docSnippet}`;
        }

        const modelConfig = AI_MODELS.find((m) => m.id === activeSession.modelId);

        // 4. Llamada al adaptador HTTP seguro
        const apiResponse = await api.sendMentorMessage(
          {
            studentId,
            subjectId,
            topicId,
            message: messageToSend,
          },
          modelConfig?.name
        );

        const fullAnswer =
          apiResponse?.answer ||
          'He procesado tu consulta. Revisa los puntos anteriores y házmelo saber si requieres más detalles.';

        // 5. Efecto de streaming progresivo en el cliente
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
          citas: sourceCitations.length > 0 ? sourceCitations : undefined,
        };

        // Agregar mensaje asistente vacío
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

        // Streaming paulatino por palabras
        const words = fullAnswer.split(' ');
        let currentStreamedText = '';

        for (let i = 0; i < words.length; i++) {
          currentStreamedText += (i === 0 ? '' : ' ') + words[i];

          // Actualizar mensaje con el fragmento acumulado
          const textChunk = currentStreamedText;
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== activeSession.id) return s;
              return {
                ...s,
                messages: s.messages.map((m) =>
                  m.id === assistantMsgId ? { ...m, content: textChunk } : m
                ),
              };
            })
          );

          // Pequeña pausa para fluidez visual tipo máquina de escribir
          if (words.length > 15) {
            await new Promise((res) => setTimeout(res, 20));
          }
        }
      } catch (err: any) {
        console.error('Error en envío de mensaje:', err);
        const errorMsg: ChatMessage = {
          id: `msg-err-${Date.now()}`,
          sender: 'assistant',
          content:
            'Hubo un problema al procesar la respuesta. Por favor intenta reformular tu pregunta.',
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
    [
      activeSession,
      isStreaming,
      replyToMessage,
      documentosActivosParaChat,
      studentSession?.id,
      materias,
      selectedMateria,
    ]
  );

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

        if (msg.citas && msg.citas.length > 0) {
          md += `**Fuentes y Documentos Citados:**\n`;
          for (const c of msg.citas) {
            md += `- 📄 **${c.documentoNombre}** (${c.materiaNombre}): _"${c.fragmento.substring(0, 200)}..."_\n`;
          }
          md += `\n`;
        }
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
        sendMessage,
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
