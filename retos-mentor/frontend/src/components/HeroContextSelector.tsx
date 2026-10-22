import React from 'react';

export interface ContextSelectorProps {
  careers: { id: number; name: string }[];
  subjects: { id: number; name: string }[];
  topics: { id: number; name: string }[];
  selectedCareer: number | '';
  selectedSubject: number | '';
  selectedTopic: number | '';
  onCareerChange: (id: number) => void;
  onSubjectChange: (id: number) => void;
  onTopicChange: (id: number) => void;
  isLoading: boolean;
  studentName?: string;
  compact?: boolean;
}

export const HeroContextSelector: React.FC<ContextSelectorProps> = ({
  careers,
  subjects,
  topics,
  selectedCareer,
  selectedSubject,
  selectedTopic,
  onCareerChange,
  onSubjectChange,
  onTopicChange,
  isLoading,
  studentName = 'Estudiante Demo',
  compact = false,
}) => {
  return (
    <section
      aria-label="Selector de Contexto Académico"
      className={`bg-linear-to-br from-slate-900 via-[#0d1527] to-slate-950 text-white border-b border-zinc-800/80 shadow-lg ${
        compact ? 'py-4 px-4 sm:px-6 rounded-2xl' : 'py-6 md:py-8 px-4 sm:px-6 rounded-2xl md:rounded-3xl'
      }`}
    >
      <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
        {!compact && (
          <>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2">
              Hola, <span className="text-emerald-400">{studentName}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 max-w-2xl leading-relaxed">
              Selecciona tu contexto académico para comenzar. Tu mentor virtual adaptará sus respuestas a tu nivel y plan de estudios oficial.
            </p>
          </>
        )}

        <div className="w-full bg-white/5 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 shadow-inner flex flex-col md:flex-row gap-3 sm:gap-4">
          {/* 1. Selector de Carrera */}
          <div className="flex-1 text-left min-w-0">
            <label
              htmlFor="career-select-field"
              className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between"
            >
              <span>1. Carrera</span>
              {isLoading && (
                <span className="text-[10px] text-emerald-400 font-mono animate-pulse">Cargando...</span>
              )}
            </label>
            <select
              id="career-select-field"
              className="w-full bg-slate-900/90 border border-slate-700/80 text-white text-xs sm:text-sm rounded-xl p-2.5 sm:p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              value={selectedCareer}
              onChange={(e) => {
                const val = e.target.value;
                if (val) onCareerChange(Number(val));
              }}
              disabled={isLoading}
              aria-label="1. Carrera"
            >
              <option value="" disabled>
                Elige tu carrera...
              </option>
              {careers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Selector de Asignatura */}
          <div className="flex-1 text-left min-w-0">
            <label
              htmlFor="subject-select-field"
              className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between"
            >
              <span>2. Asignatura</span>
              {!selectedCareer && (
                <span className="text-[10px] text-slate-500 font-normal">Requiere carrera</span>
              )}
            </label>
            <select
              id="subject-select-field"
              className="w-full bg-slate-900/90 border border-slate-700/80 text-white text-xs sm:text-sm rounded-xl p-2.5 sm:p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              value={selectedSubject}
              onChange={(e) => {
                const val = e.target.value;
                if (val) onSubjectChange(Number(val));
              }}
              disabled={!selectedCareer || isLoading}
              aria-label="2. Asignatura"
            >
              <option value="" disabled>
                Elige asignatura...
              </option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Selector de Tema */}
          <div className="flex-1 text-left min-w-0">
            <label
              htmlFor="topic-select-field"
              className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center justify-between"
            >
              <span>3. Tema</span>
              {!selectedSubject && (
                <span className="text-[10px] text-slate-500 font-normal">Requiere asignatura</span>
              )}
            </label>
            <select
              id="topic-select-field"
              className="w-full bg-slate-900/90 border border-slate-700/80 text-white text-xs sm:text-sm rounded-xl p-2.5 sm:p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              value={selectedTopic}
              onChange={(e) => {
                const val = e.target.value;
                if (val) onTopicChange(Number(val));
              }}
              disabled={!selectedSubject || isLoading}
              aria-label="3. Tema"
            >
              <option value="" disabled>
                Elige tema específico...
              </option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </section>
  );
};