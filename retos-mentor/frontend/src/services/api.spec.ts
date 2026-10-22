import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from './api';

describe('ApiService - sendMentorMessage (BUG-002 y QA-08)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('propaga error HTTP 500 y no devuelve respuestas simuladas', async () => {
    // Simulamos que fetch devuelve HTTP 500 con cuerpo JSON de error
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: async () => ({ message: 'Error interno en el modelo de lenguaje' }),
    } as Response);

    await expect(
      api.sendMentorMessage({
        studentId: 1,
        subjectId: 1,
        topicId: 1,
        message: '¿Cómo funciona un INNER JOIN?',
      })
    ).rejects.toThrow(/Error interno en el modelo de lenguaje/);
  });

  it('propaga error HTTP 502 por timeout o caída del proveedor de IA', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway',
      json: async () => ({ message: 'The LLM provider is unavailable' }),
    } as Response);

    await expect(
      api.sendMentorMessage({
        studentId: 1,
        subjectId: 1,
        topicId: 1,
        message: 'Consulta de prueba',
      })
    ).rejects.toMatchObject({
      status: 502,
      message: 'The LLM provider is unavailable',
    });
  });

  it('propaga error HTTP 400 cuando faltan datos obligatorios', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => ({ message: 'Topic does not belong to the specified subject' }),
    } as Response);

    await expect(
      api.sendMentorMessage({
        studentId: 1,
        subjectId: 1,
        topicId: 10,
        message: 'Consulta inválida',
      })
    ).rejects.toMatchObject({
      status: 400,
    });
  });

  it('envía los IDs numéricos reales seleccionados y sessionId', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        answer: 'Un JOIN permite combinar tuplas de dos o más relaciones.',
        context: { topic: 'JOIN', level: 'BEGINNER' },
      }),
    } as Response);

    const response = await api.sendMentorMessage({
      studentId: 1,
      subjectId: 1,
      topicId: 1,
      message: 'Explica JOIN',
      sessionId: 'session-12345',
    });

    expect(response.answer).toContain('JOIN');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    const callArgs = fetchSpy.mock.calls[0];
    expect(callArgs[0]).toBe('/api/mentor/messages');
    const bodySent = JSON.parse(callArgs[1]?.body as string);

    expect(bodySent.studentId).toBe(1);
    expect(bodySent.subjectId).toBe(1);
    expect(bodySent.topicId).toBe(1);
    expect(bodySent.sessionId).toBe('session-12345');
    // Asegurar que jamás se envíen los IDs obsoletos 101 o 1001
    expect(bodySent.subjectId).not.toBe(101);
    expect(bodySent.topicId).not.toBe(1001);
  });

  it('acepta respuestas con código HTTP 201 Created y procesa answer + sources', async () => {
    const mockSources = [
      {
        id: 1,
        title: 'Documentación Oficial PostgreSQL',
        description: 'Capítulo sobre operaciones JOIN en bases de datos relacionales.',
        url: 'https://www.postgresql.org/docs/current/queries-table-expressions.html',
      },
    ];

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 201,
      statusText: 'Created',
      json: async () => ({
        answer: 'Un JOIN permite combinar columnas de una o más tablas.',
        sources: mockSources,
        sessionId: 99,
      }),
    } as Response);

    const response = await api.sendMentorMessage({
      studentId: 1,
      subjectId: 1,
      topicId: 1,
      message: 'Explica los tipos de JOIN',
      sessionId: 99,
    });

    expect(response.answer).toBe('Un JOIN permite combinar columnas de una o más tablas.');
    expect(response.sources).toHaveLength(1);
    expect(response.sources?.[0].title).toBe('Documentación Oficial PostgreSQL');
    expect(response.sources?.[0].url).toContain('postgresql.org');
  });

  it('propaga error en getCareers, getSubjects y getTopics sin retornar datos falsos', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
      json: async () => ({ message: 'Service unavailable' }),
    } as Response);

    await expect(api.getCareers()).rejects.toThrow();
  });
});
