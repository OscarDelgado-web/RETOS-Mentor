import { useState } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Folder, 
  BookOpen, 
  TrendingUp, 
  AlertTriangle, 
  Zap, 
  Target, 
  ChevronRight 
} from 'lucide-react';
// Importamos el selector que creamos antes, pero lo usaremos dentro de esta nueva estructura
import { HeroContextSelector } from '../components/HeroContextSelector'; 

export default function MentorPage() {
  // Estado para el selector de contexto (lo que ya teníamos)
  const [careerId, setCareerId] = useState<number | ''>('');
  const [subjectId, setSubjectId] = useState<number | ''>('');
  const [topicId, setTopicId] = useState<number | ''>('');
  const [showChatArea, setShowChatArea] = useState(false);

  // Simulación estática (A reemplazar con TanStack Query)
  const careers = [{ id: 1, name: 'Desarrollo de Software' }];
  const subjects = [{ id: 1, name: 'Bases de Datos' }];
  const topics = [{ id: 1, name: 'JOIN' }];
  const isLoading = false;

  const handleCareerChange = (id: number) => {
    setCareerId(id);
    setSubjectId('');
    setTopicId('');
  };

  const handleSubjectChange = (id: number) => {
    setSubjectId(id);
    setTopicId('');
  };

  const studentName = 'Estudiante Demo';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 font-sans flex flex-col">
      <div className="max-w-6xl mx-auto w-full flex-1">
        
        {/* --- CABECERA ESTILO DASHBOARD (Basada en tu referencia) --- */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-amber-500 text-xs font-bold tracking-widest uppercase mb-3">
            <Sparkles size={16} />
            <span>Panel del Estudiante</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
            Hola, <span className="text-emerald-400">{studentName}</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base">
            Selecciona una acción o revisa tu progreso para comenzar.
          </p>
        </div>

        {/* --- BOTONES DE ACCIÓN RÁPIDA --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          <button 
            onClick={() => setShowChatArea(true)}
            className={`border rounded-3xl p-6 flex flex-col items-center justify-center transition-all duration-300 group shadow-lg shadow-black/20 ${
              showChatArea 
                ? 'bg-zinc-800/80 border-emerald-500/50 shadow-emerald-500/10' 
                : 'bg-[#121214] border-zinc-800/80 hover:bg-zinc-800/50'
            }`}
          >
            <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare size={28} strokeWidth={1.5} />
            </div>
            <span className="font-semibold text-sm text-zinc-300">Abrir Mentor Chat</span>
          </button>

          <button 
            onClick={() => alert('Sección de Materiales en construcción')}
            className="bg-[#121214] border border-zinc-800/80 rounded-3xl p-6 flex flex-col items-center justify-center hover:bg-zinc-800/50 transition-all duration-300 group shadow-lg shadow-black/20"
          >
            <div className="bg-zinc-800 text-zinc-400 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <Folder size={28} strokeWidth={1.5} />
            </div>
            <span className="font-semibold text-sm text-zinc-300">Materiales</span>
          </button>
        </div>

        {/* --- ÁREA DINÁMICA: SELECTOR Y CHAT O ESTADÍSTICAS --- */}
        {showChatArea ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Aquí reutilizamos el componente que hicimos antes, pero adaptado visualmente si es necesario */}
            <div className="mb-8">
               <HeroContextSelector 
                  careers={careers}
                  subjects={subjects}
                  topics={topics}
                  selectedCareer={careerId}
                  selectedSubject={subjectId}
                  selectedTopic={topicId}
                  onCareerChange={handleCareerChange}
                  onSubjectChange={handleSubjectChange}
                  onTopicChange={setTopicId}
                  isLoading={isLoading}
                />
            </div>

            {topicId ? (
              <div className="bg-[#121214] rounded-2xl shadow-sm border border-zinc-800/80 p-6 h-125 flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 border-b border-zinc-800/80 pb-4">
                  <p className="text-zinc-500 text-center mt-10">Historial de mensajes...</p>
                </div>
                <div className="flex gap-3">
                  <input 
                    type="text" 
                    placeholder="Escribe tu pregunta sobre este tema..." 
                    className="flex-1 bg-[#1a1a1d] text-white border border-zinc-700/50 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-zinc-500"
                  />
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 px-8 rounded-xl transition-colors">
                    Enviar
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-[#121214] border border-zinc-800/80 rounded-4xl p-10 text-center">
                 <Zap className="mx-auto text-zinc-600 mb-4" size={40} />
                <p className="text-zinc-400">Selecciona Carrera, Asignatura y Tema en el panel superior para habilitar el chat.</p>
              </div>
            )}
          </div>
        ) : (
          /* --- ESTADÍSTICAS (Solo se muestran si el chat está cerrado) --- */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
            
            <div className="lg:col-span-7 bg-[#121214] border border-zinc-800/80 rounded-4xl p-6 md:p-8 shadow-lg shadow-black/20">
              <div className="flex justify-between items-start mb-10">
                <div className="flex items-center gap-3">
                  <BookOpen className="text-emerald-400" size={24} />
                  <div>
                    <h2 className="text-xl font-bold text-white">Bases de Datos</h2>
                    <p className="text-[10px] text-zinc-500 font-bold tracking-widest mt-1">PROGRESO DE TEMAS</p>
                  </div>
                </div>
                <TrendingUp className="text-zinc-600" size={24} />
              </div>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <h3 className="text-[15px] font-bold text-zinc-200">Normalización</h3>
                      <p className="text-emerald-400 text-[10px] font-extrabold mt-1 tracking-wide">EN PROGRESO</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <p className="text-zinc-500 text-[10px] font-bold uppercase">Dominio</p>
                      <div className="bg-[#1a1a1d] border border-zinc-700/50 rounded-full w-12 h-12 flex items-center justify-center text-sm font-bold text-white shadow-inner">
                        68%
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800/60 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-3">
                    <div className="flex items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-[15px] font-bold text-zinc-200">JOIN</h3>
                          <AlertTriangle size={14} className="text-amber-500" strokeWidth={3} />
                        </div>
                        <p className="text-amber-500 text-[10px] font-extrabold mt-1 tracking-wide">NECESITA REFUERZO</p>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <p className="text-zinc-500 text-[10px] font-bold uppercase">Dominio</p>
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-full w-12 h-12 flex items-center justify-center text-sm font-bold text-amber-500 shadow-inner">
                        32%
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-800/60 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '32%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col gap-5">
              <div className="bg-amber-950/20 border border-amber-900/40 rounded-4xl p-6 flex flex-col shadow-lg shadow-black/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
                
                <div className="flex items-center gap-3 mb-4 relative z-10">
                  <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-500 border border-amber-500/20">
                    <Target size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-500">Reforzar: JOIN</h3>
                    <p className="text-[10px] text-amber-600/80 font-bold tracking-widest mt-1">RECOMENDACIÓN ACTIVA</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6 relative z-10">
                  Tu dominio en JOIN es bajo. Te recomendamos practicar en el mentor.
                </p>
                <button 
                  onClick={() => {
                    setCareerId(1);
                    setSubjectId(1);
                    setTopicId(1);
                    setShowChatArea(true);
                  }}
                  className="text-amber-500 text-sm font-semibold flex items-center gap-2 hover:text-amber-400 transition-colors w-fit relative z-10"
                >
                  Ir al Mentor para practicar <ChevronRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-5 mt-auto">
                <div className="bg-[#121214] border border-zinc-800/80 rounded-3xl p-6 flex flex-col items-center justify-center shadow-lg shadow-black/20">
                  <span className="text-4xl font-extrabold text-emerald-500 mb-2">3</span>
                  <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase text-center">Temas<br/>Activos</span>
                </div>
                <div className="bg-[#121214] border border-zinc-800/80 rounded-3xl p-6 flex flex-col items-center justify-center shadow-lg shadow-black/20">
                  <span className="text-4xl font-extrabold text-amber-500 mb-2">1</span>
                  <span className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase text-center">Necesita<br/>Refuerzo</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}