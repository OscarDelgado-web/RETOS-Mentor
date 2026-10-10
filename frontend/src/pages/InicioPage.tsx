import { 
  Sparkles, MessageSquare, Folder, BookOpen, 
  TrendingUp, AlertTriangle, Zap, Target, ChevronRight 
} from 'lucide-react';

interface InicioPageProps {
  // Función para manejar la navegación entre pantallas
  onNavigate?: (path: string) => void;
  studentName?: string;
}

export default function InicioPage({ 
  onNavigate = () => {}, 
  studentName = 'Estudiante Piloto' 
}: InicioPageProps) {

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* --- HERO HEADER --- */}
        <div className="mb-10">
          <div className="flex items-center gap-2 text-amber-500 text-xs font-bold tracking-widest uppercase mb-3">
            <Sparkles size={16} />
            <span>Panel del Estudiante</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 tracking-tight">
            Hola, <span className="text-emerald-400">{studentName}</span>
          </h1>
          <p className="text-zinc-400 text-sm md:text-base">
            Desarrollo de Software · Semana 1 del Showcase
          </p>
        </div>

        {/* --- TARJETAS DE ACCIÓN RÁPIDA (Ajustadas a 2 columnas) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
          
          {/* Botón Mentor Chat */}
          <button 
            onClick={() => onNavigate('/mentor')}
            className="bg-[#121214] border border-zinc-800/80 rounded-3xl p-6 flex flex-col items-center justify-center hover:bg-zinc-800/50 transition-all duration-300 group shadow-lg shadow-black/20"
          >
            <div className="bg-emerald-500/10 text-emerald-400 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare size={28} strokeWidth={1.5} />
            </div>
            <span className="font-semibold text-sm text-zinc-300">Mentor Chat</span>
          </button>

          {/* Botón Materiales */}
          <button 
            onClick={() => onNavigate('/materiales')}
            className="bg-[#121214] border border-zinc-800/80 rounded-3xl p-6 flex flex-col items-center justify-center hover:bg-zinc-800/50 transition-all duration-300 group shadow-lg shadow-black/20"
          >
            <div className="bg-zinc-800 text-zinc-400 p-4 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <Folder size={28} strokeWidth={1.5} />
            </div>
            <span className="font-semibold text-sm text-zinc-300">Materiales</span>
          </button>
        </div>

        {/* --- CONTENIDO PRINCIPAL (PROGRESO Y RECOMENDACIONES) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Columna Izquierda: Panel de Progreso */}
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
              {/* Progreso: Normalización */}
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

              {/* Progreso: JOIN (Alerta) */}
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

              {/* Progreso: Procedimientos */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <h3 className="text-[15px] font-bold text-zinc-200">Procedimientos</h3>
                    <p className="text-zinc-600 text-[10px] font-extrabold mt-1 tracking-wide">NO EVALUADO</p>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <p className="text-zinc-500 text-[10px] font-bold uppercase">Dominio</p>
                    <div className="bg-[#1a1a1d] border border-zinc-800 rounded-full w-12 h-12 flex items-center justify-center text-sm font-bold text-zinc-600 shadow-inner">
                      --
                    </div>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-zinc-800/40 rounded-full overflow-hidden"></div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Accesos de IA y Stats */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            
            {/* Tarjeta: Mentor AI */}
            <button 
              onClick={() => onNavigate('/mentor')}
              className="bg-[#121214] border border-zinc-800/80 rounded-4xl p-6 text-left hover:border-emerald-500/40 transition-colors group flex flex-col shadow-lg shadow-black/20"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-500/10 p-2.5 rounded-xl text-emerald-400">
                    <Zap size={20} className="fill-emerald-400/20" />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-100">Mentor AI</h3>
                    <p className="text-[11px] text-zinc-500">Pregunta lo que quieras</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-zinc-600 group-hover:text-emerald-400 transition-colors" />
              </div>
              <p className="text-sm text-zinc-400 mt-2 leading-relaxed">
                Resuelve tus dudas de cualquier asignatura con asistencia inteligente personalizada.
              </p>
            </button>

            {/* Tarjeta: Recomendación Activa */}
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
                Tu dominio en JOIN es bajo. Te recomendamos revisar los módulos y practicar con ejercicios adaptativos.
              </p>
              <button 
                onClick={() => onNavigate('/mentor?topic=join')}
                className="text-amber-500 text-sm font-semibold flex items-center gap-2 hover:text-amber-400 transition-colors w-fit relative z-10"
              >
                Ir al Mentor para practicar <ChevronRight size={16} />
              </button>
            </div>

            {/* Fila de Estadísticas Rápidas */}
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

      </div>
    </div>
  );
}