import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import type { ToastNotification } from '../types';

interface ToastContextType {
  toasts: ToastNotification[];
  addToast: (
    tipo: ToastNotification['tipo'],
    mensaje: string,
    titulo?: string,
    duracionMs?: number
  ) => void;
  removeToast: (id: string) => void;
  success: (mensaje: string, titulo?: string) => void;
  warning: (mensaje: string, titulo?: string) => void;
  error: (mensaje: string, titulo?: string) => void;
  info: (mensaje: string, titulo?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (
      tipo: ToastNotification['tipo'],
      mensaje: string,
      titulo?: string,
      duracionMs = 4500
    ) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastNotification = { id, tipo, mensaje, titulo, duracionMs };

      setToasts((prev) => [...prev, newToast]);

      if (duracionMs > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duracionMs);
      }
    },
    [removeToast]
  );

  const success = useCallback(
    (msg: string, title?: string) => addToast('success', msg, title),
    [addToast]
  );
  const warning = useCallback(
    (msg: string, title?: string) => addToast('warning', msg, title),
    [addToast]
  );
  const error = useCallback(
    (msg: string, title?: string) => addToast('error', msg, title),
    [addToast]
  );
  const info = useCallback(
    (msg: string, title?: string) => addToast('info', msg, title),
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, warning, error, info }}
    >
      {children}
      {/* Contenedor flotante de notificaciones */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 md:px-0"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.tipo === 'success';
          const isWarning = toast.tipo === 'warning';
          const isError = toast.tipo === 'error';

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
                isSuccess
                  ? 'bg-[#121a14]/95 border-emerald-500/40 text-emerald-200'
                  : isWarning
                  ? 'bg-[#1f1910]/95 border-amber-500/40 text-amber-200'
                  : isError
                  ? 'bg-[#201214]/95 border-rose-500/40 text-rose-200'
                  : 'bg-[#12161f]/95 border-blue-500/40 text-blue-200'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="text-emerald-400" size={18} />}
                {isWarning && <AlertTriangle className="text-amber-400" size={18} />}
                {isError && <AlertCircle className="text-rose-400" size={18} />}
                {!isSuccess && !isWarning && !isError && (
                  <Info className="text-blue-400" size={18} />
                )}
              </div>
              <div className="flex-1 text-xs">
                {toast.titulo && (
                  <h4 className="font-bold text-white mb-0.5">{toast.titulo}</h4>
                )}
                <p className="leading-relaxed">{toast.mensaje}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Cerrar notificación"
                className="shrink-0 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser utilizado dentro de un ToastProvider');
  }
  return context;
};
