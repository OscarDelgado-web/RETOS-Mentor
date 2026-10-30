import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Radio,
  User,
  Hash,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { CAREERS_CATALOG, CAREER_DEFAULT_STUDENT } from '../data/careersCatalog';

export const LoginPage: React.FC = () => {
  const [studentName, setStudentName] = useState('Estudiante Piloto');
  const [selectedCareerId, setSelectedCareerId] = useState<string>(CAREERS_CATALOG[0].id);
  const [studentIdInput, setStudentIdInput] = useState<string>('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, backendOnline } = useAuth();
  const { success, info } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;

    setIsSubmitting(true);
    try {
      const parsedId = parseInt(studentIdInput, 10);
      const customId = !isNaN(parsedId) && parsedId > 0 ? parsedId : 1;

      await login(studentName, selectedCareerId, customId);
      success(`¡Bienvenido, ${studentName}!`, 'Sesión Iniciada');
      navigate('/');
    } catch {
      info('Iniciando sesión en modo local seguro.');
      navigate('/');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-center items-center p-4 sm:p-6 md:p-10 relative overflow-hidden font-sans">
      {/* Fondo estético con sutiles destellos */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Cabecera del Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-linear-to-tr from-emerald-600 to-teal-400 shadow-xl shadow-emerald-950/50 mb-4 border border-emerald-400/30">
            <Sparkles className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-2">
            RETOS <span className="text-emerald-400">Mentor</span>
          </h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Plataforma de mentoría académica inteligente y gestión de materias técnicas.
          </p>
        </div>

        {/* Tarjeta de Formulario */}
        <div className="bg-[#111114] border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Indicador de Estado Backend */}
          <div className="mb-6 flex items-center justify-between p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-[11px]">
            <div className="flex items-center gap-2 text-zinc-400">
              <Radio
                size={14}
                className={backendOnline ? 'text-emerald-400 animate-pulse' : 'text-amber-500'}
              />
              <span>Servidor Backend NestJS:</span>
            </div>
            <span
              className={`font-semibold px-2 py-0.5 rounded-full ${
                backendOnline
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'bg-amber-500/15 text-amber-400'
              }`}
            >
              {backendOnline ? 'Conectado (Puerto 3000)' : 'Modo Seguro (Local)'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo: Nombre del Estudiante */}
            <div>
              <label
                htmlFor="student-name"
                className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5"
              >
                <User size={14} className="text-emerald-400" />
                Nombre del Estudiante
              </label>
              <input
                id="student-name"
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Ej. Enrique Delgado"
                className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Campo: Selector de Carrera Técnica (4 Carreras) */}
            <div>
              <label
                htmlFor="career-select"
                className="block text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5"
              >
                <GraduationCap size={14} className="text-emerald-400" />
                Carrera Técnica
              </label>
              <select
                id="career-select"
                value={selectedCareerId}
                onChange={(e) => {
                  const newCareerId = e.target.value;
                  setSelectedCareerId(newCareerId);
                  const found = CAREERS_CATALOG.find((c) => c.id === newCareerId);
                  if (found?.backendId && CAREER_DEFAULT_STUDENT[found.backendId]) {
                    setStudentIdInput(String(CAREER_DEFAULT_STUDENT[found.backendId].id));
                  }
                }}
                className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
              >
                {CAREERS_CATALOG.map((career) => (
                  <option key={career.id} value={career.id} className="bg-zinc-900 text-white">
                    {career.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo: ID de Estudiante (Vinculación Backend) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="student-id"
                  className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Hash size={14} className="text-emerald-400" />
                  ID de Estudiante (Backend)
                </label>
                <span className="text-[10px] text-zinc-500 font-mono">Opcional</span>
              </div>
              <input
                id="student-id"
                type="number"
                min="1"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                className="w-full bg-zinc-900/80 border border-zinc-700/80 rounded-2xl px-4 py-3 text-sm text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>

            {/* Botón de Entrada */}
            <button
              type="submit"
              disabled={isSubmitting || !studentName.trim()}
              className="w-full py-3.5 px-6 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-200 disabled:opacity-50 cursor-pointer active:scale-98"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Ingresar al Portal Académico</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Resumen de Seguridad */}
        <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-zinc-500 text-center">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Autenticación y persistencia segura en `localStorage` (retos_mentor_session)</span>
        </div>
      </div>
    </div>
  );
};
