import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  BookOpen,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  GraduationCap,
  Plus,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import { CAREERS_CATALOG } from '../../data/careersCatalog';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  isMobileOpen: boolean;
  closeMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  toggleCollapse,
  isMobileOpen,
  closeMobile,
}) => {
  const { session, logout, switchCareer, backendOnline } = useAuth();
  const { createNewSession } = useChat();
  const [showCareerModal, setShowCareerModal] = useState(false);

  const navItems = [
    {
      to: '/',
      label: 'Página Principal',
      icon: Home,
      badge: null,
    },
    {
      to: '/materias',
      label: 'Materias',
      icon: BookOpen,
      badge: 'Biblioteca',
    },
    {
      to: '/mentor',
      label: 'Mentor Chat',
      icon: MessageSquare,
      badge: 'IA',
    },
  ];

  return (
    <>
      {/* Fondo móvil (Backdrop) */}
      {isMobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Contenedor Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-40 bg-[#0d0d0f] border-r border-zinc-800/80 flex flex-col transition-all duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        {/* Encabezado / Logo */}
        <div className="p-4 border-b border-zinc-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/40">
              <Sparkles className="text-white" size={20} />
            </div>
            {!isCollapsed && (
              <div className="leading-tight">
                <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  RETOS <span className="text-emerald-400">Mentor</span>
                </h1>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
                  Educación Técnica
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? 'Expandir barra lateral' : 'Plegar barra lateral'}
            className="hidden md:flex p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Indicador de Conexión */}
        <div className="px-4 py-2 border-b border-zinc-800/40 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2 text-zinc-400">
            <Radio
              size={12}
              className={backendOnline ? 'text-emerald-400 animate-pulse' : 'text-amber-500'}
            />
            {!isCollapsed && (
              <span>{backendOnline ? 'Backend Activo' : 'Modo Seguro (Local)'}</span>
            )}
          </div>
        </div>

        {/* Acceso Rápido: Nueva Consulta */}
        <div className="p-3">
          <button
            type="button"
            onClick={() => {
              createNewSession();
              closeMobile();
            }}
            title="Nueva Sesión (Ctrl+Shift+N)"
            className={`w-full flex items-center gap-3 p-2.5 rounded-xl font-medium text-xs text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all ${
              isCollapsed ? 'justify-center' : 'justify-start'
            }`}
          >
            <Plus size={18} className="shrink-0" />
            {!isCollapsed && <span>Nueva Consulta</span>}
          </button>
        </div>

        {/* Menú de Navegación Principal */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-md shadow-emerald-950/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/80 border border-transparent'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
              >
                <Icon size={20} className="shrink-0 group-hover:scale-110 transition-transform" />
                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Perfil del Estudiante y Selector de Carrera */}
        <div className="p-3 border-t border-zinc-800/60 bg-zinc-950/40">
          <button
            type="button"
            onClick={() => setShowCareerModal(true)}
            title="Cambiar Carrera Técnica"
            className={`w-full flex items-center gap-3 p-2 rounded-2xl hover:bg-zinc-800/50 transition-colors text-left group ${
              isCollapsed ? 'justify-center' : ''
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center shrink-0 text-emerald-400">
              <GraduationCap size={18} />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {session?.name || 'Estudiante'}
                </p>
                <p className="text-[10px] text-zinc-400 truncate">
                  {session?.careerName || 'Carrera Técnica'}
                </p>
              </div>
            )}
          </button>

          <div className="mt-2 flex items-center justify-between pt-2 border-t border-zinc-800/40">
            {!isCollapsed && (
              <span className="text-[10px] text-zinc-500 font-mono">v1.2.0</span>
            )}
            <button
              type="button"
              onClick={logout}
              title="Cerrar Sesión"
              className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors text-xs flex items-center gap-1.5 mx-auto"
            >
              <LogOut size={16} />
              {!isCollapsed && <span>Salir</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Modal para alternar Carrera Técnica */}
      {showCareerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#121215] border border-zinc-800 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <GraduationCap className="text-emerald-400" size={20} />
              Cambiar Carrera Técnica
            </h3>
            <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
              Elige una de las 4 carreras oficiales para actualizar tu plan de estudios y materias:
            </p>

            <div className="space-y-2 mb-6">
              {CAREERS_CATALOG.map((career) => {
                const isSelected = session?.careerId === career.id;
                return (
                  <button
                    key={career.id}
                    type="button"
                    onClick={() => {
                      switchCareer(career.id);
                      setShowCareerModal(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-md shadow-emerald-950/20'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{career.nombre}</span>
                      {isSelected && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                          Activa
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowCareerModal(false)}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
