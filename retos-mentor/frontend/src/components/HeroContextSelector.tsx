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
  isLoading
}) => {
  return (
<section className="bg-linear-to-br from-slate-900 to-blue-900 text-white py-16 px-6 shadow-xl rounded-b-3xl">
          <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
          Hola, <span className="text-blue-400">Estudiante Demo</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl">
          Selecciona tu contexto académico para comenzar. Tu mentor virtual adaptará sus respuestas a tu nivel y plan de estudios.
        </p>

        <div className="w-full bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 shadow-inner flex flex-col md:flex-row gap-4">
          
          {/* Selector de Carrera */}
          <div className="flex-1 text-left">
            <label className="block text-sm font-medium text-slate-200 mb-2">1. Carrera</label>
            <select 
              className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 transition-all"
              value={selectedCareer}
              onChange={(e) => onCareerChange(Number(e.target.value))}
              disabled={isLoading}
            >
              <option value="" disabled>Elige tu carrera...</option>
              {careers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {/* Selector de Asignatura */}
          <div className="flex-1 text-left">
            <label className="block text-sm font-medium text-slate-200 mb-2">2. Asignatura</label>
            <select 
              className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 transition-all"
              value={selectedSubject}
              onChange={(e) => onSubjectChange(Number(e.target.value))}
              disabled={!selectedCareer || isLoading}
            >
              <option value="" disabled>Elige asignatura...</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          {/* Selector de Tema */}
          <div className="flex-1 text-left">
            <label className="block text-sm font-medium text-slate-200 mb-2">3. Tema</label>
            <select 
              className="w-full bg-slate-800/50 border border-slate-600 text-white rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-50 transition-all"
              value={selectedTopic}
              onChange={(e) => onTopicChange(Number(e.target.value))}
              disabled={!selectedSubject || isLoading}
            >
              <option value="" disabled>Elige tema específico...</option>
              {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>

        </div>
      </div>
    </section>
  );
};