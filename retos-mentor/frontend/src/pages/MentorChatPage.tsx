import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FileText,
  CornerDownRight,
  X,
  Search,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMaterias } from '../context/MateriasContext';
import { useChat, AI_MODELS } from '../context/ChatContext';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import type { AIModelId } from '../types';

export const MentorChatPage: React.FC = () => {
  const { session } = useAuth();
  const { documentosActivosParaChat, previewDocument, openPreview, closePreview, documentos } =
    useMaterias();
  const {
    activeSession,
    activeSessionId,
    setActiveSessionId,
    createNewSession,
    deleteSession,
    renameSession,
    changeSessionModel,
    sendMessage,
    isStreaming,
    streamingStatusText,
    replyToMessage,
    setReplyToMessage,
    searchFilter,
    setSearchFilter,
    filteredSessions,
    exportSessionToMarkdown,
  } = useChat();

  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState('');
  const [isSessionDrawerOpen, setIsSessionDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll al final del chat cuando llegan mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isStreaming]);

  // Manejo de envío
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isStreaming) return;
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

  // Abrir vista previa de documento citado
  const handleCitationClick = (documentoId: string) => {
    const docFound = documentos.find((d) => d.id === documentoId);
    if (docFound) {
      openPreview(docFound);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-60px)] min-h-0 bg-[#09090b] text-zinc-100 overflow-hidden font-sans">
      {/* ======================================================== */}
      {/* 1. PANEL LATERAL DE SESIONES (MULTISESIÓN & BÚSQUEDA)     */}
      {/* ======================================================== */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-72 sm:w-80 bg-[#0d0d10] border-r border-zinc-800/80 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isSessionDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cabecera del Panel */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare size={18} className="text-emerald-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-white">
              Sesiones de Consulta
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => createNewSession()}
              title="Nueva Consulta (Ctrl+Shift+N)"
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

        {/* Resumen de Documentos Activos en el Chat */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40 text-xs">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck size={14} className="text-emerald-400" />
              Documentos Activos
            </span>
            <span className="font-bold text-emerald-400 font-mono">
              {documentosActivosParaChat.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/materias')}
            className="text-[10px] text-zinc-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
          >
            Administrar en Materias <ExternalLink size={10} />
          </button>
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
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Barra Superior del Chat */}
        <header className="px-4 py-3 bg-[#0d0d10] border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
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
              <p className="text-[11px] text-zinc-400">
                {session?.careerName} · {activeSession?.messages.length || 0} mensajes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Selector de Modelos de IA con Bloqueo tras el primer mensaje */}
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl px-3 py-1.5">
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
                className="bg-transparent text-xs text-zinc-200 font-semibold focus:outline-none cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {AI_MODELS.map((m) => (
                  <option key={m.id} value={m.id} className="bg-zinc-900 text-white">
                    {m.name} ({m.provider})
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
              <span className="hidden sm:inline">Exportar (.md)</span>
            </button>
          </div>
        </header>

        {/* Flujo de Mensajes */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {activeSession?.messages.map((msg, index) => {
            const isUser = msg.sender === 'user';

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
                <div className={`space-y-2 min-w-0 max-w-[85%] sm:max-w-[75%]`}>
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
                    {msg.content}
                  </div>

                  {/* Citas de Fuentes y Documentos Asociados */}
                  {msg.citas && msg.citas.length > 0 && (
                    <div className="p-3 rounded-2xl bg-[#0f1115] border border-zinc-800/90 space-y-2">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <FileText size={12} className="text-emerald-400" />
                        <span>Fuentes Citadas del Módulo Materias ({msg.citas.length})</span>
                      </div>
                      <div className="space-y-1.5">
                        {msg.citas.map((cita) => (
                          <div
                            key={cita.id}
                            onClick={() => handleCitationClick(cita.documentoId)}
                            className="p-2 rounded-xl bg-zinc-900/60 border border-zinc-800 hover:border-emerald-500/50 cursor-pointer text-left transition-colors group/cite"
                          >
                            <div className="flex items-center justify-between text-[10px] text-emerald-400 font-semibold mb-0.5">
                              <span className="truncate group-hover/cite:underline">
                                📄 {cita.documentoNombre}
                              </span>
                              <span className="text-zinc-500 font-mono text-[9px]">
                                {cita.materiaNombre}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400 line-clamp-2 italic">
                              "{cita.fragmento}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pie de Mensaje: Timestamp y Botón Responder */}
                  <div
                    className={`flex items-center gap-3 text-[10px] text-zinc-500 px-1 ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    <button
                      type="button"
                      onClick={() => setReplyToMessage(msg)}
                      className="hover:text-emerald-400 flex items-center gap-1 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <CornerDownRight size={10} /> Responder
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Indicador de Streaming / Pensando */}
          {isStreaming && (
            <div className="flex items-center gap-3 text-xs text-emerald-400 animate-pulse bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-2xl max-w-md">
              <Sparkles size={16} className="shrink-0 animate-spin" />
              <span>{streamingStatusText || 'El Mentor está analizando tus documentos...'}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Área de Entrada de Mensaje */}
        <div className="p-4 bg-[#0d0d10] border-t border-zinc-800/80 space-y-2">
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
              placeholder="Escribe tu consulta al Mentor... (Presiona Enter para enviar, Shift+Enter para salto de línea)"
              className="flex-1 bg-zinc-900/90 border border-zinc-700/80 rounded-2xl p-3 pr-12 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none transition-all"
            />

            <button
              type="submit"
              disabled={!inputText.trim() || isStreaming}
              aria-label="Enviar mensaje"
              className="h-11 w-11 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-lg shadow-emerald-500/20"
            >
              <Send size={18} />
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-zinc-500 px-1">
            <span>
              Modelo activo:{' '}
              <strong className="text-zinc-400">
                {AI_MODELS.find((m) => m.id === activeSession?.modelId)?.name}
              </strong>
            </span>
            <span>
              {documentosActivosParaChat.length > 0
                ? `${documentosActivosParaChat.length} documento(s) activos para contexto`
                : 'Sin documentos activos (consulta general)'}
            </span>
          </div>
        </div>
      </div>

      {/* Modal de Vista Previa para Citas de Documentos */}
      <DocumentPreviewModal document={previewDocument} onClose={closePreview} />
    </div>
  );
};
