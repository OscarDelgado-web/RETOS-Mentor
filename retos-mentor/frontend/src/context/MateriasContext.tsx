import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { CAREERS_CATALOG } from '../data/careersCatalog';
import { api } from '../services/api';
import {
  validateUploadFile,
  extractTextFromFile,
  chunkExtractedText,
  formatFileSize,
  detectFileType,
  saveDocumentToStorage,
  deleteDocumentFromStorage,
  loadAllDocumentsFromStorage,
} from '../services/documentProcessor';
import type { MateriaItem, DocumentoItem } from '../types';

interface MateriasContextType {
  materias: MateriaItem[];
  selectedMateria: MateriaItem | null;
  setSelectedMateria: (materia: MateriaItem | null) => void;
  documentos: DocumentoItem[];
  documentosByMateria: (materiaId: string) => DocumentoItem[];
  documentosActivosParaChat: DocumentoItem[];
  isLoadingMaterias: boolean;
  isLoadingDocs: boolean;
  uploadDocument: (file: File, materiaId: string, materiaNombre: string) => Promise<boolean>;
  toggleDocumentActive: (documentId: string) => Promise<void>;
  deleteDocument: (documentId: string) => Promise<void>;
  deleteMultipleDocuments: (documentIds: string[]) => Promise<void>;
  activateAllDocuments: (materiaId?: string) => Promise<void>;
  deactivateAllDocuments: (materiaId?: string) => Promise<void>;
  previewDocument: DocumentoItem | null;
  openPreview: (doc: DocumentoItem) => void;
  closePreview: () => void;
  refreshMaterias: () => Promise<void>;
}

const MateriasContext = createContext<MateriasContextType | undefined>(undefined);

export const MateriasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const { success, warning, error, info } = useToast();

  const [materias, setMaterias] = useState<MateriaItem[]>([]);
  const [selectedMateria, setSelectedMateria] = useState<MateriaItem | null>(null);
  const [documentos, setDocumentos] = useState<DocumentoItem[]>([]);
  const [isLoadingMaterias, setIsLoadingMaterias] = useState(false);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [previewDocument, setPreviewDocument] = useState<DocumentoItem | null>(null);

  // Cargar documentos desde IndexedDB
  useEffect(() => {
    let isMounted = true;
    loadAllDocumentsFromStorage()
      .then((docs) => {
        if (isMounted) {
          setDocumentos(docs);
          setIsLoadingDocs(false);
        }
      })
      .catch((err) => {
        console.warn('Error inicializando documentos:', err);
        if (isMounted) setIsLoadingDocs(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Cargar materias de la carrera activa
  const refreshMaterias = useCallback(async () => {
    if (!session?.careerId) return;
    setIsLoadingMaterias(true);

    const careerCatalog =
      CAREERS_CATALOG.find((c) => c.id === session.careerId) || CAREERS_CATALOG[0];

    try {
      // Intentar obtener subjects del backend si careerBackendId existe
      let backendSubjects: { id: number; name: string }[] = [];
      if (session.careerBackendId) {
        try {
          backendSubjects = await api.getSubjects(session.careerBackendId);
        } catch {
          // Ignorar error si backend no responde
        }
      }

      // Fusionar catálogo oficial con datos del backend sin perder ninguna materia del catálogo
      const mergedList: MateriaItem[] = careerCatalog.materias.map((nombreMateria, index) => {
        const foundBackend = backendSubjects.find(
          (b) => b.name.toLowerCase().trim() === nombreMateria.toLowerCase().trim()
        );

        return {
          id: `${careerCatalog.id}-mat-${index + 1}`,
          backendId: foundBackend?.id || (session.careerBackendId ? session.careerBackendId * 100 + (index + 1) : index + 1),
          name: nombreMateria,
          careerId: careerCatalog.id,
          codigo: `MAT-${(index + 1).toString().padStart(2, '0')}`,
          ciclo: index < 5 ? 'Ciclo I' : 'Ciclo II',
          creditos: 4,
          descripcion: `Módulo formativo correspondiente a ${nombreMateria} para ${careerCatalog.nombre}.`,
        };
      });

      setMaterias(mergedList);
      if (mergedList.length > 0 && !selectedMateria) {
        setSelectedMateria(mergedList[0]);
      }
    } finally {
      setIsLoadingMaterias(false);
    }
  }, [session?.careerId, session?.careerBackendId, selectedMateria]);

  useEffect(() => {
    refreshMaterias();
  }, [refreshMaterias]);

  // Documentos filtrados por materia
  const documentosByMateria = useCallback(
    (materiaId: string) => {
      return documentos.filter((d) => d.materiaId === materiaId);
    },
    [documentos]
  );

  // Documentos activos para el chat
  const documentosActivosParaChat = useMemo(() => {
    return documentos.filter((d) => d.activoParaChat && d.estado === 'listo');
  }, [documentos]);

  // Carga y procesamiento de un documento
  const uploadDocument = useCallback(
    async (file: File, materiaId: string, materiaNombre: string): Promise<boolean> => {
      // 1. Validar formato y tamaño
      const validation = validateUploadFile(file);
      if (!validation.isValid) {
        warning(validation.error || 'Archivo inválido', 'Validación de Archivo');
        return false;
      }

      const docId = `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const fileType = detectFileType(file);

      const nuevoDoc: DocumentoItem = {
        id: docId,
        materiaId,
        materiaNombre,
        nombre: file.name,
        tipo: fileType,
        tamanoBytes: file.size,
        tamanoFormateado: formatFileSize(file.size),
        fechaSubida: new Date().toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        estado: 'cargando',
        progreso: 20,
        activoParaChat: true,
        contenidoTextoExtraido: '',
        fragmentos: [],
      };

      // Registrar estado inicial
      setDocumentos((prev) => [nuevoDoc, ...prev]);

      try {
        // 2. Extraer texto con seguimiento de progreso
        setDocumentos((prev) =>
          prev.map((d) => (d.id === docId ? { ...d, estado: 'procesando', progreso: 50 } : d))
        );

        const extractedText = await extractTextFromFile(file, (p) => {
          setDocumentos((prev) =>
            prev.map((d) => (d.id === docId ? { ...d, progreso: Math.min(85, p) } : d))
          );
        });

        // 3. Fragmentar texto
        const chunks = chunkExtractedText(docId, extractedText);

        const docFinal: DocumentoItem = {
          ...nuevoDoc,
          estado: 'listo',
          progreso: 100,
          contenidoTextoExtraido: extractedText,
          fragmentos: chunks,
        };

        // 4. Guardar en storage local
        await saveDocumentToStorage(docFinal);

        setDocumentos((prev) => prev.map((d) => (d.id === docId ? docFinal : d)));
        success(
          `"${file.name}" procesado con éxito (${chunks.length} fragmentos extraídos).`,
          'Documento Listo'
        );
        return true;
      } catch (err: any) {
        console.error('Error procesando archivo:', err);
        const docError: DocumentoItem = {
          ...nuevoDoc,
          estado: 'error',
          progreso: 0,
          errorMensaje: err?.message || 'Error durante el procesamiento del archivo.',
        };
        setDocumentos((prev) => prev.map((d) => (d.id === docId ? docError : d)));
        error(`No se pudo procesar "${file.name}": ${err?.message || 'Error desconocido'}`);
        return false;
      }
    },
    [success, warning, error]
  );

  // Alternar documento activo para chat
  const toggleDocumentActive = useCallback(
    async (documentId: string) => {
      let targetDoc: DocumentoItem | undefined;
      setDocumentos((prev) =>
        prev.map((doc) => {
          if (doc.id === documentId) {
            targetDoc = { ...doc, activoParaChat: !doc.activoParaChat };
            return targetDoc;
          }
          return doc;
        })
      );

      if (targetDoc) {
        await saveDocumentToStorage(targetDoc);
        if (targetDoc.activoParaChat) {
          success(`"${targetDoc.nombre}" activado como contexto para Mentor Chat`);
        } else {
          info(`"${targetDoc.nombre}" desactivado para el chat`);
        }
      }
    },
    [success, info]
  );

  // Eliminar un solo documento
  const deleteDocument = useCallback(
    async (documentId: string) => {
      const doc = documentos.find((d) => d.id === documentId);
      setDocumentos((prev) => prev.filter((d) => d.id !== documentId));
      await deleteDocumentFromStorage(documentId);
      if (previewDocument?.id === documentId) setPreviewDocument(null);
      if (doc) {
        success(`"${doc.nombre}" eliminado correctamente`, 'Documento Eliminado');
      }
    },
    [documentos, previewDocument, success]
  );

  // Eliminar múltiples documentos seleccionados
  const deleteMultipleDocuments = useCallback(
    async (documentIds: string[]) => {
      if (documentIds.length === 0) return;
      setDocumentos((prev) => prev.filter((d) => !documentIds.includes(d.id)));
      for (const id of documentIds) {
        await deleteDocumentFromStorage(id);
      }
      if (previewDocument && documentIds.includes(previewDocument.id)) {
        setPreviewDocument(null);
      }
      success(
        `${documentIds.length} documento(s) eliminados correctamente.`,
        'Operación por Lote'
      );
    },
    [previewDocument, success]
  );

  // Activar todos los documentos de una materia o global
  const activateAllDocuments = useCallback(
    async (materiaId?: string) => {
      const updatedDocs = documentos.map((d) => {
        if (!materiaId || d.materiaId === materiaId) {
          return { ...d, activoParaChat: true };
        }
        return d;
      });

      setDocumentos(updatedDocs);
      for (const d of updatedDocs) {
        if (!materiaId || d.materiaId === materiaId) {
          await saveDocumentToStorage(d);
        }
      }
      success('Todos los documentos seleccionados han sido activados para el chat.');
    },
    [documentos, success]
  );

  // Desactivar todos los documentos
  const deactivateAllDocuments = useCallback(
    async (materiaId?: string) => {
      const updatedDocs = documentos.map((d) => {
        if (!materiaId || d.materiaId === materiaId) {
          return { ...d, activoParaChat: false };
        }
        return d;
      });

      setDocumentos(updatedDocs);
      for (const d of updatedDocs) {
        if (!materiaId || d.materiaId === materiaId) {
          await saveDocumentToStorage(d);
        }
      }
      info('Documentos desactivados del contexto de chat.');
    },
    [documentos, info]
  );

  const openPreview = useCallback((doc: DocumentoItem) => {
    setPreviewDocument(doc);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewDocument(null);
  }, []);

  return (
    <MateriasContext.Provider
      value={{
        materias,
        selectedMateria,
        setSelectedMateria,
        documentos,
        documentosByMateria,
        documentosActivosParaChat,
        isLoadingMaterias,
        isLoadingDocs,
        uploadDocument,
        toggleDocumentActive,
        deleteDocument,
        deleteMultipleDocuments,
        activateAllDocuments,
        deactivateAllDocuments,
        previewDocument,
        openPreview,
        closePreview,
        refreshMaterias,
      }}
    >
      {children}
    </MateriasContext.Provider>
  );
};

export const useMaterias = () => {
  const context = useContext(MateriasContext);
  if (!context) {
    throw new Error('useMaterias debe ser utilizado dentro de un MateriasProvider');
  }
  return context;
};
