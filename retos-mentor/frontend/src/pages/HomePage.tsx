import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  BookOpen,
  MessageSquare,
  GraduationCap,
  Target,
  Briefcase,
  Clock,
  ChevronRight,
  Award,
  CheckCircle2,
  FolderOpen,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMaterias } from '../context/MateriasContext';
import { CAREERS_CATALOG } from '../data/careersCatalog';

export const HomePage: React.FC = () => {
  const { session, switchCareer } = useAuth();
  const { materias, documentos } = useMaterias();
  const navigate = useNavigate();

  // Carrera actualmente seleccionada para explorar en el panel
  const [activeCareerId, setActiveCareerId] = useState<string>(
    session?.careerId || CAREERS_CATALOG[0].id
  );

  const selectedCareerData =
    CAREERS_CATALOG.find((c) => c.id === activeCareerId) || CAREERS_CATALOG[0];

  const handleSelectCareer = (careerId: string) => {
    setActiveCareerId(careerId);
    switchCareer(careerId);
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 max-w-7xl mx-auto w-full space-y-10">
      {/* --- HERO / BIENVENIDA --- */}
      <section className="relative overflow-hidden rounded-4xl bg-linear-to-b from-[#141418] to-[#0d0d10] border border-zinc-800/80 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles size={14} />
            <span>Portal del Estudiante · Ciclo Formativo 2026</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
            Hola, <span className="text-emerald-400">{session?.name || 'Estudiante'}</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-6">
            Bienvenido a tu plataforma académica. Explora el perfil de competencias de las 4
            carreras técnicas oficiales, consulta a tu <strong>Mentor Académico con IA</strong> y
            administra los documentos de estudio en el módulo <strong>Materias</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 font-medium">
            <span className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
              <GraduationCap size={16} className="text-emerald-400" />
              {session?.careerName || 'Técnico Superior'}
            </span>
            <span className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
              <BookOpen size={16} className="text-teal-400" />
              {materias.length} Materias Registradas
            </span>
            <span className="flex items-center gap-1.5 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800">
              <FolderOpen size={16} className="text-cyan-400" />
              {documentos.length} Documentos en Biblioteca
            </span>
          </div>
        </div>
      </section>

      {/* --- TARJETAS DE ACCESO DIRECTO E INDEPENDIENTE --- */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tarjeta: Materias */}
        <div
          onClick={() => navigate('/materias')}
          className="group relative overflow-hidden rounded-3xl bg-[#121215] border border-zinc-800/80 hover:border-emerald-500/50 p-6 sm:p-8 cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-950/20"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <BookOpen size={28} />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 group-hover:bg-emerald-500/20 group-hover:text-emerald-300 transition-colors">
              Módulo Independiente
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors flex items-center gap-2">
            Materias y Gestión Documental
            <ChevronRight size={20} className="text-zinc-500 group-hover:translate-x-1 transition-transform" />
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
            Espacio de estudio por asignatura. Carga tus apuntes en PDF, DOCX, TXT o MD con arrastrar
            y soltar, activa documentos para el chat y realiza operaciones por lotes.
          </p>

          <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 pt-4 border-t border-zinc-800/80">
            <span>Acceder a la Biblioteca</span>
            <span>{materias.length} Asignaturas</span>
          </div>
        </div>

        {/* Tarjeta: Mentor Chat */}
        <div
          onClick={() => navigate('/mentor')}
          className="group relative overflow-hidden rounded-3xl bg-[#121215] border border-zinc-800/80 hover:border-teal-500/50 p-6 sm:p-8 cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-teal-950/20"
        >
          <div className="flex items-start justify-between mb-6">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
              <MessageSquare size={28} />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 group-hover:bg-teal-500/20 group-hover:text-teal-300 transition-colors">
              Chat Avanzado
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-teal-400 transition-colors flex items-center gap-2">
            Mentor Chat con IA
            <ChevronRight size={20} className="text-zinc-500 group-hover:translate-x-1 transition-transform" />
          </h2>

          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6">
            Tutoría inteligente con soporte multisesión, selección de modelos (Gemini 2.5 Flash, Llama
            3.3, Mixtral, Qwen), citas de documentos en tiempo real y exportación en Markdown.
          </p>

          <div className="flex items-center justify-between text-xs font-semibold text-teal-400 pt-4 border-t border-zinc-800/80">
            <span>Iniciar Sesión de Consulta</span>
            <span>4 Modelos Disponibles</span>
          </div>
        </div>
      </section>

      {/* --- SELECTOR Y FICHA TÉCNICA DE LAS 4 CARRERAS --- */}
      <section className="space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
            <Award size={16} />
            <span>Oferta Académica Integral</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ficha Técnica de las 4 Carreras Oficiales
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400">
            Selecciona una carrera para explorar sus competencias, objetivos y materias oficiales:
          </p>
        </div>

        {/* Pestañas de las 4 Carreras */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {CAREERS_CATALOG.map((career) => {
            const isSelected = activeCareerId === career.id;
            return (
              <button
                key={career.id}
                type="button"
                onClick={() => handleSelectCareer(career.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500/60 text-white shadow-lg shadow-emerald-950/30'
                    : 'bg-[#121215] border-zinc-800 text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <GraduationCap
                    size={20}
                    className={isSelected ? 'text-emerald-400' : 'text-zinc-500'}
                  />
                  {isSelected && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-300">
                      Activa
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-xs sm:text-sm line-clamp-2 leading-snug">
                  {career.nombre}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Contenido Detallado de la Carrera Seleccionada */}
        <div className="bg-[#111114] border border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
          {/* Título y Modalidad */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
            <div>
              <span className="text-[11px] font-mono uppercase text-emerald-400 tracking-wider font-semibold">
                Perfil de Formación
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                {selectedCareerData.nombre}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {selectedCareerData.jornada.map((mod, i) => (
                <span
                  key={i}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-xs font-medium text-zinc-300"
                >
                  <Clock size={14} className="text-emerald-400" />
                  {mod}
                </span>
              ))}
            </div>
          </div>

          {/* 1. Objetivos de la Carrera */}
          <div>
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Target size={16} className="text-emerald-400" />
              1. Objetivos del Programa
            </h4>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-5 mb-4">
              <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                <span className="font-bold text-emerald-400">Objetivo General: </span>
                {selectedCareerData.objetivos.general}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedCareerData.objetivos.especificos.map((obj, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-zinc-900/30 border border-zinc-800/60 text-xs text-zinc-300 flex items-start gap-2.5"
                >
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{obj}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Competencias Profesionales */}
          <div>
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Award size={16} className="text-teal-400" />
              2. Principales Competencias Profesionales ({selectedCareerData.competencias.length})
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {selectedCareerData.competencias.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-800/70 text-xs text-zinc-300 flex items-start gap-2.5"
                >
                  <CheckCircle2 size={16} className="text-teal-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{comp}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Posibles Ocupaciones (Perfil Ocupacional) */}
          <div>
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Briefcase size={16} className="text-cyan-400" />
              3. Ocupaciones y Campo Laboral ({selectedCareerData.ocupaciones.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedCareerData.ocupaciones.map((ocupacion, idx) => (
                <span
                  key={idx}
                  className="px-3 py-2 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-cyan-200 text-xs font-medium"
                >
                  {ocupacion}
                </span>
              ))}
            </div>
          </div>

          {/* 4. Malla Oficial de Materias */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                <BookOpen size={16} className="text-emerald-400" />
                4. Asignaturas del Plan de Estudio ({selectedCareerData.materias.length})
              </h4>
              <button
                type="button"
                onClick={() => navigate('/materias')}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Abrir en Módulo Materias <ChevronRight size={14} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {selectedCareerData.materias.map((materia, idx) => (
                <div
                  key={idx}
                  onClick={() => navigate('/materias')}
                  className="p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-emerald-500/40 cursor-pointer transition-colors text-xs text-zinc-300 flex items-center justify-between group"
                >
                  <span className="font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                    {materia}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    MAT-{(idx + 1).toString().padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
