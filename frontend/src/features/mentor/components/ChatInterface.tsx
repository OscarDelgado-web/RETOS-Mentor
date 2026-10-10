import { useState, useRef, useEffect } from 'react';
import type { MentorMessageResponse } from '../../../types/api';
import { fetchApi } from '../../../config/api';

// Añadimos las extensiones al estado local de mensajes
interface Message {
  text: string;
  sender: 'user' | 'mentor';
  extensionType?: 'text' | 'code_snippet' | 'concept_card';
  extensionData?: any;
}

export const ChatInterface = ({ topicId }: { topicId: number }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { text: '¡Hola! Soy tu Mentor Virtual. Selecciona un tema de la propuesta y hazme una pregunta.', sender: 'mentor' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim()) return;

    const currentMsg = message;
    setMessages(prev => [...prev, { text: currentMsg, sender: 'user' }]);
    setMessage('');
    setIsTyping(true);

    try {
      const res = await fetchApi<MentorMessageResponse>('/mentor/messages', {
        method: 'POST',
        body: JSON.stringify({ message: currentMsg, topicId })
      });
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        text: res.answer, 
        sender: 'mentor',
        extensionType: res.extensionType,
        extensionData: res.extensionData
      }]);
    } catch (error) {
      setIsTyping(false);
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-137.5 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fade-in-up transition-all">
      <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white shadow-md z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 font-bold text-xl shadow-inner">
            M
          </div>
          <div>
            <h3 className="font-semibold text-lg leading-tight">Tutor Virtual Académico</h3>
            <p className="text-blue-100 text-xs">Módulo 1: Fundamentos de Programación</p>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-y-auto bg-slate-50 space-y-5">
        {messages.map((m, i) => (
          <div key={i} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in-up`}>
            {/* Burbuja de Texto Base */}
            <div className={`max-w-[80%] px-5 py-3 rounded-2xl shadow-sm text-sm md:text-base ${
              m.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-sm' 
                : 'bg-white border border-gray-200 text-gray-700 rounded-tl-sm'
            }`}>
              {m.text}
            </div>
            
            {/* Extensión: Tarjeta de Concepto */}
            {m.extensionType === 'concept_card' && m.extensionData && (
              <div className="max-w-[80%] mt-2 bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 animate-fade-in-up">
                <div className="bg-slate-900 px-4 py-2 flex items-center justify-between border-b border-slate-700">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">{m.extensionData.title}</span>
                  <span className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div></span>
                </div>
                <div className="p-4 bg-[#1E1E1E]">
                  <pre className="text-sm font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                    <code>{m.extensionData.code}</code>
                  </pre>
                </div>
                <div className="px-4 py-3 bg-blue-900/40 border-t border-slate-700">
                  <p className="text-xs text-blue-200 flex items-start gap-2">
                    <span className="text-lg">💡</span> {m.extensionData.tip}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-fade-in-up">
            <div className="bg-white border border-gray-200 text-gray-400 rounded-2xl rounded-tl-sm px-5 py-3 shadow-sm flex gap-1.5">
              <span className="animate-pulse-fast">●</span>
              <span className="animate-pulse-fast delay-75">●</span>
              <span className="animate-pulse-fast delay-150">●</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="bg-white p-4 border-t border-gray-100 flex gap-3 items-center">
        <input 
          type="text"
          value={message} 
          onChange={e => setMessage(e.target.value)} 
          placeholder="Escribe tu duda o solicita un ejercicio..." 
          className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-6 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
        />
        <button 
          type="submit" 
          disabled={!message.trim() || isTyping}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};