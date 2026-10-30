import type { DocumentoItem, DocumentChunk } from '../types';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const CHUNK_SIZE_CHARS = 1000;
const CHUNK_OVERLAP_CHARS = 150;
const DB_NAME = 'RetosMentorDocumentsDB';
const DB_VERSION = 1;
const STORE_NAME = 'documentos';

// ==========================================
// 1. GESTOR DE INDEXED DB (PERSISTENCIA LOCAL)
// ==========================================

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no está disponible en este entorno'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function sanitizeDocForLocalStorage(doc: DocumentoItem): DocumentoItem {
  return {
    ...doc,
    contenidoTextoExtraido: doc.contenidoTextoExtraido.substring(0, 300),
    fragmentos: doc.fragmentos.slice(0, 2),
  };
}

export async function saveDocumentToStorage(doc: DocumentoItem): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(doc);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallo guardando en IndexedDB, usando localStorage como fallback:', err);
    try {
      const stored = getDocumentsFromLocalStorage();
      const filtered = stored.filter((d) => d.id !== doc.id);
      filtered.push(sanitizeDocForLocalStorage(doc));
      localStorage.setItem('retos_mentor_docs_backup', JSON.stringify(filtered));
    } catch (localErr) {
      console.error('Error en fallback localStorage:', localErr);
    }
  }
}

export async function deleteDocumentFromStorage(docId: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(docId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallo eliminando de IndexedDB:', err);
    const stored = getDocumentsFromLocalStorage();
    const filtered = stored.filter((d) => d.id !== docId);
    localStorage.setItem('retos_mentor_docs_backup', JSON.stringify(filtered));
  }
}

export async function loadAllDocumentsFromStorage(): Promise<DocumentoItem[]> {
  try {
    const db = await openDatabase();
    return await new Promise<DocumentoItem[]>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Fallo cargando de IndexedDB, leyendo fallback localStorage:', err);
    return getDocumentsFromLocalStorage();
  }
}

function getDocumentsFromLocalStorage(): DocumentoItem[] {
  try {
    const raw = localStorage.getItem('retos_mentor_docs_backup');
    return raw ? (JSON.parse(raw) as DocumentoItem[]) : [];
  } catch {
    return [];
  }
}

// ==========================================
// 2. EXTRACCIÓN DE TEXTO NATIVA EN NAVEGADOR
// ==========================================

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function detectFileType(file: File): DocumentoItem['tipo'] {
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (ext === 'pdf') return 'pdf';
  if (ext === 'txt') return 'txt';
  if (ext === 'md') return 'md';
  if (ext === 'doc') return 'doc';
  if (ext === 'docx') return 'docx';
  return 'otro';
}

export async function extractTextFromFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const fileType = detectFileType(file);
  onProgress?.(25);

  if (fileType === 'txt' || fileType === 'md') {
    const text = await file.text();
    onProgress?.(80);
    return text;
  }

  // Para PDF y DOCX en cliente, leemos el buffer binario y decodificamos texto legible
  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(50);

  const uint8 = new Uint8Array(arrayBuffer);
  let extracted: string;

  if (fileType === 'pdf') {
    extracted = extractTextFromPdfBuffer(uint8);
  } else if (fileType === 'docx' || fileType === 'doc') {
    extracted = extractTextFromDocxBuffer(uint8);
  } else {
    // Intento genérico de decodificación utf-8 con filtrado
    const decoder = new TextDecoder('utf-8', { fatal: false });
    extracted = decoder.decode(uint8);
  }

  // Si la extracción produjo poco texto (ej. PDF escaneado o binario comprimido sin fuentes),
  // se genera un resumen descriptivo del documento para el contexto del mentor
  if (!extracted || extracted.trim().length < 50) {
    extracted = `[Documento cargado: "${file.name}" (${formatFileSize(
      file.size
    )}) para la asignatura asociada. Contiene material de estudio técnico de referencia.]`;
  }

  onProgress?.(85);
  return extracted;
}

function extractTextFromPdfBuffer(buffer: Uint8Array): string {
  const decoder = new TextDecoder('latin1');
  const str = decoder.decode(buffer);
  const textChunks: string[] = [];

  // 1. Buscar bloques de texto PDF estándar (BT ... ET)
  const btRegex = /BT[\s\S]*?ET/g;
  let match: RegExpExecArray | null;

  while ((match = btRegex.exec(str)) !== null) {
    const block = match[0];
    // Extraer strings de (Texto) Tj
    const tjRegex = /\(([^)]+)\)\s*Tj/g;
    let tjMatch: RegExpExecArray | null;
    while ((tjMatch = tjRegex.exec(block)) !== null) {
      textChunks.push(tjMatch[1]);
    }

    // Extraer strings de array [(T1) 20 (T2)] TJ
    const tjArrayRegex = /\[([^\]]+)\]\s*TJ/g;
    let arrMatch: RegExpExecArray | null;
    while ((arrMatch = tjArrayRegex.exec(block)) !== null) {
      const inner = arrMatch[1];
      const innerTjRegex = /\(([^)]+)\)/g;
      let piece: RegExpExecArray | null;
      while ((piece = innerTjRegex.exec(inner)) !== null) {
        textChunks.push(piece[1]);
      }
    }
  }

  const result = textChunks.join(' ').replace(/\\(\d{3})/g, '').trim();
  if (result.length > 50) {
    return result;
  }

  // Fallback: extraer cadenas alfanuméricas continuas
  const asciiMatches = str.match(/[A-Za-z0-9áéíóúÁÉÍÓÚñÑüÜ,.;:\-_()/"' ]{8,}/g);
  if (asciiMatches && asciiMatches.length > 0) {
    return asciiMatches.slice(0, 300).join(' ');
  }

  return '';
}

function extractTextFromDocxBuffer(buffer: Uint8Array): string {
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const raw = decoder.decode(buffer);

  // En docx (OpenXML), el texto está dentro de etiquetas <w:t> o <w:t xml:space="...">
  const wtRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g;
  const pieces: string[] = [];
  let m: RegExpExecArray | null;

  while ((m = wtRegex.exec(raw)) !== null) {
    pieces.push(m[1]);
  }

  if (pieces.length > 0) {
    return pieces.join(' ');
  }

  // Fallback para .doc o sin etiquetas explícitas
  const asciiMatches = raw.match(/[A-Za-z0-9áéíóúÁÉÍÓÚñÑüÜ,.;:\-_()/"' ]{6,}/g);
  return asciiMatches ? asciiMatches.slice(0, 200).join(' ') : '';
}

// ==========================================
// 3. FRAGMENTACIÓN INTELIGENTE (CHUNKING)
// ==========================================

export function chunkExtractedText(documentId: string, fullText: string): DocumentChunk[] {
  const clean = fullText.replace(/\r\n/g, '\n').trim();
  if (!clean) return [];

  const chunks: DocumentChunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < clean.length) {
    let endIndex = startIndex + CHUNK_SIZE_CHARS;

    // Intentar cortar en un salto de párrafo o punto para no cortar oraciones a la mitad
    if (endIndex < clean.length) {
      const nextNewline = clean.lastIndexOf('\n', endIndex);
      const nextPeriod = clean.lastIndexOf('. ', endIndex);
      const bestCut = Math.max(nextNewline, nextPeriod);

      if (bestCut > startIndex + CHUNK_SIZE_CHARS / 2) {
        endIndex = bestCut + 1;
      }
    } else {
      endIndex = clean.length;
    }

    const chunkText = clean.substring(startIndex, endIndex).trim();
    if (chunkText.length > 20) {
      chunks.push({
        id: `${documentId}-chunk-${chunkIndex}`,
        documentId,
        chunkIndex,
        text: chunkText,
        tokenCountEstimate: Math.ceil(chunkText.length / 4),
      });
      chunkIndex++;
    }

    startIndex = endIndex - CHUNK_OVERLAP_CHARS;
    if (startIndex >= clean.length) break;
  }

  return chunks;
}

// ==========================================
// 4. BÚSQUEDA DE RELEVANCIA EN FRAGMENTOS
// ==========================================

export interface RelevantChunkResult {
  documentId: string;
  documentName: string;
  materiaNombre: string;
  chunk: DocumentChunk;
  score: number;
}

export function findRelevantChunks(
  query: string,
  activeDocuments: DocumentoItem[],
  maxResults = 3
): RelevantChunkResult[] {
  if (!query || activeDocuments.length === 0) return [];

  const queryTerms = query
    .toLowerCase()
    .replace(/[^\w\sáéíóúñü]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (queryTerms.length === 0) return [];

  const results: RelevantChunkResult[] = [];

  for (const doc of activeDocuments) {
    if (!doc.activoParaChat || doc.estado !== 'listo') continue;

    for (const chunk of doc.fragmentos) {
      const lowerChunk = chunk.text.toLowerCase();
      let score = 0;

      for (const term of queryTerms) {
        if (lowerChunk.includes(term)) {
          // Contar frecuencia simple
          const matches = lowerChunk.split(term).length - 1;
          score += matches * 2;
        }
      }

      // Bonus si coincide con el nombre del documento o materia
      if (doc.nombre.toLowerCase().includes(queryTerms[0])) score += 3;
      if (doc.materiaNombre.toLowerCase().includes(queryTerms[0])) score += 3;

      if (score > 0) {
        results.push({
          documentId: doc.id,
          documentName: doc.nombre,
          materiaNombre: doc.materiaNombre,
          chunk,
          score,
        });
      }
    }
  }

  // Ordenar por score descendente
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, maxResults);
}

// ==========================================
// 5. VALIDACIÓN DE ARCHIVO
// ==========================================

export function validateUploadFile(file: File): { isValid: boolean; error?: string } {
  const allowedExtensions = ['pdf', 'txt', 'doc', 'docx', 'md'];
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  if (!allowedExtensions.includes(ext)) {
    return {
      isValid: false,
      error: `Formato ".${ext}" no soportado. Formatos válidos: PDF, TXT, DOC, DOCX, MD.`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: `El archivo "${file.name}" (${formatFileSize(
        file.size
      )}) supera el límite máximo permitido de 10 MB.`,
    };
  }

  return { isValid: true };
}
