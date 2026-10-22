import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Lock,
  Unlock,
  Download,
  Send,
  Sparkles,
  Bot,
  User,
  CornerDownRight,
  X,
  Search,
  Check,
  AlertTriangle,
  RotateCcw,
  ThumbsUp,
  ThumbsDown,
  Layers,
  ChevronDown,
  ChevronUp,
  BookOpen,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useChat, AI_MODELS } from '../context/ChatContext';
import { HeroContextSelector } from '../components/HeroContextSelector';
import { api } from '../services/api';
import type { AIModelId } from '../types';
import type { Career, Subject, Topic } from '../types/api';

export const MentorChatPage: React.FC = () => {
  const { session } = useAuth();
  const {
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
    streamingStatusText,
    replyToMessage,
    setReplyToMessage,
    searchFilter,
    setSearchFilter,
    filteredSessions,
    exportSessionToMarkdown,
  } = useChat();

  const [inputText, setInputText] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [isSessionDrawerOpen, setIsSessionDrawerOpen] = useState(false);
  const [showContextSelector, setShowContextSelector] = useState(true);

  // Estados para el selector en cascada (HeroContextSelector)
  const [careers, setCareers] = useState<Career[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 1. Cargar carreras al montar
  useEffect(() => {
    let isMounted = true;
    setIsLoadingCatalog(true);
    api.getCareers()
      .then((data) => {
        if (isMounted) {
          setCareers(data);
          setIsLoadingCatalog(false);
        }
      })
      .catch((err) => {
        console.error('Error cargando carreras:', err);
        if (isMounted) setIsLoadingCatalog(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Contexto académico actual de la sesión
  const selectedCareer: number | '' =
    activeSession?.careerBackendId ?? session?.careerBackendId ?? 1;
  const selectedSubject: number | '' = activeSession?.subjectId ?? '';
  const selectedTopic: number | '' = activeSession?.topicId ?? '';

  // 2. Cargar materias cuando cambia la carrera seleccionada
  useEffect(() => {
    if (!selectedCareer) {
      setSubjects([]);
      setTopics([]);
      return;
    }
    let isMounted = true;
    setIsLoadingCatalog(true);
    api.getSubjects(Number(selectedCareer))
      .then((data) => {
        if (isMounted) {
          setSubjects(data);
          setIsLoadingCatalog(false);
        }
      })
      .catch((err) => {
        console.error('Error cargando materias:', err);
        if (isMounted) setIsLoadingCatalog(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedCareer]);

  // 3. Cargar temas cuando cambia la materia seleccionada
  useEffect(() => {
    if (!selectedSubject) {
      setTopics([]);
      return;
    }
    let isMounted = true;
    setIsLoadingCatalog(true);
    api.getTopics(Number(selectedSubject))
      .then((data) => {
        if (isMounted) {
          setTopics(data);
          setIsLoadingCatalog(false);
        }
      })
      .catch((err) => {
        console.error('Error cargando temas:', err);
        if (isMounted) setIsLoadingCatalog(false);
      });
    return () => {
      isMounted = false;
    };
  }, [selectedSubject]);

  // Auto-scroll al final del chat cuando llegan mensajes
  useEffect(() => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeSession?.messages, isStreaming]);

  // Manejadores en cascada
  const handleCareerChange = (id: number) => {
    // Al cambiar carrera se limpian asignatura y tema
    setSessionAcademicContext(id, '', '');
  };

  const handleSubjectChange = (id: number) => {
    // Al cambiar asignatura se limpia tema
    setSessionAcademicContext(selectedCareer, id, '');
  };

  const handleTopicChange = (id: number) => {
    setSessionAcademicContext(selectedCareer, selectedSubject, id);
  };

  // Manejo de envío
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isStreaming || inputText.length > 2000 || !selectedTopic) return;
    const msg = inputText;
    setInputText('');
    await sendMessage(msg);
    textareaRef.current?.focus();
  };

  // Manejo de teclado: Enter para enviar, Shift+Enter para salto de línea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Guardar edición de título de sesión
  const handleSaveTitle = (sessionId: string) => {
    if (editTitleInput.trim()) {
      renameSession(sessionId, editTitleInput.trim());
    }
    setEditingSessionId(null);
  };

  // Nombres descriptivos del contexto activo
  const currentCareer = careers.find((c) => c.id === selectedCareer);
  const currentSubject = subjects.find((s) => s.id === selectedSubject);
  const currentTopic = topics.find((t) => t.id === selectedTopic);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-60px)] min-h-0 bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      {/* ======================================================== */}
      {/* 1. PANEL LATERAL DE SESIONES (HISTORIAL MULTISESIÓN)     */}
      {/* ======================================================== */}
      <aside
        aria-label="Panel de sesiones previas"
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 sm:w-80 bg-[#0d0d10] border-r border-zinc-800/80 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isSessionDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cabecera del Panel */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Historial de Sesiones
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                createNewSession(
                  undefined,
                  typeof selectedCareer === 'number' ? selectedCareer : 1,
                  typeof selectedSubject === 'number' ? selectedSubject : 1,
                  typeof selectedTopic === 'number' ? selectedTopic : 1
                );
              }}
              title="Nueva Consulta"
              className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-colors"
            >
              <Plus size={16} />
            </button>
            <button
              type="button"
              onClick={() => setIsSessionDrawerOpen(false)}
              className="p-1.5 text-zinc-400 hover:text-white lg:hidden"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Buscador de Sesiones */}
        <div className="p-3 border-b border-zinc-800/60">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              placeholder="Buscar en conversaciones..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Lista de Sesiones */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredSessions.map((s) => {
            const isActive = s.id === activeSessionId;
            const isEditing = editingSessionId === s.id;
            const modelUsed = AI_MODELS.find((m) => m.id === s.modelId);

            return (
              <div
                key={s.id}
                onClick={() => {
                  if (!isEditing) {
                    setActiveSessionId(s.id);
                    setIsSessionDrawerOpen(false);
                  }
                }}
                className={`group relative p-2.5 rounded-2xl border transition-all text-left cursor-pointer flex flex-col gap-1 ${
                  isActive
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-white shadow-md shadow-emerald-950/20'
                    : 'bg-zinc-900/30 border-zinc-800/60 text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                }`}
              >
                {isEditing ? (
                  <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      autoFocus
                      value={editTitleInput}
                      onChange={(e) => setEditTitleInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveTitle(s.id);
                        if (e.key === 'Escape') setEditingSessionId(null);
                      }}
                      className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-2 py-1 text-xs text-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveTitle(s.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSessionId(null)}
                      className="p-1 text-zinc-400 hover:text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold truncate flex-1 pr-2">{s.title}</p>
                    <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingSessionId(s.id);
                          setEditTitleInput(s.title);
                        }}
                        title="Renombrar sesión"
                        className="p-1 text-zinc-400 hover:text-white"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(s.id);
                        }}
                        title="Eliminar sesión"
                        className="p-1 text-zinc-400 hover:text-rose-400"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span className="truncate max-w-[140px]">{modelUsed?.name || s.modelId}</span>
                  <span className="flex items-center gap-1">
                    {s.isModelLocked && <Lock size={10} className="text-amber-400" />}
                    <span>{s.messages.length} msgs</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen inferior del historial */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40 text-[11px] text-zinc-400 flex items-center justify-between">
          <span>{sessions.length} sesión(es) guardadas</span>
          <span className="font-mono text-emerald-400">Local DB</span>
        </div>
      </aside>

      {/* Backdrop móvil */}
      {isSessionDrawerOpen && (
        <div
          onClick={() => setIsSessionDrawerOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-20 lg:hidden"
        />
      )}

      {/* ======================================================== */}
      {/* 2. ÁREA PRINCIPAL DE CONVERSACIÓN                        */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Barra Superior del Chat */}
        <header className="px-4 py-3 bg-[#0d0d10] border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSessionDrawerOpen(true)}
              className="lg:hidden p-1.5 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800"
            >
              <MessageSquare size={16} />
            </button>

            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                {activeSession?.title || 'Sesión de Consulta'}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                <span>{currentCareer?.name || session?.careerName}</span>
                {currentSubject && (
                  <>
                    <span className="text-zinc-600">/</span>
                    <span className="text-zinc-300 font-medium">{currentSubject.name}</span>
                  </>
                )}
                {currentTopic && (
                  <>
                    <span className="text-zinc-600">/</span>
                    <span className="text-emerald-400 font-semibold">{currentTopic.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botón para alternar visibilidad del selector de contexto */}
            <button
              type="button"
              onClick={() => setShowContextSelector((prev) => !prev)}
              title={showContextSelector ? 'Ocultar selector de contexto' : 'Mostrar selector de contexto'}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition-colors"
            >
              <Layers size={14} className="text-emerald-400" />
              <span className="hidden sm:inline">Contexto</span>
              {showContextSelector ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {/* Selector de Modelos de IA con Bloqueo tras el primer mensaje */}
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl px-2.5 py-1.5">
              {activeSession?.isModelLocked ? (
                <span title="Modelo bloqueado tras iniciar la conversación">
                  <Lock size={14} className="text-amber-400 shrink-0" />
                </span>
              ) : (
                <span title="Modelo modificable antes del primer mensaje">
                  <Unlock size={14} className="text-emerald-400 shrink-0" />
                </span>
              )}

              <select
                disabled={activeSession?.isModelLocked}
                value={activeSession?.modelId || 'gemini-2.5-flash'}
                onChange={(e) => changeSessionModel(e.target.value as AIModelId)}
                aria-label="Seleccionar modelo de IA"
                className="bg-transparent text-xs text-zinc-200 font-semibold focus:outline-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed max-w-[120px] sm:max-w-none"
              >
                {AI_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-zinc-900 text-white">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Botón de Exportación Markdown */}
            <button
              type="button"
              onClick={() => exportSessionToMarkdown()}
              title="Descargar conversación en formato Markdown (.md)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <Download size={14} className="text-emerald-400" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </header>

        {/* ======================================================== */}
        {/* SELECTOR EN CASCADA REINTEGRADO (BUG-001)               */}
        {/* ======================================================== */}
        {showContextSelector && (
          <div className="p-3 sm:p-4 bg-zinc-950/60 border-b border-zinc-800/80 shrink-0 animate-in fade-in">
            <HeroContextSelector
              careers={careers}
              subjects={subjects}
              topics={topics}
              selectedCareer={selectedCareer}
              selectedSubject={selectedSubject}
              selectedTopic={selectedTopic}
              onCareerChange={handleCareerChange}
              onSubjectChange={handleSubjectChange}
              onTopicChange={handleTopicChange}
              isLoading={isLoadingCatalog}
              studentName={session?.name || 'Estudiante Demo'}
              compact={true}
            />
          </div>
        )}

        {/* Alerta de Error Visible con Botón de Reintentar (BUG-005 y QA-09) */}
        {lastError && (
          <div className="mx-4 my-2 p-3 sm:p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-200 text-xs flex flex-wrap items-center justify-between gap-3 shrink-0 animate-in fade-in">
            <div className="flex items-center gap-3 min-w-0">
              <AlertTriangle size={18} className="text-rose-400 shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-mono text-[10px] font-bold">
                    {lastError.status ? `HTTP ${lastError.status}` : 'Error de Conexión'}
                  </span>
                  <span className="font-semibold text-white">Error al consultar el Mentor</span>
                </div>
                <p className="text-rose-300/80 text-[11px] mt-0.5 truncate">{lastError.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-auto">
              <button
                type="button"
                onClick={() => retryLastMessage()}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <RotateCcw size={13} /> Reintentar
              </button>
              <button
                type="button"
                onClick={clearLastError}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Flujo de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Mensaje de guía si no hay tema seleccionado */}
          {!selectedTopic && (
            <div className="max-w-xl mx-auto p-4 rounded-3xl bg-linear-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 text-xs flex items-start gap-3">
              <Sparkles size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-300">Contexto académico requerido</p>
                <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
                  Por favor selecciona tu <strong>Asignatura</strong> y <strong>Tema</strong> en el selector superior para habilitar el envío de preguntas y permitir que el Mentor adapte sus respuestas a tu programa de estudios.
                </p>
              </div>
            </div>
          )}

          {activeSession?.messages.map((msg, index) => {
            const isUser = msg.sender === 'user';
            const messageFeedback = activeSession.feedback?.[msg.id];

            return (
              <div
                key={msg.id || index}
                className={`flex gap-3 sm:gap-4 max-w-3xl ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                } group`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 text-sm font-bold shadow-md ${
                    isUser
                      ? 'bg-linear-to-tr from-emerald-600 to-teal-500 text-zinc-950'
                      : 'bg-zinc-800 border border-zinc-700/80 text-emerald-400'
                  }`}
                >
                  {isUser ? <User size={18} /> : <Bot size={18} />}
                </div>

                {/* Burbuja de Mensaje */}
                <div className="space-y-1.5 min-w-0 max-w-[85%] sm:max-w-[75%]">
                  {/* Respuesta a mensaje previo si aplica */}
                  {msg.replyToSnippet && (
                    <div className="text-[11px] px-3 py-1.5 rounded-xl bg-zinc-900/80 border-l-2 border-emerald-500 text-zinc-400 truncate">
                      Cita: "{msg.replyToSnippet}"
                    </div>
                  )}

                  <div
                    className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-xs shadow-lg shadow-emerald-950/20'
                        : 'bg-[#141418] border border-zinc-800/80 text-zinc-200 rounded-tl-xs shadow-md'
                    }`}
                  >
                    <div>{msg.content}</div>

                    {/* Sección de Fuentes Académicas (AC-06 / AC-08) */}
                    {!isUser && msg.sources && msg.sources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-zinc-800/80 space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400">
                          <BookOpen size={13} />
                          <span>Fuentes Académicas</span>
                        </div>
                        <div className="grid gap-2">
                          {msg.sources.map((source, sIdx) => (
                            <div
                              key={source.id || sIdx}
                              className="p-2.5 rounded-2xl bg-zinc-900/90 border border-zinc-800/80 text-xs flex flex-col gap-1"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-semibold text-zinc-100">{source.title}</span>
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium shrink-0 underline underline-offset-2"
                                >
                                  <span>Consultar</span>
                                  <ExternalLink size={11} />
                                </a>
                              </div>
                              {source.description && (
                                <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
                                  {source.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pie de Mensaje: Timestamp, Responder y Valoración (P1: AC-09) */}
                  <div
                    className={`flex items-center gap-3 text-[10px] text-zinc-500 px-1 ${
                      isUser ? 'justify-end' : 'justify-between'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{msg.timestamp}</span>
                      <button
                        type="button"
                        onClick={() => setReplyToMessage(msg)}
                        className="hover:text-emerald-400 flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <CornerDownRight size={10} /> Responder
                      </button>
                    </div>

                    {/* Botones de valoración útil / no útil (P1) */}
                    {!isUser && msg.id !== 'welcome-msg' && !msg.content.startsWith('⚠️') && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => rateMessage(msg.id, 'helpful')}
                          aria-label="Respuesta útil"
                          title="Marcar respuesta como útil"
                          className={`p-1 rounded-md text-[10px] flex items-center gap-1 transition-colors ${
                            messageFeedback === 'helpful'
                              ? 'text-emerald-400 bg-emerald-500/20 font-bold'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <ThumbsUp size={11} /> <span>Útil</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => rateMessage(msg.id, 'unhelpful')}
                          aria-label="Respuesta no útil"
                          title="Marcar respuesta como no útil"
                          className={`p-1 rounded-md text-[10px] flex items-center gap-1 transition-colors ${
                            messageFeedback === 'unhelpful'
                              ? 'text-rose-400 bg-rose-500/20 font-bold'
                              : 'text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <ThumbsDown size={11} /> <span>No útil</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Indicador de Streaming / Pensando */}
          {isStreaming && (
            <div className="flex items-center gap-3 text-xs text-emerald-400 animate-pulse bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-2xl max-w-md">
              <Sparkles size={16} className="shrink-0 animate-spin" />
              <span>{streamingStatusText || 'El Mentor Académico está analizando tu consulta...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Área de Entrada de Mensaje */}
        <div className="p-3 sm:p-4 bg-[#0d0d10] border-t border-zinc-800/80 space-y-2 shrink-0">
          {/* Indicador de respuesta citada */}
          {replyToMessage && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
              <span className="truncate pr-2">
                Respondiendo a: <em>"{replyToMessage.content.substring(0, 60)}..."</em>
              </span>
              <button
                type="button"
                onClick={() => setReplyToMessage(null)}
                className="text-zinc-400 hover:text-white"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <form onSubmit={handleSend} className="relative flex items-end gap-2">
            <textarea
              ref={textareaRef}
              rows={2}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                !selectedTopic
                  ? 'Selecciona Carrera, Asignatura y Tema en el panel superior para consultar...'
                  : 'Escribe tu consulta al Mentor... (Presiona Enter para enviar, Shift+Enter para salto de línea)'
              }
              className="flex-1 bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-3 pr-12 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none transition-all"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isStreaming || inputText.length > 2000 || !selectedTopic}
              aria-label="Enviar mensaje"
              className="h-11 w-11 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Send size={18} />
            </button>
          </form>

          {/* Pie del formulario: validación de caracteres y tema activo */}
          <div className="flex flex-wrap items-center justify-between text-[10px] text-zinc-500 px-1 gap-2">
            <span className="flex items-center gap-2">
              <span>
                Modelo:{' '}
                <strong className="text-zinc-400">
                  {AI_MODELS.find((m) => m.id === activeSession?.modelId)?.name}
                </strong>
              </span>
              {currentTopic && (
                <span className="text-emerald-400 font-mono">
                  · Tema activo: {currentTopic.name}
                </span>
              )}
            </span>

            <span
              className={
                inputText.length > 2000
                  ? 'text-rose-400 font-bold'
                  : inputText.length > 1800
                  ? 'text-amber-400'
                  : 'text-zinc-500'
              }
            >
              {inputText.length} / 2,000 caracteres
              {inputText.length > 2000 && ' (¡Límite superado!)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
