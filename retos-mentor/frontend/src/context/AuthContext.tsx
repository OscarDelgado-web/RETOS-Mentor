import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CAREERS_CATALOG } from '../data/careersCatalog';
import type { StudentSession } from '../types';
import { api } from '../services/api';

const SESSION_STORAGE_KEY = 'retos_mentor_session';

interface AuthContextType {
  session: StudentSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (name: string, careerId: string, customStudentId?: number) => Promise<boolean>;
  logout: () => void;
  switchCareer: (careerId: string) => void;
  backendOnline: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<StudentSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);

  // Inicializar sesión desde localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as StudentSession;
        // Validar que la carrera exista en el catálogo
        const careerFound = CAREERS_CATALOG.find((c) => c.id === parsed.careerId);
        if (careerFound) {
          setSession({
            ...parsed,
            careerName: careerFound.nombre,
            careerBackendId: careerFound.backendId,
          });
        } else {
          // Fallback a primera carrera
          setSession({
            ...parsed,
            careerId: CAREERS_CATALOG[0].id,
            careerName: CAREERS_CATALOG[0].nombre,
            careerBackendId: CAREERS_CATALOG[0].backendId,
          });
        }
      }
    } catch (err) {
      console.warn('Error leyendo sesión de localStorage:', err);
    } finally {
      setIsLoading(false);
    }

    // Comprobar salud del backend en segundo plano
    api.checkBackendHealth().then((isUp) => setBackendOnline(isUp));
  }, []);

  const login = useCallback(
    async (name: string, careerId: string, customStudentId?: number): Promise<boolean> => {
      const trimmedName = name.trim() || 'Estudiante';
      const career =
        CAREERS_CATALOG.find((c) => c.id === careerId) || CAREERS_CATALOG[0];

      let studentId = customStudentId || 1;

      // Si se especificó un ID de estudiante, intentar verificar con el backend
      if (customStudentId) {
        try {
          const backendStudent = await api.getStudent(customStudentId);
          if (backendStudent) {
            studentId = backendStudent.id;
          }
        } catch {
          // Fallback local silencioso si el backend no responde
        }
      }

      const newSession: StudentSession = {
        id: studentId,
        name: trimmedName,
        careerId: career.id,
        careerBackendId: career.backendId,
        careerName: career.nombre,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(trimmedName)}`,
      };

      setSession(newSession);
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSession));
      } catch (err) {
        console.error('Error guardando sesión:', err);
      }

      return true;
    },
    []
  );

  const switchCareer = useCallback((careerId: string) => {
    const career =
      CAREERS_CATALOG.find((c) => c.id === careerId) || CAREERS_CATALOG[0];

    setSession((prev) => {
      if (!prev) return null;
      const updated: StudentSession = {
        ...prev,
        careerId: career.id,
        careerBackendId: career.backendId,
        careerName: career.nombre,
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (err) {
      console.error('Error removiendo sesión:', err);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        isAuthenticated: !!session,
        isLoading,
        login,
        logout,
        switchCareer,
        backendOnline,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
