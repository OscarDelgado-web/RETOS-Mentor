import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MentorChatPage } from './MentorChatPage';
import { AuthProvider } from '../context/AuthContext';
import { ToastProvider } from '../context/ToastContext';
import { ChatProvider } from '../context/ChatContext';
import { BrowserRouter } from 'react-router-dom';
import { api } from '../services/api';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ToastProvider>
      <AuthProvider>
        <ChatProvider>
          <BrowserRouter>{ui}</BrowserRouter>
        </ChatProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

describe('MentorChatPage Component (BUG-001, BUG-005, QA-09, AC-08)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    vi.spyOn(api, 'getCareers').mockResolvedValue([
      { id: 1, name: 'Desarrollo de Software' },
    ]);
    vi.spyOn(api, 'getSubjects').mockResolvedValue([
      { id: 1, careerId: 1, name: 'Bases de Datos' },
    ]);
    vi.spyOn(api, 'getTopics').mockResolvedValue([
      { id: 1, subjectId: 1, name: 'JOIN' },
    ]);
  });

  it('renderiza el selector de contexto en cascada y los controles de envío', async () => {
    renderWithProviders(<MentorChatPage />);

    await waitFor(() => {
      expect(screen.getByLabelText(/1\. Carrera/i)).toBeDefined();
      expect(screen.getByLabelText(/2\. Asignatura/i)).toBeDefined();
      expect(screen.getByLabelText(/3\. Tema/i)).toBeDefined();
      expect(screen.getByLabelText(/Enviar mensaje/i)).toBeDefined();
    });
  });

  it('bloquea el botón de envío si el input está en blanco', async () => {
    renderWithProviders(<MentorChatPage />);

    await waitFor(() => {
      const sendBtn = screen.getByLabelText(/Enviar mensaje/i) as HTMLButtonElement;
      expect(sendBtn.disabled).toBe(true);
    });
  });

  it('alerta y bloquea el envío si se superan los 2,000 caracteres', async () => {
    renderWithProviders(<MentorChatPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Escribe tu consulta/i)).toBeDefined();
    });

    const textarea = screen.getByPlaceholderText(/Escribe tu consulta/i);
    const longText = 'A'.repeat(2001);

    fireEvent.change(textarea, { target: { value: longText } });

    await waitFor(() => {
      expect(screen.getByText(/2001 \/ 2,000 caracteres/i)).toBeDefined();
      expect(screen.getByText(/Límite superado/i)).toBeDefined();
      const sendBtn = screen.getByLabelText(/Enviar mensaje/i) as HTMLButtonElement;
      expect(sendBtn.disabled).toBe(true);
    });
  });

  it('habilita el botón de envío cuando hay texto válido y tema seleccionado', async () => {
    renderWithProviders(<MentorChatPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Escribe tu consulta/i)).toBeDefined();
    });

    const textarea = screen.getByPlaceholderText(/Escribe tu consulta/i);
    fireEvent.change(textarea, { target: { value: '¿Qué es una clave foránea?' } });

    await waitFor(() => {
      const sendBtn = screen.getByLabelText(/Enviar mensaje/i) as HTMLButtonElement;
      expect(sendBtn.disabled).toBe(false);
    });
  });

  it('renderiza la respuesta del mentor y las fuentes académicas con enlaces seguros', async () => {
    vi.spyOn(api, 'sendMentorMessage').mockResolvedValueOnce({
      answer: 'Un INNER JOIN devuelve filas cuando hay coincidencia en ambas tablas.',
      sources: [
        {
          id: 'src-1',
          title: 'Documentación de PostgreSQL',
          description: 'Tutorial detallado sobre JOINs y restricciones de integridad.',
          url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html',
        },
      ],
      sessionId: 123,
    });

    renderWithProviders(<MentorChatPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Escribe tu consulta/i)).toBeDefined();
    });

    const textarea = screen.getByPlaceholderText(/Escribe tu consulta/i);
    fireEvent.change(textarea, { target: { value: '¿Cómo funciona un INNER JOIN?' } });

    const sendBtn = screen.getByLabelText(/Enviar mensaje/i);
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/Un INNER JOIN devuelve filas/i)).toBeDefined();
      expect(screen.getByText(/Fuentes Académicas/i)).toBeDefined();
      expect(screen.getByText(/Documentación de PostgreSQL/i)).toBeDefined();
      expect(screen.getByText(/Tutorial detallado sobre JOINs/i)).toBeDefined();
    });

    const link = screen.getByRole('link', { name: /Consultar/i }) as HTMLAnchorElement;
    expect(link.href).toBe('https://www.postgresql.org/docs/current/queries-table-expressions.html');
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener noreferrer');
  });

  it('muestra alerta de error visible con botón de reintentar ante fallos de conexión', async () => {
    const error: any = new Error('El servidor backend está detenido o no responde.');
    error.status = 503;
    vi.spyOn(api, 'sendMentorMessage').mockRejectedValueOnce(error);

    renderWithProviders(<MentorChatPage />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Escribe tu consulta/i)).toBeDefined();
    });

    const textarea = screen.getByPlaceholderText(/Escribe tu consulta/i);
    fireEvent.change(textarea, { target: { value: 'Consulta con backend caído' } });

    const sendBtn = screen.getByLabelText(/Enviar mensaje/i);
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(screen.getByText(/Error al consultar el Mentor/i)).toBeDefined();
      expect(screen.getByText(/HTTP 503/i)).toBeDefined();
      expect(screen.getByRole('button', { name: /Reintentar/i })).toBeDefined();
    });
  });
});
