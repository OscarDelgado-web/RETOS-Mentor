import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Search, X, BookOpen, MessageSquare, Plus } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { useMaterias } from '../../context/MateriasContext';

export const AppLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { session } = useAuth();
  const { sessions, setActiveSessionId, createNewSession } = useChat();
  const { materias, setSelectedMateria } = useMaterias();
  const navigate = useNavigate();

  // Escucha de atajos de teclado globales
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + B o Cmd + B: Alternar barra lateral
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }

      // Ctrl + K o Cmd + K: Búsqueda rápida
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }

      // Ctrl + Shift + N: Nueva sesión
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createNewSession();
        navigate('/mentor');
      }

      // Escape cierra modal de búsqueda
      if (e.key === 'Escape') {
        setShowSearchModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createNewSession, navigate]);

  // Resultados de búsqueda rápida
  const filteredMaterias = materias.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredChatSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col md:flex-row antialiased selection:bg-emerald-500 selection:text-white">
      {/* Barra Lateral */}
      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapse={() => setIsCollapsed((prev) => !prev)}
        isMobileOpen={isMobileOpen}
        closeMobile={() => setIsMobileOpen(false)}
      />

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Cabecera Móvil y Barra Superior */}
        <header className="sticky top-0 z-30 bg-[#0d0d0f]/80 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              aria-label="Abrir menú de navegación"
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl md:hidden transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
              <span className="font-semibold text-zinc-200">
                {session?.careerName || 'Programa Técnico'}
              </span>
              <span className="text-zinc-600">/</span>
              <span className="text-emerald-400 font-mono text-[11px]">
                Estudiante #{session?.id || 1}
              </span>
            </div>
          </div>

          {/* Buscador Rápido y Atajos */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowSearchModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-all text-xs"
            >
              <Search size={14} />
              <span className="hidden sm:inline">Buscar materia o chat...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-zinc-800 border border-zinc-700 rounded text-zinc-400 font-mono">
                Ctrl K
              </kbd>
            </button>
          </div>
        </header>

        {/* Vista Renderizada por la Ruta Activa */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Modal de Búsqueda Rápida (Ctrl + K) */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#121215] border border-zinc-800 rounded-3xl max-w-xl w-full p-4 shadow-2xl">
            <div className="relative mb-4">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <input
                type="text"
                autoFocus
                placeholder="Buscar materia, tema o conversación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl py-3 pl-11 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setShowSearchModal(false)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-4 pr-1">
              {/* Sección Materias */}
              <div>
                <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2 px-2 flex items-center gap-1.5">
                  <BookOpen size={12} className="text-emerald-400" />
                  Materias ({filteredMaterias.length})
                </h4>
                <div className="space-y-1">
                  {filteredMaterias.slice(0, 5).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedMateria(m);
                        setShowSearchModal(false);
                        navigate('/materias');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/70 text-left transition-colors group"
                    >
                      <span className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-400">
                        {m.name}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {m.codigo || 'MAT'}
                      </span>
                    </button>
                  ))}
                  {filteredMaterias.length === 0 && (
                    <p className="text-xs text-zinc-500 px-2 py-1">
                      No se encontraron materias coincidentes.
                    </p>
                  )}
                </div>
              </div>

              {/* Sección Conversaciones de Mentor Chat */}
              <div className="pt-2 border-t border-zinc-800/60">
                <div className="flex items-center justify-between mb-2 px-2">
                  <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare size={12} className="text-emerald-400" />
                    Sesiones de Chat ({filteredChatSessions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      createNewSession();
                      setShowSearchModal(false);
                      navigate('/mentor');
                    }}
                    className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <Plus size={10} /> Nueva
                  </button>
                </div>
                <div className="space-y-1">
                  {filteredChatSessions.slice(0, 5).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setActiveSessionId(s.id);
                        setShowSearchModal(false);
                        navigate('/mentor');
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-zinc-800/70 text-left transition-colors group"
                    >
                      <span className="text-xs text-zinc-200 truncate group-hover:text-emerald-400">
                        {s.title}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(s.updatedAt).toLocaleDateString()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 px-2">
              <span>Navega con ratón o teclado</span>
              <kbd className="px-1.5 py-0.5 bg-zinc-800 border border-zinc-700 rounded text-[10px]">
                ESC para cerrar
              </kbd>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
