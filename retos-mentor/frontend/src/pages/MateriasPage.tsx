import React, { useState, useRef } from 'react';
import {
  BookOpen,
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  CheckSquare,
  Square,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Filter,
  Search,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMaterias } from '../context/MateriasContext';
import { DocumentPreviewModal } from '../components/DocumentPreviewModal';
import type { MateriaItem } from '../types';

export const MateriasPage: React.FC = () => {
  const { session } = useAuth();
  const {
    materias,
    selectedMateria,
    setSelectedMateria,
    documentosByMateria,
    uploadDocument,
    toggleDocumentActive,
    deleteDocument,
    deleteMultipleDocuments,
    activateAllDocuments,
    deactivateAllDocuments,
    previewDocument,
    openPreview,
    closePreview,
    isLoadingMaterias,
  } = useMaterias();

  // Estados locales
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [searchMateriaQuery, setSearchMateriaQuery] = useState('');
  const [searchDocQuery, setSearchDocQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Materia actual
  const currentMateria: MateriaItem | null =
    selectedMateria || (materias.length > 0 ? materias[0] : null);

  // Documentos de la materia actual
  const currentDocs = currentMateria ? documentosByMateria(currentMateria.id) : [];

  // Filtrado de documentos por texto
  const filteredDocs = currentDocs.filter((d) =>
    searchDocQuery
      ? d.nombre.toLowerCase().includes(searchDocQuery.toLowerCase()) ||
        d.contenidoTextoExtraido.toLowerCase().includes(searchDocQuery.toLowerCase())
      : true
  );

  // Filtrado de materias para la barra lateral
  const filteredMaterias = materias.filter((m) =>
    searchMateriaQuery ? m.name.toLowerCase().includes(searchMateriaQuery.toLowerCase()) : true
  );

  // Manejo de drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!currentMateria) return;

    const files = Array.from(e.dataTransfer.files);
    for (const file of files) {
      await uploadDocument(file, currentMateria.id, currentMateria.name);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !currentMateria) return;
    const files = Array.from(e.target.files);
    for (const file of files) {
      await uploadDocument(file, currentMateria.id, currentMateria.name);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Manejo de selección múltiple (Checkboxes)
  const toggleSelectDoc = (id: string) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedDocIds.length === filteredDocs.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(filteredDocs.map((d) => d.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedDocIds.length === 0) return;
    if (
      confirm(
        `¿Confirmas la eliminación de los ${selectedDocIds.length} documento(s) seleccionados?`
      )
    ) {
      await deleteMultipleDocuments(selectedDocIds);
      setSelectedDocIds([]);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* --- ENCABEZADO DEL MÓDULO MATERIAS --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
            <BookOpen size={16} />
            <span>Módulo Académico Independiente</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Materias y Gestión Documental
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Plan de estudio para <strong className="text-zinc-200">{session?.careerName}</strong>.
            Carga materiales, extrae texto automáticamente y actívalos para enriquecer el Mentor
            Chat.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-2">
            <GraduationCap size={16} className="text-emerald-400" />
            <span>{materias.length} Materias Registradas</span>
          </div>
        </div>
      </div>

      {/* --- DISEÑO DE DOS COLUMNAS: SELECTOR DE MATERIAS & BIBLIOTECA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMNA IZQUIERDA: LISTA DE MATERIAS DE LA CARRERA */}
        <div className="lg:col-span-4 bg-[#111114] border border-zinc-800/80 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Filter size={14} className="text-emerald-400" />
              Materias de la Carrera
            </h2>
            <span className="text-[11px] font-mono text-zinc-500">
              {filteredMaterias.length}/{materias.length}
            </span>
          </div>

          {/* Buscador de Materias */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Filtrar materias..."
              value={searchMateriaQuery}
              onChange={(e) => setSearchMateriaQuery(e.target.value)}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Lista interactiva */}
          <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
            {isLoadingMaterias ? (
              <div className="text-center py-8 text-xs text-zinc-500 animate-pulse">
                Cargando materias oficiales...
              </div>
            ) : filteredMaterias.length > 0 ? (
              filteredMaterias.map((materia) => {
                const isSelected = currentMateria?.id === materia.id;
                const docCount = documentosByMateria(materia.id).length;

                return (
                  <button
                    key={materia.id}
                    type="button"
                    onClick={() => {
                      setSelectedMateria(materia);
                      setSelectedDocIds([]);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-md shadow-emerald-950/20'
                        : 'bg-zinc-900/40 border-zinc-800/70 text-zinc-300 hover:bg-zinc-800/60 hover:text-white'
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold leading-snug line-clamp-2">
                        {materia.name}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {materia.codigo || 'MAT'} · {materia.ciclo || 'Ciclo Regular'}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                          docCount > 0
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-zinc-800 text-zinc-500'
                        }`}
                      >
                        {docCount} doc{docCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-6 text-xs text-zinc-500">
                No se encontraron materias coincidentes.
              </div>
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: ESPACIO DE ESTUDIO Y BIBLIOTECA DOCUMENTAL */}
        <div className="lg:col-span-8 space-y-6">
          {currentMateria ? (
            <>
              {/* Tarjeta de la Materia Seleccionada */}
              <div className="bg-[#111114] border border-zinc-800/80 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-bold">
                      {currentMateria.codigo} · {currentMateria.ciclo}
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                      {currentMateria.name}
                    </h2>
                  </div>
                  <div className="text-xs text-zinc-400">
                    Documentos cargados:{' '}
                    <strong className="text-emerald-400 font-bold">{currentDocs.length}</strong>
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {currentMateria.descripcion}
                </p>

                {/* --- ÁREA DRAG & DROP DE CARGA DE ARCHIVOS --- */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center gap-3 ${
                    isDragging
                      ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
                      : 'border-zinc-700/80 hover:border-emerald-500/50 bg-zinc-900/30 hover:bg-zinc-900/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.txt,.doc,.docx,.md"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <UploadCloud size={24} />
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm font-bold text-white">
                      Arrastra y suelta aquí tus archivos o{' '}
                      <span className="text-emerald-400 underline">haz clic para examinar</span>
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Formatos soportados: <strong>.pdf, .txt, .doc, .docx, .md</strong> (Máximo 10
                      MB por archivo)
                    </p>
                  </div>
                </div>
              </div>

              {/* --- BIBLIOTECA DE DOCUMENTOS Y OPERACIONES POR LOTE --- */}
              <div className="bg-[#111114] border border-zinc-800/80 rounded-3xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <FileText size={16} className="text-emerald-400" />
                      Biblioteca de Documentos ({currentDocs.length})
                    </h3>

                    {filteredDocs.length > 0 && (
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
                      >
                        {selectedDocIds.length === filteredDocs.length ? (
                          <CheckSquare size={16} className="text-emerald-400" />
                        ) : (
                          <Square size={16} />
                        )}
                        <span>Seleccionar todos</span>
                      </button>
                    )}
                  </div>

                  {/* Operaciones por Lote */}
                  <div className="flex items-center gap-2">
                    {selectedDocIds.length > 0 && (
                      <button
                        type="button"
                        onClick={handleDeleteSelected}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 hover:bg-rose-500/25 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Trash2 size={14} />
                        <span>Eliminar ({selectedDocIds.length})</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => activateAllDocuments(currentMateria.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 text-xs font-semibold transition-colors"
                    >
                      Activar Todos
                    </button>

                    <button
                      type="button"
                      onClick={() => deactivateAllDocuments(currentMateria.id)}
                      className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 text-xs font-semibold transition-colors"
                    >
                      Desactivar Todos
                    </button>
                  </div>
                </div>

                {/* Buscador de documentos dentro de la materia */}
                {currentDocs.length > 0 && (
                  <div className="relative mb-3">
                    <Search
                      size={14}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
                    />
                    <input
                      type="text"
                      placeholder="Buscar en el contenido o título de los documentos..."
                      value={searchDocQuery}
                      onChange={(e) => setSearchDocQuery(e.target.value)}
                      className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}

                {/* Lista de Documentos */}
                {filteredDocs.length > 0 ? (
                  <div className="space-y-3">
                    {filteredDocs.map((doc) => {
                      const isSelected = selectedDocIds.includes(doc.id);
                      const isReady = doc.estado === 'listo';
                      const isProcessing = doc.estado === 'procesando' || doc.estado === 'cargando';
                      const isError = doc.estado === 'error';

                      return (
                        <div
                          key={doc.id}
                          className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500/50'
                              : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Checkbox */}
                            <button
                              type="button"
                              onClick={() => toggleSelectDoc(doc.id)}
                              aria-label={`Seleccionar documento ${doc.nombre}`}
                              className="text-zinc-500 hover:text-white shrink-0"
                            >
                              {isSelected ? (
                                <CheckSquare size={18} className="text-emerald-400" />
                              ) : (
                                <Square size={18} />
                              )}
                            </button>

                            {/* Ícono Formato */}
                            <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center shrink-0 text-emerald-400">
                              <FileText size={20} />
                            </div>

                            {/* Info */}
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-white truncate">{doc.nombre}</p>
                              <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                                <span className="uppercase font-mono font-bold text-zinc-300">
                                  {doc.tipo}
                                </span>
                                <span>·</span>
                                <span>{doc.tamanoFormateado}</span>
                                <span>·</span>
                                <span>{doc.fechaSubida}</span>
                                {isReady && (
                                  <>
                                    <span>·</span>
                                    <span className="text-emerald-400 font-semibold">
                                      {doc.fragmentos.length} fragmentos
                                    </span>
                                  </>
                                )}
                              </div>

                              {/* Barra de Progreso si está procesando */}
                              {isProcessing && (
                                <div className="mt-2 w-full max-w-xs">
                                  <div className="flex items-center justify-between text-[10px] text-emerald-400 mb-1">
                                    <span>
                                      {doc.estado === 'cargando'
                                        ? 'Cargando archivo...'
                                        : 'Extrayendo y fragmentando...'}
                                    </span>
                                    <span>{doc.progreso}%</span>
                                  </div>
                                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                    <div
                                      className="bg-emerald-500 h-full transition-all duration-300"
                                      style={{ width: `${doc.progreso}%` }}
                                    />
                                  </div>
                                </div>
                              )}

                              {isError && (
                                <p className="text-[10px] text-rose-400 flex items-center gap-1 mt-1">
                                  <AlertCircle size={12} />
                                  {doc.errorMensaje || 'Error al procesar el archivo'}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Acciones y Toggle */}
                          <div className="flex items-center justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                            {/* Toggle Activo para Chat */}
                            <button
                              type="button"
                              onClick={() => toggleDocumentActive(doc.id)}
                              disabled={!isReady}
                              title={
                                doc.activoParaChat
                                  ? 'Desactivar como contexto en Mentor Chat'
                                  : 'Activar como contexto en Mentor Chat'
                              }
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                                doc.activoParaChat
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
                              } disabled:opacity-40`}
                            >
                              {doc.activoParaChat ? (
                                <>
                                  <ToggleRight size={18} className="text-emerald-400" />
                                  <span>Activo en Chat</span>
                                </>
                              ) : (
                                <>
                                  <ToggleLeft size={18} />
                                  <span>Inactivo</span>
                                </>
                              )}
                            </button>

                            {/* Vista Previa */}
                            <button
                              type="button"
                              onClick={() => openPreview(doc)}
                              disabled={!isReady}
                              title="Ver contenido extraído y fragmentos"
                              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors disabled:opacity-40"
                            >
                              <Eye size={16} />
                            </button>

                            {/* Eliminar */}
                            <button
                              type="button"
                              onClick={() => deleteDocument(doc.id)}
                              title="Eliminar documento"
                              className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-zinc-800/60 rounded-2xl bg-zinc-950/20">
                    <FileText size={32} className="mx-auto text-zinc-600 mb-3" />
                    <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-1">
                      No hay documentos cargados en esta materia
                    </h4>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Arrastra tus apuntes o haz clic en el área superior para añadir material de
                      estudio a {currentMateria.name}.
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-[#111114] border border-zinc-800 rounded-3xl">
              <BookOpen size={40} className="mx-auto text-emerald-400 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Selecciona una Materia</h3>
              <p className="text-xs text-zinc-400">
                Elige una asignatura de la columna izquierda para ver su espacio y documentos.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Vista Previa de Documento */}
      <DocumentPreviewModal
        document={previewDocument}
        onClose={closePreview}
        onToggleActive={toggleDocumentActive}
      />
    </div>
  );
};
