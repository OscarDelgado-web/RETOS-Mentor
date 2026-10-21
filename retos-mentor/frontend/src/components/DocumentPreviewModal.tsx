import React, { useState } from 'react';
import { X, FileText, CheckCircle2, Copy, Search, ShieldCheck } from 'lucide-react';
import type { DocumentoItem } from '../types';

interface DocumentPreviewModalProps {
  document: DocumentoItem | null;
  onClose: () => void;
  onToggleActive?: (id: string) => void;
}

export const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  document,
  onClose,
  onToggleActive,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [copied, setCopied] = useState(false);

  if (!document) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(document.contenidoTextoExtraido);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredChunks = document.fragmentos.filter((c) =>
    filterQuery ? c.text.toLowerCase().includes(filterQuery.toLowerCase()) : true
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in"
    >
      <div className="bg-[#121216] border border-zinc-800 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Cabecera del Documento */}
        <div className="p-6 border-b border-zinc-800/80 flex items-start justify-between bg-zinc-950/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                  {document.tipo.toUpperCase()}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {document.materiaNombre}
                </span>
              </div>
              <h2 className="text-base md:text-lg font-bold text-white leading-snug">
                {document.nombre}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar vista previa"
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/60 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Metadatos y Barra de Acciones */}
        <div className="px-6 py-3 border-b border-zinc-800/60 bg-zinc-900/40 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-zinc-400">
            <span>
              Tamaño: <strong className="text-zinc-200">{document.tamanoFormateado}</strong>
            </span>
            <span>
              Subido: <strong className="text-zinc-200">{document.fechaSubida}</strong>
            </span>
            <span>
              Fragmentos: <strong className="text-emerald-400">{document.fragmentos.length}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleActive && (
              <button
                type="button"
                onClick={() => onToggleActive(document.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all ${
                  document.activoParaChat
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700'
                }`}
              >
                <ShieldCheck size={14} />
                {document.activoParaChat ? 'Activo en Mentor' : 'Inactivo para Chat'}
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-400" /> Copiado
                </>
              ) : (
                <>
                  <Copy size={14} /> Copiar Todo
                </>
              )}
            </button>
          </div>
        </div>

        {/* Buscador dentro del documento */}
        <div className="p-4 border-b border-zinc-800/60 bg-zinc-950/20">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Buscar término o palabra clave en los fragmentos..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Lista de Chunks / Contenido */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredChunks.length > 0 ? (
            filteredChunks.map((chunk, index) => (
              <div
                key={chunk.id}
                className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all text-xs"
              >
                <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-2 font-mono">
                  <span className="font-bold text-emerald-400">
                    Fragmento #{index + 1}
                  </span>
                  <span>~{chunk.tokenCountEstimate} tokens estimados</span>
                </div>
                <p className="text-zinc-300 leading-relaxed whitespace-pre-wrap font-sans">
                  {chunk.text}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-zinc-500 text-xs">
              No se encontraron fragmentos que coincidan con la búsqueda.
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/40 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
